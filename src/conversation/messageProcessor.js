import { ConversationResult } from './conversationResult.js';

export class MessageProcessor {
  constructor({ sessionManager, commandRegistry, intentResolver, stateMachine, responseBuilder, menuBuilder, serviceLayer }) {
    this.sessionManager = sessionManager;
    this.commandRegistry = commandRegistry;
    this.intentResolver = intentResolver;
    this.stateMachine = stateMachine;
    this.responseBuilder = responseBuilder;
    this.menuBuilder = menuBuilder;
    this.serviceLayer = serviceLayer;
  }

  async process(rawMessage) {
    const normalizedMessage = this._normalize(rawMessage);
    const context = await this.sessionManager.loadSession(normalizedMessage.sessionKey);

    if (context.sessionStatus === 'EXPIRED') {
      context.setState('START');
      context.sessionStatus = 'EXPIRED';
      await this.sessionManager.saveSession(context);
      return new ConversationResult({
        success: false,
        state: context.state,
        intent: 'SESSION_EXPIRED',
        response: null,
        metadata: { errorMessage: 'Your session has expired. Please start again.' },
        nextState: 'START',
        sessionStatus: 'EXPIRED'
      });
    }

    const resolvedIntent = this.intentResolver.resolve(normalizedMessage.text, context);
    context.setIntent(resolvedIntent.intent);

    const commandResult = this.commandRegistry.resolve(resolvedIntent.intent, context, normalizedMessage.text);
    const command = commandResult.command;

    if (!this.stateMachine.isValid({ currentState: context.state, command })) {
      const nextState = this.stateMachine.nextState(context.state, 'UNKNOWN_COMMAND');
      context.setState(nextState);
      await this.sessionManager.saveSession(context);
      const result = this.responseBuilder.build({
        success: false,
        state: context.state,
        intent: resolvedIntent.intent,
        command: 'UNKNOWN_COMMAND',
        metadata: { errorMessage: 'Invalid selection for the current step. Please follow the menu prompts.' }
      });
      return new ConversationResult({
        success: false,
        state: context.state,
        intent: resolvedIntent.intent,
        response: result,
        metadata: { errorMessage: 'Invalid selection' },
        nextState,
        sessionStatus: context.sessionStatus
      });
    }

    const nextState = this.stateMachine.nextState(context.state, command);
    context.setState(nextState);
    context.currentMenu = null;

    if (nextState === 'MAIN_MENU') {
      context.currentMenu = 'MAIN';
    }

    if (nextState === 'SERVICE_SELECTION') {
      context.currentMenu = 'SERVICE';
    }

    if (nextState === 'START') {
      context.currentMenu = null;
    }

    const serviceResult = await this._executeService(command, normalizedMessage, context);
    const response = this.responseBuilder.build({
      success: commandResult.valid && serviceResult?.success !== false,
      state: context.state,
      intent: resolvedIntent.intent,
      command,
      serviceResult,
      currentMenu: context.currentMenu,
      metadata: {
        ...commandResult.metadata,
        ...serviceResult?.metadata
      }
    });

    if (command === 'LOGOUT') {
      context.authenticated = false;
      context.parentId = null;
      context.selectedStudent = null;
      context.currentService = null;
      context.currentMenu = null;
      context.intent = null;
      context.sessionStatus = 'ACTIVE';
      context.setState('START');
    }

    if (command === 'VERIFY_OTP' && serviceResult?.success) {
      context.authenticated = true;
      context.parentId = serviceResult.data?.parentId || context.parentId;
    }

    if (command === 'SELECT_STUDENT' && serviceResult?.success) {
      context.selectedStudent = serviceResult.data?.student || context.selectedStudent;
    }

    if (['FEE_BALANCE', 'ATTENDANCE', 'RESULTS', 'DISCIPLINE', 'SCHOOL_CALENDAR', 'ANNOUNCEMENTS', 'SUPPORT_TICKET', 'PHONE_UPDATE'].includes(command)) {
      context.currentService = command;
    }

    context.addHistory({ command, text: normalizedMessage.text, response: response.payload?.text });

    await this.sessionManager.saveSession(context);

    return new ConversationResult({
      success: response.responseType !== 'ERROR',
      state: context.state,
      intent: resolvedIntent.intent,
      response,
      metadata: { ...serviceResult?.metadata },
      nextState,
      sessionStatus: context.sessionStatus,
      serviceResult
    });
  }

  _normalize(rawMessage) {
    const defaultMessage = {
      text: '',
      sessionKey: {},
      metadata: {}
    };

    if (!rawMessage || typeof rawMessage !== 'object') {
      return defaultMessage;
    }

    return {
      text: rawMessage.text ?? rawMessage.message ?? '',
      sessionKey: {
        sessionId: rawMessage.sessionId || null,
        channel: rawMessage.channel || rawMessage.platform || 'UNKNOWN',
        source: rawMessage.source || rawMessage.channel || rawMessage.platform || 'UNKNOWN',
        senderId: rawMessage.senderId || rawMessage.userId || rawMessage.phoneNumber || null
      },
      metadata: rawMessage.metadata || {}
    };
  }

  async _executeService(command, normalizedMessage, context) {
    if (!this.serviceLayer || typeof this.serviceLayer.execute !== 'function') {
      return { success: true, data: null, message: 'No service layer configured', metadata: {} };
    }

    switch (command) {
      case 'VALIDATE_NATIONAL_ID':
        return this.serviceLayer.execute('validateNationalId', { nationalId: normalizedMessage.text, context });
      case 'VERIFY_OTP':
        return this.serviceLayer.execute('verifyOtp', { otp: normalizedMessage.text, context });
      case 'SELECT_STUDENT':
        return this.serviceLayer.execute('selectStudent', { admissionNumber: normalizedMessage.text, context });
      case 'FEE_BALANCE':
        return this.serviceLayer.execute('getFeeBalance', { context });
      case 'ATTENDANCE':
        return this.serviceLayer.execute('getAttendance', { context });
      case 'RESULTS':
        return this.serviceLayer.execute('getResults', { context });
      case 'DISCIPLINE':
        return this.serviceLayer.execute('getDiscipline', { context });
      case 'SCHOOL_CALENDAR':
        return this.serviceLayer.execute('getSchoolCalendar', { context });
      case 'ANNOUNCEMENTS':
        return this.serviceLayer.execute('getAnnouncements', { context });
      case 'SUPPORT_TICKET':
        return this.serviceLayer.execute('createSupportTicket', { context, message: normalizedMessage.text });
      case 'PHONE_UPDATE':
        return this.serviceLayer.execute('updatePhoneNumber', { context, phoneNumber: normalizedMessage.text });
      default:
        return { success: false, data: null, message: 'Unsupported command', metadata: { errorMessage: 'Unsupported command' } };
    }
  }
}
