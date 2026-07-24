import { createHash } from 'crypto';
import { createSchoolRegistry } from '../platform/schoolRegistry.js';
import { createSchoolServerApi } from '../school-server/index.js';
import { ServiceResult } from './serviceResult.js';

const normalizeConnectorType = (connectorType = 'mysql') => {
  const normalized = `${connectorType}`.toLowerCase();
  if (normalized.includes('postgres')) return 'postgresql';
  if (normalized.includes('sql') || normalized.includes('mssql')) return 'sqlserver';
  if (normalized.includes('mongo')) return 'mongodb';
  return 'mysql';
};

const slugify = (value = '') => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'school';

const buildToken = (prefix, length = 12) => {
  const hash = createHash('sha256').update(`${prefix}-${Date.now()}-${Math.random()}`).digest('hex');
  return `${prefix}_${hash.slice(0, length)}`;
};

export const createSchoolOnboardingService = ({ schoolRegistry, schoolServerApi, logger } = {}) => {
  const registry = schoolRegistry || createSchoolRegistry();
  const serverApi = schoolServerApi || createSchoolServerApi();

  return {
    async registerSchool(payload = {}) {
      const name = payload.name?.trim();
      const adminEmail = payload.adminEmail?.trim();
      const apiUrl = payload.apiUrl?.trim();
      const connectorType = normalizeConnectorType(payload.connectorType);

      if (!name || !adminEmail || !apiUrl) {
        return ServiceResult.validationFailed('School name, administrator email, and API URL are required');
      }

      const existing = registry.listSchools().find((school) => school.name?.toLowerCase() === name.toLowerCase());
      if (existing) {
        return ServiceResult.failure('School already exists', { name }, 'SCHOOL_EXISTS');
      }

      const schoolId = `school_${slugify(name)}_${Date.now().toString().slice(-4)}`;
      const schoolRecord = {
        id: schoolId,
        name,
        status: payload.status || 'active',
        license: payload.licenseType === 'enterprise' ? 'valid' : 'trial',
        licenseType: payload.licenseType || 'trial',
        schoolAdminEmail: adminEmail,
        schoolAdminPassword: payload.schoolAdminPassword || 'Temp@1234',
        schoolAdminRole: 'school-admin',
        schoolAdminActive: true,
        apiUrl,
        apiKey: buildToken('pk'),
        secretKey: buildToken('sk'),
        connectorType,
        connectorStatus: 'pending',
        databaseType: connectorType,
        databaseHost: payload.host || '127.0.0.1',
        databasePort: payload.port || (connectorType === 'mysql' ? 3306 : connectorType === 'postgresql' ? 5432 : connectorType === 'sqlserver' ? 1433 : 27017),
        databaseName: payload.databaseName || `${slugify(name)}_sis`,
        databaseUsername: payload.username || 'app_user',
        databasePassword: payload.password || 'school-pass',
        ssl: payload.ssl ?? true,
        registrationTimestamp: new Date().toISOString(),
        heartbeatStatus: 'offline',
        licenseStatus: 'active',
        schoolVersion: '1.0.0',
        monitoringStatus: 'pending'
      };

      const onboardingResult = await serverApi.onboardSchool({
        schoolId,
        schoolName: name,
        connectorType,
        apiUrl,
        database: {
          host: schoolRecord.databaseHost,
          port: schoolRecord.databasePort,
          name: schoolRecord.databaseName,
          username: schoolRecord.databaseUsername,
          password: schoolRecord.databasePassword,
          ssl: schoolRecord.ssl
        }
      });

      schoolRecord.connectorStatus = onboardingResult?.success ? 'testing' : 'failed';
      schoolRecord.onboarding = onboardingResult?.success ? onboardingResult.data : onboardingResult;
      schoolRecord.heartbeatStatus = 'online';
      registry.registerSchool(schoolRecord);

      logger?.info?.('School onboarding registered', { schoolId, connectorType });

      return ServiceResult.success({
        school: schoolRecord,
        schoolAdmin: {
          email: adminEmail,
          temporaryPassword: schoolRecord.schoolAdminPassword,
          assignedSchool: schoolId,
          role: schoolRecord.schoolAdminRole,
          active: schoolRecord.schoolAdminActive,
          status: 'invited'
        },
        nextStep: 'connector-wizard',
        onboarding: schoolRecord.onboarding
      });
    },

    async listSchools() {
      return registry.listSchools().map((school) => ({
        id: school.id,
        name: school.name,
        status: school.status,
        licenseStatus: school.licenseStatus || school.license,
        connectorType: school.connectorType || 'unknown',
        connectorStatus: school.connectorStatus || 'pending',
        databaseStatus: school.connectorStatus === 'connected' ? 'connected' : 'pending',
        webhookStatus: school.webhookStatus || 'operational',
        version: school.schoolVersion || '1.0.0',
        uptime: school.uptime || '99.95%',
        schoolAdministrator: school.schoolAdminEmail || 'Pending',
        heartbeatStatus: school.heartbeatStatus || 'offline',
        apiUrl: school.apiUrl,
        databaseType: school.databaseType,
        registrationTimestamp: school.registrationTimestamp
      }));
    },

    async getSchool(schoolId) {
      const school = registry.findSchool(schoolId);
      if (!school) {
        return ServiceResult.notFound('School not found');
      }
      return ServiceResult.success(school);
    },

    async testConnector(schoolId, payload = {}) {
      const school = registry.findSchool(schoolId);
      if (!school) {
        return ServiceResult.notFound('School not found');
      }

      const result = await serverApi.validateConnection({
        connectorType: school.connectorType,
        host: payload.host || school.databaseHost,
        port: payload.port || school.databasePort,
        databaseName: payload.databaseName || school.databaseName,
        username: payload.username || school.databaseUsername,
        password: payload.password || school.databasePassword,
        ssl: payload.ssl ?? school.ssl
      });

      if (!result.success) {
        registry.updateSchool(schoolId, { connectorStatus: 'failed' });
        return result;
      }

      registry.updateSchool(schoolId, {
        connectorStatus: 'testing',
        lastConnectorValidation: new Date().toISOString(),
        connectorConfig: payload
      });

      return ServiceResult.success({
        schoolId,
        connectorType: school.connectorType,
        validation: result.data,
        nextStep: 'schema-discovery'
      });
    },

    async discoverSchema(schoolId) {
      const school = registry.findSchool(schoolId);
      if (!school) {
        return ServiceResult.notFound('School not found');
      }

      const discovery = await serverApi.discoverSchema({ connectorType: school.connectorType });
      registry.updateSchool(schoolId, { schemaDiscovery: discovery.data });
      return ServiceResult.success({ schoolId, discovery: discovery.data });
    },

    async activateConnector(schoolId) {
      const school = registry.findSchool(schoolId);
      if (!school) {
        return ServiceResult.notFound('School not found');
      }

      const activation = await serverApi.activateConnector({ connectorType: school.connectorType, schoolId });
      registry.updateSchool(schoolId, {
        connectorStatus: 'connected',
        heartbeatStatus: 'online',
        monitoringStatus: 'healthy',
        lastHeartbeat: new Date().toISOString(),
        schoolVersion: school.schoolVersion || '1.0.0'
      });
      return ServiceResult.success({
        schoolId,
        connectorStatus: 'connected',
        heartbeatStatus: 'online',
        activation: activation.data
      });
    },

    async getHeartbeat(schoolId) {
      const school = registry.findSchool(schoolId);
      if (!school) {
        return ServiceResult.notFound('School not found');
      }
      return ServiceResult.success({
        schoolId,
        online: school.heartbeatStatus === 'online',
        status: school.heartbeatStatus || 'offline',
        connectorStatus: school.connectorStatus || 'pending',
        databaseStatus: school.connectorStatus === 'connected' ? 'connected' : 'pending',
        version: school.schoolVersion || '1.0.0',
        licenseStatus: school.licenseStatus || 'active',
        lastSeen: school.lastHeartbeat || school.registrationTimestamp,
        cpu: '24%',
        memory: '42%'
      });
    },

    async getMonitoring(schoolId) {
      const school = registry.findSchool(schoolId);
      if (!school) {
        return ServiceResult.notFound('School not found');
      }
      return ServiceResult.success({
        schoolId,
        schoolOnline: school.heartbeatStatus === 'online',
        databaseConnected: school.connectorStatus === 'connected',
        connectorHealthy: school.connectorStatus === 'connected',
        heartbeatActive: school.heartbeatStatus === 'online',
        apiReachable: true,
        monitoringStatus: school.monitoringStatus || 'healthy'
      });
    }
  };
};

export const schoolOnboardingService = createSchoolOnboardingService();
export default createSchoolOnboardingService;
