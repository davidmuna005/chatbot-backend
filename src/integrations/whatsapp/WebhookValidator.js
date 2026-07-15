export class WebhookValidator {
  validate(payload = {}) {
    const errors = [];

    if (!payload || typeof payload !== 'object') {
      errors.push('Payload must be an object.');
      return { valid: false, errors };
    }

    if (payload.object !== 'whatsapp_business_account') {
      errors.push('Unexpected payload object.');
    }

    if (!Array.isArray(payload.entry) || payload.entry.length === 0) {
      errors.push('Payload must contain an entry array.');
    }

    const change = payload.entry?.[0]?.changes?.[0];
    if (!change || typeof change.value !== 'object') {
      errors.push('Payload entry changes must contain a value object.');
    }

    const value = change?.value;
    const hasMessage = Array.isArray(value?.messages) && value.messages.length > 0;
    const hasStatus = Array.isArray(value?.statuses) && value.statuses.length > 0;

    if (!hasMessage && !hasStatus) {
      errors.push('Payload must contain a message or status update.');
    }

    return { valid: errors.length === 0, errors };
  }
}
