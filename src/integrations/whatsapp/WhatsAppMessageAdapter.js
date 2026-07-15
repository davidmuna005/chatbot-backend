export class WhatsAppMessageAdapter {
  normalize(payload = {}) {
    const entry = payload.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value || {};
    const metadata = {
      provider: 'whatsapp',
      raw: payload,
      providerEventId: null,
      messageType: null
    };

    if (Array.isArray(value.statuses) && value.statuses.length > 0) {
      const status = value.statuses[0];
      metadata.providerEventId = status.id;
      metadata.messageType = 'status';
      return {
        type: 'status',
        eventType: status.status,
        sessionId: status.id,
        channel: 'whatsapp',
        source: 'whatsapp',
        senderId: status.recipient_id || status.recipient_id || null,
        text: null,
        metadata: {
          ...metadata,
          status
        }
      };
    }

    const message = value.messages?.[0];
    if (!message) {
      return {
        type: 'unsupported',
        sessionId: null,
        channel: 'whatsapp',
        source: 'whatsapp',
        senderId: null,
        text: null,
        metadata: {
          ...metadata,
          supported: false
        }
      };
    }

    const senderId = message.from;
    metadata.providerEventId = message.id;
    metadata.messageType = message.type;

    let text = '';
    let messageType = message.type;

    switch (message.type) {
      case 'text':
        text = message.text?.body || '';
        break;
      case 'interactive':
        if (message.interactive?.type === 'list_reply') {
          text = message.interactive.list_reply?.title || message.interactive.list_reply?.id || '';
        } else if (message.interactive?.type === 'button_reply') {
          text = message.interactive.button_reply?.title || message.interactive.button_reply?.id || '';
        } else {
          text = message.interactive?.body?.text || '';
        }
        break;
      case 'button':
        text = message.button?.text || message.button?.payload || '';
        break;
      case 'document':
      case 'image':
      case 'video':
      case 'audio':
      case 'location':
        text = message.type;
        break;
      default:
        text = message.text?.body || '';
    }

    return {
      type: messageType,
      sessionId: message.id,
      channel: 'whatsapp',
      source: 'whatsapp',
      senderId,
      text,
      metadata: {
        ...metadata,
        providerContact: value.contacts?.[0] || null,
        message
      }
    };
  }
}
