import { ConversationContext } from './conversationContext.js';

const DEFAULT_TIMEOUT_SECONDS = 600;

export class SessionManager {
  constructor({ sessionRepository, clock = () => new Date() }) {
    this.sessionRepository = sessionRepository;
    this.clock = clock;
  }

  async loadSession({ sessionId, channel, source, senderId }) {
    let session = null;

    if (sessionId) {
      session = await this.sessionRepository.find({ sessionId });
    }

    if (!session && senderId) {
      session = await this.sessionRepository.find({ channel, senderId });
    }

    if (!session) {
      session = {
        sessionId: sessionId || null,
        channel,
        source,
        senderId,
        authenticated: false,
        selectedStudent: null,
        currentMenu: null,
        currentService: null,
        state: 'START',
        intent: null,
        metadata: {},
        variables: {},
        history: [],
        sessionStatus: 'ACTIVE',
        expiresAt: this._calculateExpiration()
      };
    }

    const context = new ConversationContext({ session });
    context.sessionId = session.sessionId || this._generateSessionId();
    context.channel = session.channel;
    context.source = session.source;
    context.senderId = session.senderId;
    context.metadata = session.metadata || {};
    context.variables = session.variables || {};
    context.expiresAt = session.expiresAt || this._calculateExpiration();

    if (this._isExpired(context.expiresAt)) {
      context.sessionStatus = 'EXPIRED';
    }

    return context;
  }

  async saveSession(context) {
    const payload = context.toSessionPayload();
    payload.updatedAt = this.clock().toISOString();
    payload.expiresAt = context.expiresAt || this._calculateExpiration();

    if (context.sessionId && await this._exists(context.sessionId)) {
      await this.sessionRepository.update(payload);
    } else {
      await this.sessionRepository.create(payload);
    }
  }

  async _exists(sessionId) {
    const session = await this.sessionRepository.find({ sessionId });
    return Boolean(session);
  }

  async refreshSession(context) {
    context.expiresAt = this._calculateExpiration();
    if (context.sessionStatus === 'EXPIRED') {
      context.sessionStatus = 'ACTIVE';
    }
    await this.saveSession(context);
  }

  async expireSession(context) {
    context.sessionStatus = 'EXPIRED';
    context.expiresAt = this.clock().toISOString();
    await this.saveSession(context);
  }

  _calculateExpiration() {
    return new Date(this.clock().getTime() + DEFAULT_TIMEOUT_SECONDS * 1000).toISOString();
  }

  _generateSessionId() {
    return `sess_${Math.random().toString(36).slice(2)}_${Date.now()}`;
  }

  _isExpired(expiresAt) {
    if (!expiresAt) return false;
    return this.clock() > new Date(expiresAt);
  }
}
