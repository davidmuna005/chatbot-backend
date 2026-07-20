export const resolveListenHost = ({ argv = process.argv.slice(2), env = process.env } = {}) => {
  const hostFlagIndex = argv.indexOf('--host');

  if (hostFlagIndex >= 0 && argv[hostFlagIndex + 1]) {
    return argv[hostFlagIndex + 1];
  }

  if (env.HOST) {
    return env.HOST;
  }

  return '0.0.0.0';
};
