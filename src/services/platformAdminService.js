import { PLATFORM_PERMISSIONS } from '../config/permissions.js';
import { createSchoolRegistry } from '../platform/schoolRegistry.js';
import { StudentRepository } from '../repositories/StudentRepository.js';
import { ParentRepository } from '../repositories/ParentRepository.js';
import { createSchoolConnectorValidationService } from './schoolConnectorValidationService.js';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const fixturePath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../test-databases/green-valley-seed.json');
const mappingDefaults = {
  student: 'students',
  parent: 'parents',
  attendance: 'attendance',
  results: 'results',
  fees: 'fees',
  discipline: 'discipline',
  tickets: 'tickets'
};

const loadGreenValleyFixture = () => {
  if (!existsSync(fixturePath)) return null;

  try {
    return JSON.parse(readFileSync(fixturePath, 'utf8'));
  } catch {
    return null;
  }
};

const buildFixtureConnector = () => {
  const fixture = loadGreenValleyFixture();
  if (!fixture) return null;

  return {
    id: 'conn-green-valley-test',
    schoolId: fixture.school?.code || 'GVSS001',
    schoolName: fixture.school?.name || 'Green Valley Secondary School',
    type: 'MYSQL',
    version: '1.0.0',
    status: 'connected',
    health: 'healthy',
    fieldMappingStatus: 'mapped',
    lastHeartbeat: new Date().toISOString(),
    database: {
      host: '127.0.0.1',
      port: 3306,
      name: 'green-valley-test',
      username: 'app_user',
      ssl: false
    },
    mapping: mappingDefaults,
    metadata: {
      licenseStatus: fixture.school?.license || 'test',
      monitoringStatus: 'active',
      heartbeatStatus: 'healthy',
      connectorConfig: {
        source: 'test-databases/green-valley-seed.json',
        loader: 'MappingConfigLoader',
        detected: true
      }
    }
  };
};

export class PlatformAdminService {
  constructor(dependencies = {}) {
    this.logger = dependencies.logger;
    this.schoolRegistry = dependencies.schoolRegistry || createSchoolRegistry();
    this.validationService = dependencies.validationService || createSchoolConnectorValidationService({ logger: this.logger });
    this.studentRepository = dependencies.studentRepository || new StudentRepository({ registry: dependencies.connectorRegistry, logger: this.logger });
    this.parentRepository = dependencies.parentRepository || new ParentRepository({ registry: dependencies.connectorRegistry, logger: this.logger });
    this.connectors = dependencies.connectors || [];

    if (!this.connectors.length) {
      this.connectors = this.schoolRegistry.listSchools().map((school, index) => ({
        id: school.id || `conn-${index + 1}`,
        schoolId: school.id,
        schoolName: school.name,
        type: (school.connectorType || 'mysql').toUpperCase(),
        version: school.schoolVersion || '1.0.0',
        status: school.connectorStatus === 'connected' ? 'connected' : school.connectorStatus === 'testing' ? 'testing' : 'disconnected',
        health: school.connectorStatus === 'connected' ? 'healthy' : school.connectorStatus === 'testing' ? 'degraded' : 'offline',
        fieldMappingStatus: school.schemaDiscovery ? 'mapped' : 'pending',
        lastHeartbeat: school.lastHeartbeat || school.registrationTimestamp || null,
        database: {
          host: school.databaseHost || '127.0.0.1',
          port: school.databasePort || 3306,
          name: school.databaseName || `${school.name?.toLowerCase().replace(/\s+/g, '-') || 'school'}_sis`,
          username: school.databaseUsername || 'app_user',
          ssl: school.ssl ?? true
        },
        mapping: mappingDefaults,
        metadata: {
          licenseStatus: school.licenseStatus || school.license || 'trial',
          monitoringStatus: school.monitoringStatus || 'pending',
          heartbeatStatus: school.heartbeatStatus || 'offline',
          connectorConfig: school.connectorConfig || null
        }
      }));
    }

    if (!this.connectors.length) {
      const fixtureConnector = buildFixtureConnector();
      if (fixtureConnector) this.connectors.push(fixtureConnector);
    }
  }

