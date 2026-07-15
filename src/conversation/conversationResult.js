export class ConversationResult {
  constructor({ success = false, state = null, intent = null, response = null, metadata = {}, nextState = null, sessionStatus = 'ACTIVE', serviceResult = null } = {}) {
    this.success = success;
    this.state = state;
    this.intent = intent;
    this.response = response;
    this.metadata = metadata;
    this.nextState = nextState;
    this.sessionStatus = sessionStatus;
    this.serviceResult = serviceResult;
  }
}
