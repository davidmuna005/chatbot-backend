import { environment } from './environment.js';

export const sms = {
  provider: environment.SMS_PROVIDER || null,
  apiKey: environment.SMS_API_KEY || null,
  sender: environment.SMS_SENDER || null
};
