import { Router } from 'express';
import { WebhookVerifier } from '../../integrations/whatsapp/WebhookVerifier.js';
import { WebhookValidator } from '../../integrations/whatsapp/WebhookValidator.js';
import { WhatsAppMessageAdapter } from '../../integrations/whatsapp/WhatsAppMessageAdapter.js';
import { WhatsAppResponseAdapter } from '../../integrations/whatsapp/WhatsAppResponseAdapter.js';
import { WhatsAppClient } from '../../integrations/whatsapp/WhatsAppClient.js';

const router = Router();

export default function createWhatsAppWebhookRouter(dependencies = {}) {
  const {
    config,
    logger,
    messageProcessor,
    notificationRepository,
    whatsappClient,
    whitelist = []
  } = dependencies;

  const verifier = new WebhookVerifier({
    verifyToken: config.whatsapp?.verifyToken,
    appSecret: config.whatsapp?.appSecret,
    logger
  });
  const validator = new WebhookValidator();
  const messageAdapter = new WhatsAppMessageAdapter();
  const responseAdapter = new WhatsAppResponseAdapter();
  const client = whatsappClient || new WhatsAppClient({
    apiUrl: config.whatsapp?.apiUrl,
    apiKey: config.whatsapp?.apiKey,
    provider: config.whatsapp?.provider || 'meta',
    accountSid: config.whatsapp?.accountSid,
    authToken: config.whatsapp?.authToken,
    phoneNumberId: config.whatsapp?.phoneNumberId,
    fromNumber: config.whatsapp?.fromNumber,
    logger
  });

  router.get('/', (req, res) => {
    const challenge = verifier.verifyChallenge(req.query);
    if (!challenge) {
      return res.status(403).send('Forbidden');
    }
    return res.status(200).send(challenge);
  });

  router.post('/', async (req, res, next) => {
    try {
      if (!verifier.verifySignature(req)) {
        return res.status(401).json({ success: false, error: 'Invalid signature' });
      }

      const payload = req.body;
      const validation = validator.validate(payload);
      if (!validation.valid) {
        logger?.warn?.('Invalid WhatsApp webhook payload', { errors: validation.errors });
        return res.status(400).json({ success: false, errors: validation.errors });
      }

      const normalized = messageAdapter.normalize(payload);
      if (normalized.type === 'unsupported') {
        logger?.info?.('Unsupported WhatsApp message type received', { messageType: normalized.metadata.messageType });
        return res.status(200).json({ success: true, received: true, unsupported: true });
      }

      const conversationResult = await messageProcessor.process(normalized);
      const responsePayload = responseAdapter.toProviderPayload(conversationResult, normalized.senderId);
      await client.send(responsePayload);

      return res.status(200).json({ success: true, delivered: true });
    } catch (error) {
      logger?.error?.('WhatsApp webhook processing failed', { message: error.message, stack: error.stack });
      return next(error);
    }
  });

  return router;
}
