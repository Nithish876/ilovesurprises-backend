import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { config } from '../config/env';

export const healthRouter = Router();

healthRouter.get('/', async (_req: Request, res: Response) => {
  const startTime = Date.now();
  let dbStatus: 'connected' | 'disconnected' | 'unconfigured' = 'unconfigured';
  let dbLatencyMs: number | null = null;
  let dbError: string | null = null;

   const isDbConfigured =
    config.databaseUrl && !config.databaseUrl.includes('[YOUR-PASSWORD]');

  if (isDbConfigured) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
      dbLatencyMs = Date.now() - startTime;
    } catch (error: any) {
      dbStatus = 'disconnected';
      dbError = error?.message || 'Database connection error';
    }
  }

  const responsePayload = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: config.nodeEnv,
    services: {
      server: 'healthy',
      database: {
        status: dbStatus,
        ...(dbLatencyMs !== null && { latencyMs: dbLatencyMs }),
        ...(dbError && { error: dbError }),
      },
    },
  };

  res.status(200).json(responsePayload);
});
