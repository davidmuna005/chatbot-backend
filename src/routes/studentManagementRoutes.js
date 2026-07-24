/**
 * Student Management Routes
 */

import { Router } from 'express';
import { verifyToken, requirePermission } from '../middleware/rbac.js';
import { StudentService } from '../services/studentService.js';
import { AuditService } from '../services/auditService.js';

export function createStudentManagementRouter(dependencies = {}) {
  const router = Router();
  const { database, connectorRegistry, logger } = dependencies;
  
  const studentService = new StudentService({ database, connectorRegistry, logger });
  const auditService = new AuditService({ database, logger });

  router.use(verifyToken);

  /**
   * GET /api/v1/admin/students - Search students
   */
  router.get('/', requirePermission('students:view'), async (req, res) => {
    try {
      const { search, searchBy = 'name', status, limit = 50, offset = 0 } = req.query;
      
      const result = await studentService.searchStudents(
        { searchTerm: search, searchBy, status },
        parseInt(limit),
        parseInt(offset)
      );

      await auditService.logSensitiveOperation(req, 'STUDENT_SEARCH', 'students', {
        searchTerm: search,
        resultCount: result.data?.length || 0,
      });

      res.json(result);
    } catch (error) {
      logger?.error?.('Student search error', { error: error.message });
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  /**
   * POST /api/v1/admin/students - Create student
   */
  router.post('/', requirePermission('students:manage'), async (req, res) => {
    try {
      const result = await studentService.create(req.body);

      await auditService.logSensitiveOperation(req, 'STUDENT_CREATE', 'students', {
        studentId: result?.data?.studentId || result?.data?.id,
      });

      res.json(result);
    } catch (error) {
      logger?.error?.('Create student error', { error: error.message });
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  /**
   * GET /api/v1/admin/students/:id - Get student profile
   */
  router.get('/:id', requirePermission('students:view'), async (req, res) => {
    try {
      const result = await studentService.getStudentProfile(req.params.id);

      await auditService.logSensitiveOperation(req, 'STUDENT_PROFILE_VIEW', 'students', {
        studentId: req.params.id,
      });

      res.json(result);
    } catch (error) {
      logger?.error?.('Get student error', { error: error.message });
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  /**
   * GET /api/v1/admin/students/:id/status - Get student status
   */
  router.get('/:id/status', requirePermission('students:view'), async (req, res) => {
    try {
      const result = await studentService.getStudentStatus(req.params.id);
      res.json(result);
    } catch (error) {
      logger?.error?.('Get student status error', { error: error.message });
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  /**
   * GET /api/v1/admin/students/:id/attendance - Attendance records
   */
  router.get('/:id/attendance', requirePermission('students:view'), async (req, res) => {
    try {
      const { term, academicYear } = req.query;
      const result = await studentService.getAttendance(req.params.id, { term, academicYear });
      res.json(result);
    } catch (error) {
      logger?.error?.('Get attendance error', { error: error.message });
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  /**
   * GET /api/v1/admin/students/:id/results - Academic results
   */
  router.get('/:id/results', requirePermission('students:view'), async (req, res) => {
    try {
      const { term, academicYear } = req.query;
      const result = await studentService.getResults(req.params.id, { term, academicYear });
      res.json(result);
    } catch (error) {
      logger?.error?.('Get results error', { error: error.message });
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  /**
   * GET /api/v1/admin/students/:id/fees - Fee balance
   */
  router.get('/:id/fees', requirePermission('students:view'), async (req, res) => {
    try {
      const { term, academicYear } = req.query;
      const result = await studentService.getFeeBalance(req.params.id, { term, academicYear });
      res.json(result);
    } catch (error) {
      logger?.error?.('Get fee balance error', { error: error.message });
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  /**
   * GET /api/v1/admin/students/:id/discipline - Discipline records
   */
  router.get('/:id/discipline', requirePermission('students:view'), async (req, res) => {
    try {
      const result = await studentService.getDiscipline(req.params.id);
      res.json(result);
    } catch (error) {
      logger?.error?.('Get discipline error', { error: error.message });
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  return router;
}
