export class IntentRouter {
  constructor() {
    this.intents = new Map()
  }

  register(intent, handler) {
    this.intents.set(intent, handler);
  }

  async route(intent, context) {
    const handler = this.intents.get(intent);
    if (!handler) {
      return { intent, response: 'I can help with school communications and analytics.' };
    }

    return handler(context);
  }
}
