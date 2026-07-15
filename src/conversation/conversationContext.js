export class ConversationContext {
  constructor({ session = {}, metadata = {}, variables = {} } = {}) {
    this.sessionId = session.sessionId || null;
    this.channel = session.channel || null;
    this.source = session.source || null;
    this.parentId = session.parentId || null;
    this.authenticated = session.authenticated || false;
    this.selectedStudent = session.selectedStudent || null;
    this.currentMenu = session.currentMenu || null;
    this.currentService = session.currentService || null;
    this.state = session.state || 'START';
    this.intent = session.intent || null;
    this.metadata = metadata;
    this.variables = variables;
    this.history = session.history || [];
    this.sessionStatus = session.sessionStatus || 'ACTIVE';
    this.expiresAt = session.expiresAt || null;
  }

  updateFromSession(session) {
    this.sessionId = session.sessionId;
    this.parentId = session.parentId;
    this.authenticated = session.authenticated;
    this.selectedStudent = session.selectedStudent;
    this.currentMenu = session.currentMenu;
    this.currentService = session.currentService;
    this.state = session.state;
    this.intent = session.intent;
    this.sessionStatus = session.sessionStatus;
    this.expiresAt = session.expiresAt;
    this.history = session.history || this.history;
  }

  setState(state) {
    this.state = state;
  }

  setIntent(intent) {
    this.intent = intent;
  }

  addHistory(entry) {
    this.history.push({ ...entry, timestamp: new Date().toISOString() });
  }

  toSessionPayload() {
    return {
      sessionId: this.sessionId,
      channel: this.channel,
      source: this.source,
      senderId: this.senderId,
      parentId: this.parentId,
      authenticated: this.authenticated,
      selectedStudent: this.selectedStudent,
      currentMenu: this.currentMenu,
      currentService: this.currentService,
      state: this.state,
      intent: this.intent,
      metadata: this.metadata,
      variables: this.variables,
      history: this.history,
      sessionStatus: this.sessionStatus,
      expiresAt: this.expiresAt
    };
  }
}
