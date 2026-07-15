import { MenuBuilder, MENU_TYPES } from './menuBuilder.js';

const COMMAND_MAP = {
  GREETING: 'SHOW_MAIN_MENU',
  MENU: 'SHOW_MAIN_MENU',
  AUTHENTICATE: 'BEGIN_AUTHENTICATION',
  VALIDATE_NATIONAL_ID: 'VALIDATE_NATIONAL_ID',
  VERIFY_OTP: 'VERIFY_OTP',
  SELECT_STUDENT: 'SELECT_STUDENT',
  FEE_BALANCE: 'FEE_BALANCE',
  ATTENDANCE: 'ATTENDANCE',
  RESULTS: 'RESULTS',
  DISCIPLINE: 'DISCIPLINE',
  SCHOOL_CALENDAR: 'SCHOOL_CALENDAR',
  ANNOUNCEMENTS: 'ANNOUNCEMENTS',
  SUPPORT_TICKET: 'SUPPORT_TICKET',
  PHONE_UPDATE: 'PHONE_UPDATE',
  LOGOUT: 'LOGOUT',
  NUMERIC_SELECTION: 'NUMERIC_SELECTION'
};

export class CommandRegistry {
  constructor({ commandMap = COMMAND_MAP, menuBuilder = new MenuBuilder() } = {}) {
    this.commandMap = commandMap;
    this.menuBuilder = menuBuilder;
  }

  resolve(intent, context, rawText = '') {
    let command = this.commandMap[intent] || 'UNKNOWN_COMMAND';

    if (intent === 'NUMERIC_SELECTION') {
      const menuType = context.currentMenu === MENU_TYPES.SERVICE ? MENU_TYPES.SERVICE : MENU_TYPES.MAIN;
      const resolvedCommand = this.menuBuilder.getCommandFromInput(rawText, menuType);
      if (resolvedCommand) {
        command = resolvedCommand;
      } else {
        command = 'UNKNOWN_COMMAND';
      }
    }

    return {
      command,
      intent,
      valid: command !== 'UNKNOWN_COMMAND',
      metadata: {
        isAuthenticated: Boolean(context.authenticated),
        currentState: context.state
      }
    };
  }
}
