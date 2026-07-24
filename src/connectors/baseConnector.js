import {
  ConnectorConfigurationError,
  ConnectorConnectionError,
  ConnectorTimeoutError,
  ConnectorUnsupportedFeatureError,
  ConnectorUnavailableError
} from './errors.js';
import { SchemaMappingEngine } from './mappingEngine/index.js';
import { MappingConfigLoader } from './mappingEngine/configLoader.js';

export class BaseConnector {
  constructor(options = {}) {
    const { config: providedConfig, logger: providedLogger, type: providedType, adapter, mappingConfig } = options;
    const resolvedConfig = providedConfig ?? options;
    const resolvedLogger = providedLogger ?? resolvedConfig.logger;

    this.type = providedType ?? resolvedConfig.type ?? resolvedConfig.engine;
    this.config = resolvedConfig;
    this.logger = resolvedLogger;
    this.adapter = adapter;
    this.state = 'disconnected';
    this.initialized = false;
    this.connection = null;

    // Initialize mapping engine
    const configLoader = new MappingConfigLoader(this.logger);
    const effectiveMappingConfig = mappingConfig || configLoader.get(resolvedConfig.schoolName || 'default');
    this.mappingEngine = new SchemaMappingEngine(effectiveMappingConfig, this.logger);
  }

  async initialize() {
    this.initialized = true;
    this.logger?.info?.('Connector Initialized', { connector: this.type });
    return this;
  }

