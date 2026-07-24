import { createSchoolConnectorValidationService } from '../services/schoolConnectorValidationService.js';

export const createSchoolServerApi = (dependencies = {}) => {
  const validationService = dependencies.validationService || createSchoolConnectorValidationService(dependencies);

  return {
    async health() {
      return {
        success: true,
        status: 'healthy',
        service: 'school-server-api'
      };
    },

    async auth(payload = {}) {
      return {
        success: true,
        authenticated: true,
        payload
      };
    },

    async student(payload = {}) {
      return {
        success: true,
        created: true,
        payload
      };
    },

    async onboardSchool(payload = {}) {
      return {
        success: true,
        data: {
          schoolId: payload.schoolId,
          connectorType: payload.connectorType,
          status: 'ready-for-validation'
        }
      };
    },

    async validateConnection(payload = {}) {
      return validationService.validateConnection(payload);
    },

    async discoverSchema(payload = {}) {
      return validationService.discoverSchema(payload);
    },

    async activateConnector(payload = {}) {
      return {
        success: true,
        data: {
          schoolId: payload.schoolId,
          connectorType: payload.connectorType,
          status: 'activated'
        }
      };
    }
  };
};

export default createSchoolServerApi;
