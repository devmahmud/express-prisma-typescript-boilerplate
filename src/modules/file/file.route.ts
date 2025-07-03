import { Router } from 'express';

import auth from '@/shared/middlewares/auth';

const router = Router();

router.post('/upload', auth(), (req, res) => {
  // Placeholder for file upload functionality
  res.status(200).json({
    message: 'File upload endpoint - implement your file upload logic here',
  });
});

export default router;
