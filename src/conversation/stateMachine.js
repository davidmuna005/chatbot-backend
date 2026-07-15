const STATE_DEFINITIONS = {
  START: {
    allowedCommands: ['SHOW_MAIN_MENU', 'UNKNOWN_COMMAND', 'BEGIN_AUTHENTICATION', 'LOGOUT'],
    next: 'MAIN_MENU',
    failure: 'START',
    timeout: 'EXPIRED'
  },
  MAIN_MENU: {
    allowedCommands: ['BEGIN_AUTHENTICATION', 'SHOW_MAIN_MENU', 'FEE_BALANCE', 'ATTENDANCE', 'RESULTS', 'DISCIPLINE', 'SCHOOL_CALENDAR', 'ANNOUNCEMENTS', 'SUPPORT_TICKET', 'PHONE_UPDATE', 'LOGOUT', 'UNKNOWN_COMMAND'],
    next: 'AUTHENTICATION',
    failure: 'MAIN_MENU',
    timeout: 'EXPIRED'
  },
  AUTHENTICATION: {
    allowedCommands: ['VALIDATE_NATIONAL_ID', 'LOGOUT', 'UNKNOWN_COMMAND'],
    next: 'OTP_VERIFICATION',
    failure: 'AUTHENTICATION',
    timeout: 'EXPIRED'
  },
  OTP_VERIFICATION: {
    allowedCommands: ['VERIFY_OTP', 'LOGOUT', 'UNKNOWN_COMMAND'],
    next: 'AUTHENTICATED',
    failure: 'OTP_VERIFICATION',
    timeout: 'EXPIRED'
  },
  AUTHENTICATED: {
    allowedCommands: ['SELECT_STUDENT', 'LOGOUT', 'UNKNOWN_COMMAND'],
    next: 'SELECT_STUDENT',
    failure: 'AUTHENTICATED',
    timeout: 'EXPIRED'
  },
  SELECT_STUDENT: {
    allowedCommands: ['SELECT_STUDENT', 'LOGOUT', 'UNKNOWN_COMMAND'],
    next: 'SERVICE_SELECTION',
    failure: 'SELECT_STUDENT',
    timeout: 'EXPIRED'
  },
  SERVICE_SELECTION: {
    allowedCommands: ['FEE_BALANCE', 'ATTENDANCE', 'RESULTS', 'DISCIPLINE', 'SCHOOL_CALENDAR', 'ANNOUNCEMENTS', 'SUPPORT_TICKET', 'PHONE_UPDATE', 'LOGOUT', 'UNKNOWN_COMMAND'],
    next: 'SERVICE_RESPONSE',
    failure: 'SERVICE_SELECTION',
    timeout: 'EXPIRED'
  },
  SERVICE_RESPONSE: {
    allowedCommands: ['SHOW_MAIN_MENU', 'LOGOUT', 'UNKNOWN_COMMAND'],
    next: 'MAIN_MENU',
    failure: 'SERVICE_RESPONSE',
    timeout: 'EXPIRED'
  },
  EXPIRED: {
    allowedCommands: ['SHOW_MAIN_MENU', 'LOGOUT', 'UNKNOWN_COMMAND'],
    next: 'START',
    failure: 'EXPIRED',
    timeout: 'EXPIRED'
  }
};

export class StateMachine {
  constructor({ stateDefinitions = STATE_DEFINITIONS } = {}) {
    this.stateDefinitions = stateDefinitions;
  }

  canTransition(currentState, command) {
    const stateDef = this.stateDefinitions[currentState];
    if (!stateDef) {
      return false;
    }
    return stateDef.allowedCommands.includes(command) || stateDef.allowedCommands.includes('UNKNOWN_COMMAND');
  }

  nextState(currentState, command) {
    const stateDef = this.stateDefinitions[currentState];
    if (!stateDef) {
      return 'START';
    }

    if (!this.canTransition(currentState, command)) {
      return stateDef.failure;
    }

    if (command === 'SHOW_MAIN_MENU') {
      return 'MAIN_MENU';
    }

    if (command === 'BEGIN_AUTHENTICATION') {
      return 'AUTHENTICATION';
    }

    if (command === 'VALIDATE_NATIONAL_ID') {
      return 'OTP_VERIFICATION';
    }

    if (command === 'VERIFY_OTP') {
      return 'AUTHENTICATED';
    }

    if (command === 'SELECT_STUDENT') {
      return 'SERVICE_SELECTION';
    }

    if (['FEE_BALANCE', 'ATTENDANCE', 'RESULTS', 'DISCIPLINE', 'SCHOOL_CALENDAR', 'ANNOUNCEMENTS', 'SUPPORT_TICKET', 'PHONE_UPDATE'].includes(command)) {
      return 'SERVICE_RESPONSE';
    }

    if (command === 'LOGOUT') {
      return 'START';
    }

    return stateDef.next;
  }

  isValid({ currentState, command }) {
    return this.canTransition(currentState, command);
  }
}
