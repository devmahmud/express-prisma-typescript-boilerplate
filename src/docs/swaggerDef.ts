import { name, version } from '../../package.json';

const swaggerDef = {
  openapi: '3.0.0',
  info: {
    title: `${name} API documentation`,
    version,
  },
  servers: [
    {
      url: '/v1',
    },
  ],
};

export default swaggerDef;
