import { environment } from './environment.js';
import { database } from './database.js';
import { jwt } from './jwt.js';
import { roles } from './roles.js';
import { security } from './security.js';
import { session } from './session.js';
import { otp } from './otp.js';
import { services } from './services.js';
import { sms } from './sms.js';
import { whatsapp } from './whatsapp.js';

export const config = {
  environment,
  database,
  jwt,
  roles,
  security,
  session,
  otp,
  services,
  sms,
  whatsapp
};
