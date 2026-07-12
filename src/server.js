import { initializeLogger, logger } from './utils/logger.js';

initializeLogger();

import('./bootstrap.js')
  .then(({ bootstrap }) => bootstrap())
  .catch((error) => {
    logger.error('Bootstrap failed', { message: error.message, stack: error.stack });
    process.exit(1);
  });