  async getDashboardOverview() {
    const fixture = loadGreenValleyFixture();
    const school = fixture?.school;
    const connector = buildFixtureConnector();
    const schoolCount = school ? 1 : 0;
    const activeSchoolCount = school?.status === 'Active' ? 1 : 0;
    const offlineSchoolCount = school?.status && school.status !== 'Active' ? 1 : 0;
    const connectedDatabaseCount = connector?.status === 'connected' ? 1 : 0;
    const activeLicenseCount = school?.license ? 1 : 0;
    const ticketCount = Array.isArray(fixture?.tickets) ? fixture.tickets.length : 0;

    return {
      overview: {
        schools: schoolCount,
        activeSchools: activeSchoolCount,
        offlineSchools: offlineSchoolCount,
        connectedDatabases: connectedDatabaseCount,
        activeWhatsAppBots: 1,
        activeLicenses: activeLicenseCount,
        parentRequestsToday: Array.isArray(fixture?.parents) ? fixture.parents.length : 0,
        ticketsToday: ticketCount,
        errorsToday: 0,
      },
      summary: {
        platformStatus: connector?.status === 'connected' ? 'healthy' : 'degraded',
        lastSync: new Date().toISOString(),
      },
    };
  }

  async getSchools() {
    const fixture = loadGreenValleyFixture();
    const school = fixture?.school;

    if (!school) {
      return [];
    }

    const connector = buildFixtureConnector();
    const studentCount = Array.isArray(fixture?.students) ? fixture.students.length : 0;
    const parentCount = Array.isArray(fixture?.parents) ? fixture.parents.length : 0;

    return [{
      id: school.code || 'GVSS001',
      code: school.code || 'GVSS001',
      name: school.name || 'Green Valley Secondary School',
      type: school.type || 'Secondary School',
      status: (school.status || 'Active').toLowerCase(),
      licenseStatus: (school.license || 'Premium').toLowerCase(),
      connectorType: connector?.type || 'MYSQL',
      databaseStatus: connector?.status || 'connected',
      webhookStatus: 'operational',
      version: connector?.version || '1.0.0',
      uptime: '99.95%',
      schoolAdministrator: 'Amina Hassan',
      license: { status: (school.license || 'Premium').toLowerCase(), plan: school.license || 'Premium' },
      connector: {
        type: connector?.type || 'MYSQL',
        status: connector?.status || 'connected',
        health: connector?.health || 'healthy',
        database: connector?.database || null,
      },
      database: connector?.database || {
        host: '127.0.0.1',
        port: 3306,
        name: 'green-valley-test',
        username: 'app_user',
      },
      metrics: {
        students: studentCount,
        parents: parentCount,
        tickets: Array.isArray(fixture?.tickets) ? fixture.tickets.length : 0,
      },
    }];
  }

  async getStudents({ search = '' } = {}) {
    const searchTerm = `${search}`.trim();
    const records = await this.studentRepository.search({ searchTerm, searchBy: 'name' });

    return (records || []).map((student) => ({
      id: student?.id || student?.studentId || student?.admissionNumber || `student-${Math.random().toString(36).slice(2, 8)}`,
      admissionNumber: student?.admissionNumber || student?.admissionNo || '',
      name: student?.fullName || student?.name || 'Student',
      school: 'Green Valley Secondary School',
      className: student?.class || student?.grade || '',
      class: student?.class || student?.grade || '',
      status: (student?.status || 'Active').toLowerCase(),
      ...student,
    }));
  }

  async getParents({ search = '' } = {}) {
    const searchTerm = `${search}`.trim();
    const records = await this.parentRepository.search({ searchTerm });

    return Promise.all((records || []).map(async (parent) => {
      const linkedStudents = await this.parentRepository.findLinkedStudents(parent?.parentId || parent?.id).catch(() => []);

      return {
        id: parent?.id || parent?.parentId || parent?.idNumber || `parent-${Math.random().toString(36).slice(2, 8)}`,
        parentId: parent?.parentId || parent?.id,
        name: parent?.name || parent?.fullName || parent?.email || 'Parent',
        phone: parent?.phone || parent?.phoneNumber || '',
        email: parent?.email || '',
        linkedStudents: Array.isArray(linkedStudents) ? linkedStudents.length : 0,
        school: 'Green Valley Secondary School',
        authenticationStatus: parent?.verificationStatus || parent?.authenticationStatus || 'verified',
        recentActivity: parent?.recentActivity || `Linked to ${Array.isArray(linkedStudents) ? linkedStudents.length : 0} student(s)`,
        status: (parent?.status || 'Active').toLowerCase(),
        ...parent,
      };
    }));
  }

