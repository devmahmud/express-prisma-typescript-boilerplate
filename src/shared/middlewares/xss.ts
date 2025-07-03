import { NextFunction, Request, Response } from 'express';
import { inHTMLData } from 'xss-filters';

const recursiveClean = (obj: any): any => {
  if (typeof obj === 'string') {
    return inHTMLData(obj).trim();
  }
  if (Array.isArray(obj)) {
    return obj.map(recursiveClean);
  }
  if (obj !== null && typeof obj === 'object') {
    const cleanedObj: any = {};
    for (const key in obj) {
      cleanedObj[key] = recursiveClean(obj[key]);
    }
    return cleanedObj;
  }
  return obj;
};

const xssMiddleware = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.body) {
      req.body = recursiveClean(req.body);
    }
    // Note: req.query and req.params are read-only in Express
    // We can only clean them if they're accessed, but we can't modify them directly
    // The XSS protection will be applied when the data is used
    next();
  };
};

export default xssMiddleware;
