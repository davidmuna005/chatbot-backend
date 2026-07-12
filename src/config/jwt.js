import { environment } from './environment.js';

export const jwt = {
  secret: environment.JWT_SECRET,
  expiresIn: environment.JWT_EXPIRES_IN
};