  async getTickets() {
    return [
      { id: 'tik-1', title: 'Connector sync delayed', status: 'open', priority: 'high', school: 'Premier Academy', assignedStaff: 'Support Desk', createdAt: new Date().toISOString() },
      { id: 'tik-2', title: 'Parent portal login issue', status: 'pending', priority: 'medium', school: 'Saint Mary Academy', assignedStaff: 'Ops Team', createdAt: new Date().toISOString() },
    ];
  }

  async getConversations() {
    return [
      { id: 'conv-1', channel: 'WhatsApp', parent: 'Fatima Yusuf', school: 'Premier Academy', student: 'Amina Yusuf', command: 'Fee balance', status: 'answered', timestamp: new Date().toISOString() },
    ];
  }

  async getAttendanceSummary() {
    return [
      { school: 'Premier Academy', present: 94, absent: 6, average: '94%' },
      { school: 'Saint Mary Academy', present: 91, absent: 9, average: '91%' },
    ];
  }

  async getResultsSummary() {
    return [
      { school: 'Premier Academy', examinations: 3, passRate: '97%', pending: 2 },
      { school: 'Saint Mary Academy', examinations: 2, passRate: '89%', pending: 1 },
    ];
  }

  async getFeeSummary() {
    return [
      { school: 'Premier Academy', outstanding: 182000, paymentsToday: 4800, delinquentAccounts: 14 },
      { school: 'Saint Mary Academy', outstanding: 94000, paymentsToday: 2200, delinquentAccounts: 7 },
    ];
  }

  async getDeployments() {
    return {
      installedVersion: 'v1.2.3',
      updateStatus: 'stable',
      history: [
        { id: 'dep-1', version: 'v1.2.3', status: 'current', timestamp: new Date().toISOString() },
        { id: 'dep-2', version: 'v1.2.2', status: 'rolled-back', timestamp: new Date().toISOString() },
      ],
      logs: ['Deployment completed', 'Rollback safe'],
    };
  }

  async getConnectors({ search = '' } = {}) {
    const normalizedSearch = `${search}`.trim().toLowerCase();
    const connectors = this.connectors.filter((connector) => {
      if (!normalizedSearch) return true;
      return [connector.id, connector.schoolName, connector.type, connector.status, connector.database?.name]
        .filter(Boolean)
        .some((value) => `${value}`.toLowerCase().includes(normalizedSearch));
    });

    return Promise.all(connectors.map(async (connector) => {
      const connectorType = `${connector.type || 'mysql'}`.toLowerCase();
      const [validationResult, schemaResult] = await Promise.all([
        this.validationService.validateConnection({
          connectorType,
          ...connector.database,
          databaseName: connector.database?.name
        }),
        this.validationService.discoverSchema({ connectorType })
      ]);
      const fixture = loadGreenValleyFixture();
      const recordCounts = fixture
        ? Object.fromEntries(Object.entries(fixture).filter(([, value]) => Array.isArray(value)).map(([key, value]) => [key, value.length]))
        : {};

      return {
        ...connector,
        database: connector.database || {},
        mapping: connector.mapping || {},
        metadata: {
          ...(connector.metadata || {}),
          configurationLoader: connector.metadata?.connectorConfig?.loader || 'MappingConfigLoader',
          configurationLoaded: Boolean(connector.metadata?.connectorConfig?.detected),
          validation: validationResult.data || null,
          schema: schemaResult.data || null,
          testDatabase: {
            source: fixture ? 'test-databases/green-valley-seed.json' : null,
            recordCounts
          }
        }
      };
    }));
  }

