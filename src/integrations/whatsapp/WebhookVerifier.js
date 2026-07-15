import crypto from 'crypto';

export class WebhookVerifier {
  constructor({ verifyToken, appSecret, logger } = {}) {
    this.verifyToken = verifyToken;
    this.appSecret = appSecret;
    this.logger = logger;
  }

  verifyChallenge(query = {}) {
    const mode = query['hub.mode'];
    const token = query['hub.verify_token'];
    const challenge = query['hub.challenge'];

    if (mode === 'subscribe' && token === this.verifyToken) {
      this.logger?.info?.('Webhook verification challenge succeeded', { mode, token: !!token });
      return challenge;
    }

    this.logger?.warn?.('Webhook verification challenge failed', { mode, token: !!token });
    return null;
  }

  verifySignature(req) {
    if (!this.appSecret) {
      return true;
    }

    const signatureHeader = req.headers['x-hub-signature-256'] || req.headers['x-hub-signature'];
    if (!signatureHeader || !req.rawBody) {
      this.logger?.warn?.('Missing webhook signature or raw body');
      return false;
    }

    const expectedSignature = `sha256=${crypto.createHmac('sha256', this.appSecret).update(req.rawBody).digest('hex')}`;

    try {
      const valid = crypto.timingSafeEqual(Buffer.from(signatureHeader), Buffer.from(expectedSignature));
      if (!valid) {
        this.logger?.warn?.('Webhook signature mismatch', { signatureHeader, expectedSignature });
      }
      return valid;
    } catch (error) {
      this.logger?.error?.('Webhook signature verification error', { error: error.message });
      return false;
    }
  }
}
