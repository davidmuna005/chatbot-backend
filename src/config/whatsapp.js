import { environment } from './environment.js';

export const whatsapp = {
  apiUrl: environment.WHATSAPP_API_URL || null,
  apiKey: environment.WHATSAPP_API_KEY || null
};
