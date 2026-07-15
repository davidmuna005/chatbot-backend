export class WhatsAppClient {
  constructor({ apiUrl, apiKey, provider = 'meta', accountSid, authToken, phoneNumberId, fromNumber, logger } = {}) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
    this.provider = provider;
    this.accountSid = accountSid;
    this.authToken = authToken;
    this.phoneNumberId = phoneNumberId;
    this.fromNumber = fromNumber;
    this.logger = logger;
  }

  async send(payload = {}) {
    if (!this.apiUrl) {
      throw new Error('WhatsApp API URL is not configured.');
    }

    const url = this._buildUrl();
    const headers = this._buildHeaders(payload);
    const body = this._buildPayload(payload);

    this.logger?.info?.('Sending WhatsApp message', { url, provider: this.provider, payloadType: payload.type });

    const response = await fetch(url, { method: 'POST', headers, body });
    const responseBody = await response.text();

    if (!response.ok) {
      this.logger?.error?.('WhatsApp provider returned error', { status: response.status, body: responseBody });
      throw new Error(`WhatsApp provider error: ${response.status}`);
    }

    try {
      return JSON.parse(responseBody);
    } catch {
      return responseBody;
    }
  }

  _buildUrl() {
    if (this.provider === 'twilio') {
      return this.apiUrl;
    }

    return this.apiUrl;
  }

  _buildHeaders(payload) {
    if (this.provider === 'twilio') {
      return {
        Authorization: `Basic ${Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      };
    }

    return {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  _buildPayload(payload) {
    if (this.provider === 'twilio') {
      const params = new URLSearchParams();
      params.append('To', payload.to);
      params.append('From', this.fromNumber);
      if (payload.type === 'text') {
        params.append('Body', payload.text?.body || '');
      }
      return params.toString();
    }

    return JSON.stringify(payload);
  }
}
