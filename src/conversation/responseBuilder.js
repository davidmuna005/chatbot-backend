import { MenuBuilder, MENU_TYPES } from './menuBuilder.js';

export const RESPONSE_TYPES = {
  TEXT: 'TEXT',
  MENU: 'MENU',
  BUTTONS: 'BUTTONS',
  CONFIRMATION: 'CONFIRMATION',
  ERROR: 'ERROR',
  INFO: 'INFO',
  AUTH_REQUEST: 'AUTH_REQUEST',
  OTP_REQUEST: 'OTP_REQUEST',
  INTERACTIVE_LIST: 'INTERACTIVE_LIST'
};

export class ResponseBuilder {
  constructor({ menuBuilder = new MenuBuilder() } = {}) {
    this.menuBuilder = menuBuilder;
  }

  build({ success, state, intent, command, serviceResult, metadata = {}, currentMenu }) {
    const baseResponse = {
      success,
      state,
      intent,
      command,
      metadata,
      serviceResult: serviceResult || null,
      timestamp: new Date().toISOString()
    };

    if (!success) {
      return {
        ...baseResponse,
        responseType: RESPONSE_TYPES.ERROR,
        payload: {
          text: metadata.errorMessage || 'An unsupported request was received. Please try again.'
        }
      };
    }

    switch (command) {
      case 'SHOW_MAIN_MENU':
        return {
          ...baseResponse,
          responseType: RESPONSE_TYPES.MENU,
          payload: {
            title: 'Main Menu',
            text: 'Please select a service:',
            options: this.menuBuilder.getMenu(MENU_TYPES.MAIN)
          }
        };
      case 'BEGIN_AUTHENTICATION':
        return {
          ...baseResponse,
          responseType: RESPONSE_TYPES.AUTH_REQUEST,
          payload: {
            text: 'Please provide your national ID to begin authentication.'
          }
        };
      case 'VALIDATE_NATIONAL_ID':
        return {
          ...baseResponse,
          responseType: RESPONSE_TYPES.OTP_REQUEST,
          payload: {
            text: 'National ID received. Please enter the OTP sent to your registered phone number.'
          }
        };
      case 'VERIFY_OTP':
        return {
          ...baseResponse,
          responseType: RESPONSE_TYPES.CONFIRMATION,
          payload: {
            text: 'OTP verified. You are now authenticated. Please select the student using admission number.'
          }
        };
      case 'SELECT_STUDENT':
        return {
          ...baseResponse,
          responseType: RESPONSE_TYPES.INFO,
          payload: {
            text: 'Please provide the student admission number you want to access.'
          }
        };
      case 'FEE_BALANCE':
      case 'ATTENDANCE':
      case 'RESULTS':
      case 'DISCIPLINE':
      case 'SCHOOL_CALENDAR':
      case 'ANNOUNCEMENTS':
      case 'SUPPORT_TICKET':
      case 'PHONE_UPDATE':
        return {
          ...baseResponse,
          responseType: RESPONSE_TYPES.INFO,
          payload: {
            text: serviceResult?.message || 'Here is the information you requested.',
            data: serviceResult?.data || null
          }
        };
      case 'LOGOUT':
        return {
          ...baseResponse,
          responseType: RESPONSE_TYPES.CONFIRMATION,
          payload: {
            text: 'You have been logged out successfully. Send any message to return to the main menu.'
          }
        };
      case 'UNKNOWN_COMMAND':
      default:
        return {
          ...baseResponse,
          responseType: RESPONSE_TYPES.ERROR,
          payload: {
            text: metadata.errorMessage || 'Sorry, I did not understand that request. Please choose a valid option.'
          }
        };
    }
  }
}
