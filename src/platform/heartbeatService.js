import { ServiceResult } from '../services/serviceResult.js';

export const createHeartbeatService = ({ schoolRegistry, connectorRegistry }) => ({
  reportHeartbeat(schoolId, payload = {}) {
    const school = schoolRegistry?.findSchool?.(schoolId);
    if (!school) {
      return ServiceResult.failure('School not found for heartbeat', { schoolId }, 'SCHOOL_NOT_FOUND');
    }

    const connector = connectorRegistry?.getConnector?.(school.connectorType || 'default');
    const heartbeatPayload = {
      schoolId,
      schoolStatus: payload.schoolStatus || school.status,
      cpuUsage: payload.cpuUsage || 0,
      memoryUsage: payload.memoryUsage || 0,
      diskUsage: payload.diskUsage || 0,
      connectorStatus: payload.connectorStatus || (connector ? 'connected' : 'unknown'),
      databaseStatus: payload.databaseStatus || 'connected',
      applicationVersion: payload.applicationVersion || school.version,
      licenseStatus: payload.licenseStatus || school.license,
      queueStatus: payload.queueStatus || 'healthy',
      lastSynchronization: payload.lastSynchronization || new Date().toISOString()
    };

    schoolRegistry.updateSchool(schoolId, { heartbeat: 'healthy' });

    return ServiceResult.success(heartbeatPayload, {}, null, 'Heartbeat received', 'HEARTBEAT_OK');
  }
});

export default createHeartbeatService;
