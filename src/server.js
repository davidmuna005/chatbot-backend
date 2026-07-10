import { httpServer } from './app.js';
import logger from './utils/logger.js';

const startServer = (port) => {
  httpServer.once('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      logger.warn(`Port ${port} is busy, trying ${port + 1}`);
      startServer(port + 1);
      return;
    }

    logger.error('Server failed to start', { error: error.message });
    process.exit(1);
  });

  httpServer.listen(port, () => {
    logger.info(`Server listening on port ${port}`);
  });
};

startServer(Number(process.env.PORT || 4001));