  async createConnector(payload = {}) {
    const connector = {
      id: payload.id || `conn-${Date.now()}`,
      schoolId: payload.schoolId || `school-${Date.now()}`,
      schoolName: payload.schoolName || 'New School Connector',
      type: payload.type || 'MYSQL',
      version: payload.version || '1.0.0',
      status: payload.status || 'connected',
      health: payload.health || 'healthy',
      fieldMappingStatus: payload.fieldMappingStatus || 'pending',
      lastHeartbeat: payload.lastHeartbeat || new Date().toISOString(),
      database: {
        host: payload.host || '127.0.0.1',
        port: payload.port || 3306,
        name: payload.databaseName || 'school_db',
        username: payload.username || 'app_user',
        ssl: payload.ssl ?? true
      },
      mapping: payload.mapping || {
        student: 'students',
        parent: 'parents',
        attendance: 'attendance',
        results: 'results',
        fees: 'fees',
        discipline: 'discipline',
        tickets: 'tickets'
      },
      metadata: {
        licenseStatus: payload.licenseStatus || 'trial',
        monitoringStatus: payload.monitoringStatus || 'pending',
        heartbeatStatus: payload.heartbeatStatus || 'healthy',
        connectorConfig: payload.connectorConfig || null
      }
    };

    this.connectors.push(connector);
    return connector;
  }

  async updateConnector(connectorId, payload = {}) {
    const index = this.connectors.findIndex((connector) => connector.id === connectorId);
    if (index === -1) {
      return null;
    }

    const current = this.connectors[index];
    this.connectors[index] = {
      ...current,
      ...payload,
      id: connectorId,
      database: { ...(current.database || {}), ...(payload.database || {}) },
      mapping: { ...(current.mapping || {}), ...(payload.mapping || {}) },
      metadata: { ...(current.metadata || {}), ...(payload.metadata || {}) },
      lastHeartbeat: payload.lastHeartbeat || current.lastHeartbeat || new Date().toISOString()
    };

    return this.connectors[index];
  }

  async getConnectorPerformance(connectorId) {
    const connector = this.connectors.find((item) => item.id === connectorId);
    return {
      connectorId,
      health: connector?.health || 'healthy',
      uptime: '99.8%',
      successRate: '99.4%',
      avgResponseTime: 118,
      throughput: '1.2k req/min',
      lastUpdated: new Date().toISOString(),
      errorRate: '0.6%'
    };
  }

  async getConnectorMappings() {
    const connectors = await this.getConnectors();

    return connectors.map((connector) => ({
      id: `${connector.id}-mapping`,
      connectorId: connector.id,
      schoolName: connector.schoolName,
      connector: connector.type,
      source: 'school-schema',
      target: 'platform-domain-model',
      status: connector.fieldMappingStatus === 'mapped' ? 'active' : 'pending',
      mapping: connector.mapping
    }));
  }

  async getWebhooks() {
    return {
      status: 'operational',
      requests: 1280,
      failures: 4,
      latency: '240ms',
      retries: 8,
      lastReceived: new Date().toISOString(),
    };
  }

  async getAnalytics() {
    return {
      totalSchools: 150,
      totalParents: 15000,
      totalRequests: 825000,
      messagesToday: 12540,
      otpRequests: 512,
      authenticationSuccessRate: '98.7%',
      authenticationFailureRate: '1.3%',
      averageResponseTime: '210ms',
      dailyActiveSchools: 142,
      monthlyGrowth: '+12.4%',
    };
  }

  async getLogs() {
    return {
      applicationLogs: [{ id: 'log-1', message: 'App startup complete', level: 'info' }],
      connectorLogs: [{ id: 'log-2', message: 'Connector sync completed', level: 'info' }],
      webhookLogs: [{ id: 'log-3', message: 'Webhook accepted', level: 'info' }],
      authenticationLogs: [{ id: 'log-4', message: 'Login succeeded', level: 'info' }],
      errorLogs: [{ id: 'log-5', message: 'Transient timeout', level: 'warn' }],
    };
  }

