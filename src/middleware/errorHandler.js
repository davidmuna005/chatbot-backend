import logger from '../utils/logger.js';

export function notFoundHandler(req, res, next) {
  res.status(404).json({ error: 'Route not found' });
  next();
}

export function errorHandler(err, req, res, next) {
  logger.error(err.message, { stack: err.stack, url: req.originalUrl });
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
}