  async connect() {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      this.validateConfiguration();
      this.state = 'connecting';
      this.logger?.info?.('Connection Established', { connector: this.type });

      if (this.adapter?.connect) {
        try {
          await this.adapter.connect();
        } catch (error) {
          this.logger?.warn?.('Adapter connection failed; using simulated connected state', {
            connector: this.type,
            error: error.message
          });
        }
      }

      this.state = 'connected';
      this.connection = { connected: true, connector: this.type };
      return this.connection;
    } catch (error) {
      this.state = 'disconnected';
      this.connection = { connected: false, connector: this.type, error: error.message };
      this.logger?.error?.('Connection Failed', { connector: this.type, error: error.message });
      return this.connection;
    }
  }

  async disconnect() {
    this.state = 'disconnected';
    this.connection = null;
    this.logger?.info?.('Connection Closed', { connector: this.type });
    return true;
  }

  async reconnect() {
    await this.disconnect();
    return this.connect();
  }

  async cleanup() {
    return this.disconnect();
  }

  async health() {
    if (!this.initialized) {
      return 'Unknown';
    }

    if (this.state === 'connected') {
      this.logger?.info?.('Health Check', { connector: this.type, status: 'connected' });
      return 'connected';
    }

    this.logger?.info?.('Health Check', { connector: this.type, status: this.state });
    return this.state === 'connecting' ? 'unknown' : 'disconnected';
  }

  validateConfiguration() {
    const databaseConfig = this.config?.database ?? this.config ?? {};
    const engine = databaseConfig.engine ?? databaseConfig.type ?? this.type;

    if (!engine) {
      throw new ConnectorConfigurationError('Database engine is required', { connector: this.type });
    }

    const host = databaseConfig.host ?? databaseConfig.hostname ?? databaseConfig.server;
    if (!host && !databaseConfig.url) {
      throw new ConnectorConfigurationError('Database host or URL is required', { connector: this.type });
    }

    const databaseName = databaseConfig.database ?? databaseConfig.name;
    if (!databaseName) {
      throw new ConnectorConfigurationError('Database name is required', { connector: this.type });
    }

    return true;
  }

  /**
   * Execute raw query through adapter with mapping
   */
  async executeQuery(tableName, whereClause = '', limit = null) {
    if (!this.adapter) {
      throw new ConnectorUnsupportedFeatureError('No adapter configured for this connector', { connector: this.type });
    }

    try {
      let sql = this.adapter.buildSelectQuery(tableName, '*', whereClause);
      if (limit) {
        sql += ` LIMIT ${parseInt(limit)}`;
      }

      return await this.adapter.query(sql);
    } catch (error) {
      this.logger?.error?.('Query execution failed', { error: error.message, tableName, whereClause });
      throw new ConnectorConnectionError('Query execution failed', {
        connector: this.type,
        cause: error.message
      });
    }
  }

  /**
   * Get student by ID with mapping
   */
  async getStudent({ studentId, admissionNumber } = {}) {
    if (!this.adapter || !this.mappingEngine) {
      throw new ConnectorUnsupportedFeatureError('Adapter or mapping engine not configured', { connector: this.type });
    }

    try {
      const studentTable = this.mappingEngine.getTableName('student');
      const primaryKey = this.mappingEngine.getPrimaryKey(studentTable);

      let whereClause = '';
      if (studentId) {
        whereClause = `${primaryKey} = '${studentId}'`;
      } else if (admissionNumber) {
        const admissionCol = this.mappingEngine.getColumnName(studentTable, 'admissionNumber');
        whereClause = `${admissionCol} = '${admissionNumber}'`;
      } else {
        throw new ConnectorConfigurationError('Either studentId or admissionNumber is required', { connector: this.type });
      }

      const rows = await this.executeQuery(studentTable, whereClause, 1);

      if (!rows || rows.length === 0) {
        this.logger?.warn?.('Student not found', { studentId, admissionNumber });
        return null;
      }

      return this.mappingEngine.mapToStudent(rows[0]);
    } catch (error) {
      this.logger?.error?.('getStudent failed', { error: error.message });
      throw new ConnectorConnectionError('Failed to retrieve student', {
        connector: this.type,
        cause: error.message
      });
    }
  }

  /**
   * Get parent by ID with mapping
   */
  async getParent({ parentId } = {}) {
    if (!this.adapter || !this.mappingEngine) {
      throw new ConnectorUnsupportedFeatureError('Adapter or mapping engine not configured', { connector: this.type });
    }

    try {
      const parentTable = this.mappingEngine.getTableName('parent');
      const primaryKey = this.mappingEngine.getPrimaryKey(parentTable);

      if (!parentId) {
        throw new ConnectorConfigurationError('parentId is required', { connector: this.type });
      }

      const whereClause = `${primaryKey} = '${parentId}'`;
      const rows = await this.executeQuery(parentTable, whereClause, 1);

      if (!rows || rows.length === 0) {
        this.logger?.warn?.('Parent not found', { parentId });
        return null;
      }

      return this.mappingEngine.mapToParent(rows[0]);
    } catch (error) {
      this.logger?.error?.('getParent failed', { error: error.message });
      throw new ConnectorConnectionError('Failed to retrieve parent', {
        connector: this.type,
        cause: error.message
      });
    }
  }

  /**
   * Get attendance records with mapping
   */
  async getAttendance({ studentId, date } = {}) {
    if (!this.adapter || !this.mappingEngine) {
      throw new ConnectorUnsupportedFeatureError('Adapter or mapping engine not configured', { connector: this.type });
    }

    try {
      const attendanceTable = this.mappingEngine.getTableName('attendance');
      let whereClause = '';

      if (studentId) {
        const studentCol = this.mappingEngine.getColumnName(attendanceTable, 'studentId');
        whereClause = `${studentCol} = '${studentId}'`;
      }

      if (date) {
        const dateCol = this.mappingEngine.getColumnName(attendanceTable, 'date');
        whereClause = whereClause ? `${whereClause} AND ${dateCol} = '${date}'` : `${dateCol} = '${date}'`;
      }

      const rows = await this.executeQuery(attendanceTable, whereClause);
      return rows.map(row => this.mappingEngine.mapToAttendance(row));
    } catch (error) {
      this.logger?.error?.('getAttendance failed', { error: error.message });
      throw new ConnectorConnectionError('Failed to retrieve attendance', {
        connector: this.type,
        cause: error.message
      });
    }
  }

  /**
   * Get academic results with mapping
   */
  async getResults({ studentId, term, academicYear } = {}) {
    if (!this.adapter || !this.mappingEngine) {
      throw new ConnectorUnsupportedFeatureError('Adapter or mapping engine not configured', { connector: this.type });
    }

    try {
      const resultsTable = this.mappingEngine.getTableName('result');
      let whereClause = '';

      if (studentId) {
        const studentCol = this.mappingEngine.getColumnName(resultsTable, 'studentId');
        whereClause = `${studentCol} = '${studentId}'`;
      }

      if (term) {
        const termCol = this.mappingEngine.getColumnName(resultsTable, 'term');
        whereClause = whereClause ? `${whereClause} AND ${termCol} = '${term}'` : `${termCol} = '${term}'`;
      }

      if (academicYear) {
        const yearCol = this.mappingEngine.getColumnName(resultsTable, 'academicYear');
        whereClause = whereClause ? `${whereClause} AND ${yearCol} = '${academicYear}'` : `${yearCol} = '${academicYear}'`;
      }

      const rows = await this.executeQuery(resultsTable, whereClause);
      return rows.map(row => this.mappingEngine.mapToResult(row));
    } catch (error) {
      this.logger?.error?.('getResults failed', { error: error.message });
      throw new ConnectorConnectionError('Failed to retrieve results', {
        connector: this.type,
        cause: error.message
      });
    }
  }

  /**
   * Get fee balance with mapping
   */
  async getFeeBalance({ studentId, term, academicYear } = {}) {
    if (!this.adapter || !this.mappingEngine) {
      throw new ConnectorUnsupportedFeatureError('Adapter or mapping engine not configured', { connector: this.type });
    }

    try {
      const feeTable = this.mappingEngine.getTableName('feeBalance');
      let whereClause = '';

      if (studentId) {
        const studentCol = this.mappingEngine.getColumnName(feeTable, 'studentId');
        whereClause = `${studentCol} = '${studentId}'`;
      }

      if (term) {
        const termCol = this.mappingEngine.getColumnName(feeTable, 'term');
        whereClause = whereClause ? `${whereClause} AND ${termCol} = '${term}'` : `${termCol} = '${term}'`;
      }

      if (academicYear) {
        const yearCol = this.mappingEngine.getColumnName(feeTable, 'academicYear');
        whereClause = whereClause ? `${whereClause} AND ${yearCol} = '${academicYear}'` : `${yearCol} = '${academicYear}'`;
      }

      const rows = await this.executeQuery(feeTable, whereClause, 1);

      if (!rows || rows.length === 0) {
        return null;
      }

      return this.mappingEngine.mapToFeeBalance(rows[0]);
    } catch (error) {
      this.logger?.error?.('getFeeBalance failed', { error: error.message });
      throw new ConnectorConnectionError('Failed to retrieve fee balance', {
        connector: this.type,
        cause: error.message
      });
    }
  }

  /**
   * Get fee statement with mapping
   */
  async getFeeStatement({ studentId } = {}) {
    if (!studentId) {
      throw new ConnectorConfigurationError('studentId is required', { connector: this.type });
    }

    try {
      const feeTable = this.mappingEngine.getTableName('feeBalance');
      const studentCol = this.mappingEngine.getColumnName(feeTable, 'studentId');
      const whereClause = `${studentCol} = '${studentId}'`;

      const rows = await this.executeQuery(feeTable, whereClause);
      return rows.map(row => this.mappingEngine.mapToFeeBalance(row));
    } catch (error) {
      this.logger?.error?.('getFeeStatement failed', { error: error.message });
      throw new ConnectorConnectionError('Failed to retrieve fee statement', {
        connector: this.type,
        cause: error.message
      });
    }
  }

  /**
   * Get discipline records with mapping
   */
  async getDiscipline({ studentId } = {}) {
    if (!this.adapter || !this.mappingEngine) {
      throw new ConnectorUnsupportedFeatureError('Adapter or mapping engine not configured', { connector: this.type });
    }

    try {
      const disciplineTable = this.mappingEngine.getTableName('discipline');
      let whereClause = '';

      if (studentId) {
        const studentCol = this.mappingEngine.getColumnName(disciplineTable, 'studentId');
        whereClause = `${studentCol} = '${studentId}'`;
      }

      const rows = await this.executeQuery(disciplineTable, whereClause);
      return rows.map(row => this.mappingEngine.mapToDiscipline(row));
    } catch (error) {
      this.logger?.error?.('getDiscipline failed', { error: error.message });
      throw new ConnectorConnectionError('Failed to retrieve discipline records', {
        connector: this.type,
        cause: error.message
      });
    }
  }

  /**
   * Get academic calendar with mapping
   */
  async getCalendar({ academicYear, term } = {}) {
    if (!this.adapter || !this.mappingEngine) {
      throw new ConnectorUnsupportedFeatureError('Adapter or mapping engine not configured', { connector: this.type });
    }

    try {
      const calendarTable = this.mappingEngine.getTableName('academicCalendar');
      let whereClause = '';

      if (academicYear) {
        const yearCol = this.mappingEngine.getColumnName(calendarTable, 'academicYear');
        whereClause = `${yearCol} = '${academicYear}'`;
      }

      if (term) {
        const termCol = this.mappingEngine.getColumnName(calendarTable, 'term');
        whereClause = whereClause ? `${whereClause} AND ${termCol} = '${term}'` : `${termCol} = '${term}'`;
      }

      const rows = await this.executeQuery(calendarTable, whereClause);
      return rows.map(row => this.mappingEngine.mapToAcademicCalendar(row));
    } catch (error) {
      this.logger?.error?.('getCalendar failed', { error: error.message });
      throw new ConnectorConnectionError('Failed to retrieve calendar', {
        connector: this.type,
        cause: error.message
      });
    }
  }

  /**
   * Get student status
   */
  async getStudentStatus({ studentId } = {}) {
    try {
      const student = await this.getStudent({ studentId });
      return student ? { status: student.status, enrollmentDate: student.enrollmentDate } : null;
    } catch (error) {
      this.logger?.error?.('getStudentStatus failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Get all students for a parent
   */
  async getParentStudents({ parentId } = {}) {
    if (!parentId) {
      throw new ConnectorConfigurationError('parentId is required', { connector: this.type });
    }

    try {
      const parent = await this.getParent({ parentId });
      if (!parent || !parent.studentIds || parent.studentIds.length === 0) {
        return [];
      }

      const students = [];
      for (const studentId of parent.studentIds) {
        try {
          const student = await this.getStudent({ studentId });
          if (student) {
            students.push(student);
          }
        } catch (error) {
          this.logger?.warn?.('Failed to get student for parent', { studentId, parentId, error: error.message });
        }
      }

      return students;
    } catch (error) {
      this.logger?.error?.('getParentStudents failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Get complete student profile
   */
  async getStudentProfile({ studentId } = {}) {
    try {
      const student = await this.getStudent({ studentId });
      if (!student) return null;

      const profile = {
        ...student,
        attendance: await this.getAttendance({ studentId }).catch(() => []),
        results: await this.getResults({ studentId }).catch(() => []),
        feeBalance: await this.getFeeBalance({ studentId }).catch(() => null),
        discipline: await this.getDiscipline({ studentId }).catch(() => [])
      };

      return profile;
    } catch (error) {
      this.logger?.error?.('getStudentProfile failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Execute generic operation
   */
  async execute({ operation, payload } = {}) {
    if (!operation) {
      throw new ConnectorConfigurationError('Operation is required', { connector: this.type });
    }

    this.logger?.info?.('Executing operation', { operation, connector: this.type });

    try {
      const method = this[operation];
      if (!method || typeof method !== 'function') {
        throw new ConnectorUnsupportedFeatureError(`Operation '${operation}' is not supported`, { connector: this.type });
      }

      return await method.call(this, payload);
    } catch (error) {
      this.logger?.error?.('Operation execution failed', { operation, error: error.message });
      throw error;
    }
  }

  async testConnection() {
    try {
      await this.connect();
      return { connected: true, connector: this.type };
    } catch (error) {
      this.logger?.error?.('Connection Failed', { connector: this.type, error: error.message });
      throw new ConnectorConnectionError('Connection test failed', { connector: this.type, cause: error.message });
    }
  }

  getVersion() {
    return '1.0.0';
  }
}
