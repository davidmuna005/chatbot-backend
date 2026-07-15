export class MessageStatusHandler {
  constructor({ logger } = {}) {
    this.logger = logger;
    this.processedEvents = new Set();
  }

  isDuplicate(eventId) {
    if (!eventId) {
      return false;
    }
    if (this.processedEvents.has(eventId)) {
      return true;
    }
    this.processedEvents.add(eventId);
    return false;
  }

  normalizeMessageStatus(payload = {}) {
    return {
      eventId: payload.providerEventId || payload.id || null,
      senderId: payload.senderId || null,
      status: payload.eventType || null,
      raw: payload,
      timestamp: new Date().toISOString()
    };
  }
}
