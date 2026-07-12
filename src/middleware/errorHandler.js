import logger from '../utils/logger.js';

export const createNotFoundHandler = () => (req, res) => {
  res.status(404).json({ error: 'Not Found' });
};

export const createErrorHandler = (environment) => (err, req, res, _next) => {
  const status = err.status || 500;
  const response = {
    error: err.message || 'Internal Server Error'
  };

  if (environment.NODE_ENV !== 'production') {
    response.stack = err.stack;
  }

  logger.error('Unhandled error', {
    message: err.message,
    status,
    requestId: req.id,
    url: req.originalUrl,
    stack: environment.NODE_ENV !== 'production' ? err.stack : undefined
  });

  res.status(status).json(response);
};
