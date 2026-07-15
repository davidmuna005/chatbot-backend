import { RESPONSE_TYPES } from '../../conversation/responseBuilder.js';

const stringifyData = (data) => {
  if (data === null || data === undefined) {
    return '';
  }

  if (typeof data === 'string') {
    return data;
  }

  try {
    return JSON.stringify(data, null, 2);
  } catch {
    return String(data);
  }
};

export class WhatsAppResponseAdapter {
  toProviderPayload(conversationResult, recipientId) {
    const response = conversationResult?.response || {};
    const payload = response.payload || {};
    const text = payload.text || 'Unable to process response.';
    const dataText = stringifyData(payload.data);

    switch (response.responseType) {
      case RESPONSE_TYPES.MENU:
        return this._buildListMessage(recipientId, payload.title || 'Please select an option', payload.options || []);
      case RESPONSE_TYPES.BUTTONS:
        return this._buildButtonMessage(recipientId, text, payload.buttons || []);
      case RESPONSE_TYPES.CONFIRMATION:
      case RESPONSE_TYPES.AUTH_REQUEST:
      case RESPONSE_TYPES.OTP_REQUEST:
      case RESPONSE_TYPES.INFO:
      case RESPONSE_TYPES.TEXT:
      case RESPONSE_TYPES.ERROR:
      default:
        return this._buildTextMessage(recipientId, text, dataText);
    }
  }

  _buildTextMessage(recipientId, text, dataText = '') {
    const body = [text, dataText].filter(Boolean).join('\n\n');
    return {
      messaging_product: 'whatsapp',
      to: recipientId,
      type: 'text',
      text: {
        body
      }
    };
  }

  _buildListMessage(recipientId, title, options = []) {
    const sections = [
      {
        title: title || 'Menu',
        rows: options.map((option, index) => ({
          id: option.id,
          title: `${index + 1}. ${option.label}`,
          description: option.description || option.label
        }))
      }
    ];

    return {
      messaging_product: 'whatsapp',
      to: recipientId,
      type: 'interactive',
      interactive: {
        type: 'list',
        header: {
          type: 'text',
          text: title || 'Please select an option'
        },
        body: {
          text: 'Choose one of the following options:'
        },
        footer: {
          text: 'Reply with the option number or select from the list.'
        },
        action: {
          button: 'View Options',
          sections
        }
      }
    };
  }

  _buildButtonMessage(recipientId, text, buttons = []) {
    return {
      messaging_product: 'whatsapp',
      to: recipientId,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text },
        action: {
          buttons: buttons.slice(0, 3).map((button) => ({
            type: 'reply',
            reply: {
              id: button.id,
              title: button.label
            }
          }))
        }
      }
    };
  }
}