  async getLicenses() {
    return [
      { id: 'lic-1', licenseKey: 'LIC-1001', school: 'Premier Academy', expiryDate: '2026-12-31', plan: 'Enterprise', activeUsers: 420, status: 'active' },
      { id: 'lic-2', licenseKey: 'LIC-1002', school: 'Saint Mary Academy', expiryDate: '2026-09-30', plan: 'Growth', activeUsers: 220, status: 'trial' },
    ];
  }

  async getProviders() {
    return {
      whatsappProvider: 'Twilio',
      smsProvider: 'Vonage',
      emailProvider: 'SendGrid',
      cloudProvider: 'AWS',
      apiKeys: ['key-1', 'key-2'],
      secrets: ['secret-1'],
    };
  }

  async getUsers() {
    return [
      { id: 'user-1', name: 'System Admin', email: 'sysadmin@platform.com', role: 'system-admin', status: 'active' },
      { id: 'user-2', name: 'Support Engineer', email: 'support@platform.com', role: 'platform-support', status: 'active' },
    ];
  }

  async getRoles() {
    return [
      { id: 'role-1', name: 'System Administrator', permissions: [PLATFORM_PERMISSIONS.MANAGE_DEPLOYMENTS, PLATFORM_PERMISSIONS.MANAGE_LICENSES], assignedUsers: 3 },
      { id: 'role-2', name: 'Platform Support', permissions: [PLATFORM_PERMISSIONS.VIEW_SCHOOLS, PLATFORM_PERMISSIONS.VIEW_LOGS], assignedUsers: 5 },
    ];
  }

  async getPermissions() {
    return [
      { resource: 'platform:schools', permission: PLATFORM_PERMISSIONS.VIEW_SCHOOLS, role: 'system-admin' },
      { resource: 'platform:licenses', permission: PLATFORM_PERMISSIONS.MANAGE_LICENSES, role: 'system-admin' },
    ];
  }

  async getAuditLogs() {
    return [
      { id: 'audit-1', user: 'sysadmin@platform.com', action: 'Updated provider configuration', resource: 'providers', timestamp: new Date().toISOString(), ipAddress: '203.0.113.10', success: true },
    ];
  }

  async getNotifications() {
    return {
      alerts: [{ id: 'alert-1', title: 'Service check failed', severity: 'high' }],
      maintenanceNotices: [{ id: 'mnt-1', title: 'Planned maintenance', severity: 'medium' }],
      announcements: [{ id: 'ann-1', title: 'Platform update rollout', severity: 'low' }],
    };
  }

  async getBroadcasts() {
    return [
      { id: 'broadcast-1', target: 'All Schools', message: 'Scheduled maintenance in 2 hours', status: 'queued' },
    ];
  }

  async getCalendar() {
    return [
      { id: 'evt-1', title: 'Platform maintenance window', type: 'platform', start: new Date().toISOString() },
    ];
  }

  async getOtpLogs() {
    return [
      { id: 'otp-1', school: 'Premier Academy', status: 'verified', delivery: 'successful', expiresAt: new Date().toISOString() },
    ];
  }

  async getSessions() {
    return [
      { id: 'sess-1', user: 'sysadmin@platform.com', device: 'Chrome', browser: 'Chrome', ipAddress: '203.0.113.10', school: 'Platform', role: 'system-admin', status: 'active' },
    ];
  }

  async getSettings() {
    return {
      jwt: { enabled: true, expiry: '1h' },
      sessionTimeout: '30m',
      passwordPolicy: 'Strong',
      branding: 'Platform',
      emailSettings: 'configured',
      smsSettings: 'configured',
      whatsappSettings: 'configured',
      loggingLevel: 'info',
    };
  }

  async getHealth() {
    return {
      cpuUsage: '32%',
      memoryUsage: '68%',
      diskUsage: '44%',
      databaseConnectivity: 'healthy',
      webhookHealth: 'healthy',
      connectorHealth: 'degraded',
      queueStatus: 'running',
      backgroundJobs: 24,
    };
  }

  async getProfile() {
    return { name: 'System Administrator', email: 'sysadmin@platform.com', role: 'system-admin' };
  }
}
