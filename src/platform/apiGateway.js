import { ServiceResult } from '../services/serviceResult.js';

export const createApiGateway = () => ({
  async executeRequest({ schoolId, method, path, body, headers = {}, schoolRegistry }) {
    const school = schoolRegistry?.findSchool?.(schoolId);
    if (!school) {
      return ServiceResult.failure('School not found', { schoolId }, 'SCHOOL_NOT_FOUND');
    }

    const requestHeaders = {
      ...headers,
      'x-school-id': schoolId,
      'x-api-key': school.apiKey,
      'x-request-source': 'platform-api-gateway'
    };

    return ServiceResult.success({
      schoolId,
      method,
      path,
      headers: requestHeaders,
      body,
      authenticated: true,
      authorized: true
    }, {}, null, 'Request routed through platform API gateway', 'API_GATEWAY_OK');
  }
});

export default createApiGateway;
