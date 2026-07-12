export const responseTimeMiddleware = (req, res, next) => {
  const start = process.hrtime();

  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const durationMs = `${(seconds * 1e3 + nanoseconds / 1e6).toFixed(2)}ms`;
    if (!res.headersSent) {
      res.setHeader('X-Response-Time', durationMs);
    }
  });

  next();
};
