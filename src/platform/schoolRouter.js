import { ServiceResult } from '../services/serviceResult.js';

export const createSchoolRouter = ({ schoolRegistry, connectorRegistry, apiGateway }) => ({
  async route({ schoolId, method, path, body, headers = {} }) {
    const school = schoolRegistry?.findSchool?.(schoolId);

    if (!school) {
      return ServiceResult.failure('Unknown school', { schoolId }, 'SCHOOL_NOT_FOUND');
    }

    if (school.status !== 'active') {
      return ServiceResult.failure('School is not active', { schoolId, status: school.status }, 'SCHOOL_INACTIVE');
    }

    if (school.license !== 'valid') {
      return ServiceResult.failure('School license is invalid', { schoolId, license: school.license }, 'LICENSE_INVALID');
    }

    const connector = connectorRegistry?.getConnector?.(school.connectorType || 'default');
    const gatewayResult = await apiGateway.executeRequest({
      schoolId,
      method,
      path,
      body,
      headers,
      schoolRegistry
    });

    if (!gatewayResult.success) {
      return gatewayResult;
    }

    return ServiceResult.success({
      school,
      connector,
      request: gatewayResult.data,
      routed: true,
      normalized: true
    }, {}, null, 'School request normalized and routed', 'SCHOOL_ROUTER_OK');
  }
});

export default createSchoolRouter;
