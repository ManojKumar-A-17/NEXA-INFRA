import { Router } from 'express';
import {
  getConversations,
  getConversation,
  createConversation,
  sendMessage,
  markAsRead,
  deleteConversation,
} from '../controllers/conversation.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/conversations
 * @desc    Get all conversations for current user
 * @access  Private
 */
router.get('/', getConversations);

/**
 * @route   POST /api/conversations
 * @desc    Create new conversation
 * @access  Private
 */
router.post('/', createConversation);

/**
 * @route   GET /api/conversations/:id
 * @desc    Get single conversation with messages
 * @access  Private
 */
router.get('/:id', getConversation);

/**
 * @route   POST /api/conversations/:id/messages
 * @desc    Send message in conversation
 * @access  Private
 */
router.post('/:id/messages', sendMessage);

/**
 * @route   PUT /api/conversations/:id/read
 * @desc    Mark messages as read
 * @access  Private
 */
router.put('/:id/read', markAsRead);

/**
 * @route   DELETE /api/conversations/:id
 * @desc    Delete/Archive conversation
 * @access  Private
 */
router.delete('/:id', deleteConversation);

export default router;
