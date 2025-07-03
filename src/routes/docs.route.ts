import express from 'express';
import swaggerUi from 'swagger-ui-express';

import { openApiDocument } from '@/openapi';

const router = express.Router();

router.use('/', swaggerUi.serve);
router.get(
  '/',
  swaggerUi.setup(openApiDocument, {
    explorer: true,
  })
);

export default router;
