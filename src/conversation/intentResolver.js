const SUPPORTED_INTENTS = {
  GREETING: ['hi', 'hello', 'hey', 'start'],
  MENU: ['menu', 'options', 'services', 'main menu'],
  AUTHENTICATE: ['authenticate', 'login', 'verify', 'otp'],
  VALIDATE_NATIONAL_ID: ['national id', 'id number', 'id'],
  VERIFY_OTP: ['otp code', 'verify otp', 'code'],
  SELECT_STUDENT: ['student', 'admission number', 'admission no', 'admission', 'student id'],
  FEE_BALANCE: ['fee', 'balance', 'fee balance', 'fees'],
  ATTENDANCE: ['attendance', 'attend', 'present'],
  RESULTS: ['results', 'grades', 'marks', 'academic results'],
  DISCIPLINE: ['discipline', 'conduct', 'behavior', 'behaviour'],
  SCHOOL_CALENDAR: ['calendar', 'school calendar', 'term dates'],
  ANNOUNCEMENTS: ['announce', 'announcements', 'news'],
  SUPPORT_TICKET: ['ticket', 'support', 'help', 'issue'],
  PHONE_UPDATE: ['phone', 'update phone', 'change number'],
  LOGOUT: ['logout', 'sign out', 'exit', 'quit']
};

export class IntentResolver {
  constructor({ supportedIntents = SUPPORTED_INTENTS } = {}) {
    this.supportedIntents = supportedIntents;
  }

  resolve(rawMessage = '', context = {}) {
    const message = String(rawMessage || '').trim().toLowerCase();
    if (!message) {
      return { intent: 'UNKNOWN', confidence: 0, source: 'EMPTY' };
    }

    for (const [intent, phrases] of Object.entries(this.supportedIntents)) {
      if (phrases.some((phrase) => message.includes(phrase))) {
        return { intent, confidence: 1, source: 'KEYWORD' };
      }
    }

    if (/^\d+$/.test(message)) {
      return { intent: 'NUMERIC_SELECTION', confidence: 0.8, source: 'NUMERIC' };
    }

    return { intent: 'UNKNOWN', confidence: 0, source: 'UNSUPPORTED' };
  }
}
