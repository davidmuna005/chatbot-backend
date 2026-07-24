import { PlatformAdminService } from '../services/platformAdminService.js';
import { ServiceResult } from '../services/serviceResult.js';

export class PlatformAdminController {
  constructor(dependencies = {}) {
    this.service = dependencies.platformAdminService || new PlatformAdminService(dependencies);
  }

  async getDashboard(req, res, next) {
    try {
      const data = await this.service.getDashboardOverview();
      return res.json(ServiceResult.success(data));
    } catch (error) {
      return next(error);
    }
  }

  async getSchools(req, res, next) {
    try {
      const data = await this.service.getSchools();
      return res.json(ServiceResult.success(data));
    } catch (error) {
      return next(error);
    }
  }

  async getStudents(req, res, next) {
    try {
      const data = await this.service.getStudents({ search: req.query?.search || req.query?.q });
      return res.json(ServiceResult.success(data));
    } catch (error) {
      return next(error);
    }
  }

  async getParents(req, res, next) {
    try {
      const data = await this.service.getParents({ search: req.query?.search || req.query?.q });
      return res.json(ServiceResult.success(data));
    } catch (error) {
      return next(error);
    }
  }

  async getTickets(req, res, next) {
    try {
      const data = await this.service.getTickets();
      return res.json(ServiceResult.success(data));
    } catch (error) {
      return next(error);
    }
  }

  async getConversations(req, res, next) {
    try {
      const data = await this.service.getConversations();
      return res.json(ServiceResult.success(data));
    } catch (error) {
      return next(error);
    }
  }

  async getAttendance(req, res, next) {
    try {
      const data = await this.service.getAttendanceSummary();
      return res.json(ServiceResult.success(data));
    } catch (error) {
      return next(error);
    }
  }

  async getResults(req, res, next) {
    try {
      const data = await this.service.getResultsSummary();
      return res.json(ServiceResult.success(data));
    } catch (error) {
      return next(error);
    }
  }

  async getFees(req, res, next) {
    try {
      const data = await this.service.getFeeSummary();
      return res.json(ServiceResult.success(data));
    } catch (error) {
      return next(error);
    }
  }

  async getDeployments(req, res, next) {
    try {
      const data = await this.service.getDeployments();
      return res.json(ServiceResult.success(data));
    } catch (error) {
      return next(error);
    }
  }

  async getConnectors(req, res, next) {
    try {
      const data = await this.service.getConnectors({ search: req.query?.search });
      return res.json(ServiceResult.success(data));
    } catch (error) {
      return next(error);
    }
  }

  async getConnectorMappings(req, res, next) {
    try {
      const data = await this.service.getConnectorMappings();
      return res.json(ServiceResult.success(data));
    } catch (error) {
      return next(error);
    }
  }

  async createConnector(req, res, next) {
    try {
      const data = await this.service.createConnector(req.body || {});
      return res.json(ServiceResult.success(data));
    } catch (error) {
      return next(error);
    }
  }

  async updateConnector(req, res, next) {
    try {
      const data = await this.service.updateConnector(req.params.connectorId, req.body || {});
      return res.json(ServiceResult.success(data));
    } catch (error) {
      return next(error);
    }
  }

  async getConnectorPerformance(req, res, next) {
    try {
      const data = await this.service.getConnectorPerformance(req.params.connectorId);
      return res.json(ServiceResult.success(data));
    } catch (error) {
      return next(error);
    }
  }

  async getWebhooks(req, res, next) {
    try {
      const data = await this.service.getWebhooks();
      return res.json(ServiceResult.success(data));
    } catch (error) {
      return next(error);
    }
  }

  async getAnalytics(req, res, next) {
    try {
      const data = await this.service.getAnalytics();
      return res.json(ServiceResult.success(data));
    } catch (error) {
      return next(error);
    }
  }

  async getLogs(req, res, next) {
    try {
      const data = await this.service.getLogs();
      return res.json(ServiceResult.success(data));
    } catch (error) {
      return next(error);
    }
  }

  async getLicenses(req, res, next) {
    try {
      const data = await this.service.getLicenses();
      return res.json(ServiceResult.success(data));
    } catch (error) {
      return next(error);
    }
  }

  async getProviders(req, res, next) {
    try {
      const data = await this.service.getProviders();
      return res.json(ServiceResult.success(data));
    } catch (error) {
      return next(error);
    }
  }

  async getUsers(req, res, next) {
    try {
      const data = await this.service.getUsers();
      return res.json(ServiceResult.success(data));
    } catch (error) {
      return next(error);
    }
  }

  async getRoles(req, res, next) {
    try {
      const data = await this.service.getRoles();
      return res.json(ServiceResult.success(data));
    } catch (error) {
      return next(error);
    }
  }

  async getPermissions(req, res, next) {
    try {
      const data = await this.service.getPermissions();
      return res.json(ServiceResult.success(data));
    } catch (error) {
      return next(error);
    }
  }

  async getAuditLogs(req, res, next) {
    try {
      const data = await this.service.getAuditLogs();
      return res.json(ServiceResult.success(data));
    } catch (error) {
      return next(error);
    }
  }

  async getNotifications(req, res, next) {
    try {
      const data = await this.service.getNotifications();
      return res.json(ServiceResult.success(data));
    } catch (error) {
      return next(error);
    }
  }

  async getBroadcasts(req, res, next) {
    try {
      const data = await this.service.getBroadcasts();
      return res.json(ServiceResult.success(data));
    } catch (error) {
      return next(error);
    }
  }

  async getCalendar(req, res, next) {
    try {
      const data = await this.service.getCalendar();
      return res.json(ServiceResult.success(data));
    } catch (error) {
      return next(error);
    }
  }

  async getOtpLogs(req, res, next) {
    try {
      const data = await this.service.getOtpLogs();
      return res.json(ServiceResult.success(data));
    } catch (error) {
      return next(error);
    }
  }

  async getSessions(req, res, next) {
    try {
      const data = await this.service.getSessions();
      return res.json(ServiceResult.success(data));
    } catch (error) {
      return next(error);
    }
  }

  async getSettings(req, res, next) {
    try {
      const data = await this.service.getSettings();
      return res.json(ServiceResult.success(data));
    } catch (error) {
      return next(error);
    }
  }

  async getHealth(req, res, next) {
    try {
      const data = await this.service.getHealth();
      return res.json(ServiceResult.success(data));
    } catch (error) {
      return next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const data = await this.service.getProfile();
      return res.json(ServiceResult.success(data));
    } catch (error) {
      return next(error);
    }
  }
}
