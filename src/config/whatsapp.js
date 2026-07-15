import { environment } from './environment.js';

export const whatsapp = {
  apiUrl: environment.WHATSAPP_API_URL || null,
  apiKey: environment.WHATSAPP_API_KEY || null,
  verifyToken: environment.WHATSAPP_VERIFY_TOKEN || null,
  appSecret: environment.WHATSAPP_APP_SECRET || null,
  provider: environment.WHATSAPP_PROVIDER || 'meta',
  accountSid: environment.WHATSAPP_ACCOUNT_SID || null,
  authToken: environment.WHATSAPP_AUTH_TOKEN || null,
  phoneNumberId: environment.WHATSAPP_PHONE_NUMBER_ID || null,
  fromNumber: environment.WHATSAPP_FROM_NUMBER || null,
  phoneNumber: environment.WHATSAPP_PHONE_NUMBER || null
};
