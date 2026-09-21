import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { apiRouter } from './routes';
import { healthRouter } from './routes/health.route';
import { notFoundHandler, errorHandler } from './middleware/error.middleware';

export const createApp = (): Application => {
  const app = express();
 
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
 
  app.get('/', (_req: Request, res: Response) => {
    res.json({
      name: 'ilovesurprises-backend',
      version: '1.0.0',
      status: 'running',
      endpoints: {
        health: '/health',
        api: '/api',
      },
    });
  });
 
  app.use('/health', healthRouter);
  app.use('/api', apiRouter);
 45
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export default createApp;
