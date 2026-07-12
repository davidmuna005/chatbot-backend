export const requestLogger = (logger) => (req, _res, next) => {
  logger.info('Incoming request', {
    method: req.method,
    url: req.originalUrl,
    requestId: req.id,
    ip: req.ip
  });
  next();
};
