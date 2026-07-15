import { Router } from 'express';
import { requirePermission } from '../middleware/rbac.js';

export function createConversationManagementRouter(dependencies = {}) {
  const router = Router();
  const { logger } = dependencies;

  // Get all conversations
  router.get('/', requirePermission('conversations:view'), async (req, res) => {
    try {
      const { status, limit = 50, offset = 0 } = req.query;

      logger?.info?.('Fetching conversations', { status });

      const conversations = [
        {
          id: 'conv_1',
          parentName: 'John Doe',
          parentPhone: '+254712345678',
          studentNames: ['Jane Doe', 'Jack Doe'],
          messageCount: 15,
          status: 'completed',
          startedAt: new Date(Date.now() - 86400000),
          endedAt: new Date(Date.now() - 82800000),
          duration: '60 minutes',
          intent: 'fee_inquiry',
          resolution: 'resolved'
        },
        {
          id: 'conv_2',
          parentName: 'Jane Smith',
          parentPhone: '+254787654321',
          studentNames: ['Tom Smith'],
          messageCount: 8,
          status: 'active',
          startedAt: new Date(Date.now() - 3600000),
          endedAt: null,
          duration: '60 minutes',
          intent: 'results_inquiry',
          resolution: 'pending'
        }
      ];

      return res.json({
        success: true,
        data: conversations,
        total: conversations.length,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
    } catch (error) {
      logger?.error?.('Error fetching conversations', { message: error.message });
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get specific conversation
  router.get('/:conversationId', requirePermission('conversations:view'), async (req, res) => {
    try {
      const { conversationId } = req.params;

      logger?.info?.('Fetching conversation', { conversationId });

      const conversation = {
        id: conversationId,
        parentName: 'John Doe',
        parentPhone: '+254712345678',
        studentNames: ['Jane Doe'],
        messageCount: 15,
        status: 'completed',
        startedAt: new Date(Date.now() - 86400000),
        endedAt: new Date(Date.now() - 82800000),
        intent: 'fee_inquiry',
        resolution: 'resolved',
        notes: 'Parent inquired about pending fees'
      };

      return res.json({ success: true, data: conversation });
    } catch (error) {
      logger?.error?.('Error fetching conversation', { conversationId: req.params.conversationId, message: error.message });
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // Search conversations
  router.get('/search', requirePermission('conversations:view'), async (req, res) => {
    try {
      const { query, limit = 20 } = req.query;

      logger?.info?.('Searching conversations', { query });

      const results = [
        {
          id: 'conv_1',
          parentName: query,
          parentPhone: '+254712345678',
          messageCount: 15,
          status: 'completed'
        }
      ];

      return res.json({ success: true, data: results, total: results.length });
    } catch (error) {
      logger?.error?.('Error searching conversations', { message: error.message });
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get conversation messages
  router.get('/:conversationId/messages', requirePermission('conversations:view'), async (req, res) => {
    try {
      const { conversationId } = req.params;

      logger?.info?.('Fetching conversation messages', { conversationId });

      const messages = [
        {
          id: 'msg_1',
          sender: 'parent',
          text: 'What is my child\'s fee balance?',
          timestamp: new Date(Date.now() - 3600000),
          type: 'text'
        },
        {
          id: 'msg_2',
          sender: 'system',
          text: 'Jane Doe - Fee Balance: KES 15,000',
          timestamp: new Date(Date.now() - 3540000),
          type: 'text'
        }
      ];

      return res.json({ success: true, data: messages, total: messages.length });
    } catch (error) {
      logger?.error?.('Error fetching messages', { conversationId: req.params.conversationId, message: error.message });
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get conversation statistics
  router.get('/stats', requirePermission('conversations:view'), async (req, res) => {
    try {
      const { timeRange = '30d' } = req.query;

      logger?.info?.('Fetching conversation statistics', { timeRange });

      const stats = {
        totalConversations: 450,
        activeConversations: 45,
        completedConversations: 405,
        averageMessagesPerConversation: 12,
        averageDuration: '25 minutes',
        topIntents: ['fee_inquiry', 'results_inquiry', 'attendance_inquiry'],
        resolutionRate: 92
      };

      return res.json({ success: true, data: stats });
    } catch (error) {
      logger?.error?.('Error fetching conversation statistics', { message: error.message });
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // Export conversation
  router.get('/:conversationId/export', requirePermission('conversations:view'), async (req, res) => {
    try {
      const { conversationId } = req.params;
      const { format = 'pdf' } = req.query;

      logger?.info?.('Exporting conversation', { conversationId, format });

      res.setHeader('Content-Type', format === 'pdf' ? 'application/pdf' : 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="conversation-${conversationId}.${format === 'pdf' ? 'pdf' : 'txt'}"`);
      res.send('Conversation export content');
    } catch (error) {
      logger?.error?.('Error exporting conversation', { conversationId: req.params.conversationId, message: error.message });
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get conversation transcript
  router.get('/:conversationId/transcript', requirePermission('conversations:view'), async (req, res) => {
    try {
      const { conversationId } = req.params;

      logger?.info?.('Fetching conversation transcript', { conversationId });

      const transcript = {
        conversationId,
        transcript: `Parent: What is my child's fee balance?\nSystem: Jane Doe - Fee Balance: KES 15,000\nParent: Thank you\nSystem: You're welcome. Is there anything else?`,
        formattedAt: new Date()
      };

      return res.json({ success: true, data: transcript });
    } catch (error) {
      logger?.error?.('Error fetching transcript', { conversationId: req.params.conversationId, message: error.message });
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
}
