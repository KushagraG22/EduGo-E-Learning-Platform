import app from './app';
import { config } from './config/env';
import { connectDB } from './config/db';
import { logger } from './utils/logger';

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(config.port, () => {
      logger.info(`===============================================`);
      logger.info(`  EduGo API Server Running`);
      logger.info(`  URL: http://localhost:${config.port}`);
      logger.info(`  Health: http://localhost:${config.port}/api/health`);
      logger.info(`  Environment: ${config.nodeEnv}`);
      logger.info(`===============================================`);
    });

    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
