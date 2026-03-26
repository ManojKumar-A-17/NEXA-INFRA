import { Request, Response, NextFunction } from 'express';
import Conversation from '../models/Conversation';
import Contractor from '../models/Contractor';
import { AppError, catchAsync } from '../middleware/error.middleware';
import mongoose from 'mongoose';

type AuthenticatedUser = NonNullable<Request['user']>;

const populateConversationById = (conversationId: mongoose.Types.ObjectId | string) =>
  Conversation.findById(conversationId)
    .populate('userId', 'name email avatar phone')
    .populate({
      path: 'contractorId',
      select: 'company specialties rating hourlyRate userId',
      populate: { path: 'userId', select: 'name email avatar phone' },
    })
    .populate('projectId', 'title status budget');

const getConversationAccessFilter = async (user: AuthenticatedUser) => {
  if (user.role === 'contractor') {
    const contractor = await Contractor.findOne({ userId: user.userId }).select('_id');

    if (!contractor) {
      return null;
    }

    return { contractorId: contractor._id };
  }

  return { userId: user.userId };
};

const isConversationParticipant = async (
  conversation: {
    userId: mongoose.Types.ObjectId | { _id: mongoose.Types.ObjectId };
    contractorId: mongoose.Types.ObjectId | { _id: mongoose.Types.ObjectId };
  },
  user: AuthenticatedUser
) => {
  if (user.role === 'super_admin') {
    return true;
  }

  const conversationUserId =
    (conversation.userId as { _id?: mongoose.Types.ObjectId })._id?.toString() ||
    conversation.userId.toString();
  const conversationContractorId =
    (conversation.contractorId as { _id?: mongoose.Types.ObjectId })._id?.toString() ||
    conversation.contractorId.toString();

  if (user.role === 'user') {
    return conversationUserId === user.userId;
  }

  const contractor = await Contractor.findOne({ userId: user.userId }).select('_id');
  return conversationContractorId === contractor?._id.toString();
};

const getConversationParticipantRole = async (
  conversation: {
    userId: mongoose.Types.ObjectId | { _id: mongoose.Types.ObjectId };
    contractorId: mongoose.Types.ObjectId | { _id: mongoose.Types.ObjectId };
  },
  user: AuthenticatedUser
) => {
  if (user.role === 'super_admin') {
    return 'admin' as const;
  }

  const conversationUserId =
    (conversation.userId as { _id?: mongoose.Types.ObjectId })._id?.toString() ||
    conversation.userId.toString();

  if (conversationUserId === user.userId) {
    return 'user' as const;
  }

  const contractor = await Contractor.findOne({ userId: user.userId }).select('_id');
  const conversationContractorId =
    (conversation.contractorId as { _id?: mongoose.Types.ObjectId })._id?.toString() ||
    conversation.contractorId.toString();

  if (contractor?._id.toString() === conversationContractorId) {
    return 'contractor' as const;
  }

  return null;
};

/**
 * Get all conversations for the current user
 * GET /api/conversations
 */
export const getConversations = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const accessFilter = await getConversationAccessFilter(req.user);

    if (!accessFilter) {
      res.status(200).json({
        success: true,
        data: { conversations: [] },
      });
      return;
    }

    const filter: any =
      req.user.role === 'super_admin'
        ? { isActive: true }
        : { isActive: true, ...accessFilter };

    const conversations = await Conversation.find(filter)
      .populate('userId', 'name email avatar')
      .populate({
        path: 'contractorId',
        select: 'company specialties rating hourlyRate userId',
        populate: { path: 'userId', select: 'name email avatar phone' },
      })
      .populate('projectId', 'title status')
      .sort({ lastMessageTime: -1 });

    res.status(200).json({
      success: true,
      data: { conversations },
    });
  }
);

/**
 * Get single conversation with messages
 * GET /api/conversations/:id
 */
export const getConversation = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid conversation ID', 400));
    }

    const conversation = await populateConversationById(id);

    if (!conversation) {
      return next(new AppError('Conversation not found', 404));
    }

    // Check permission
    if (!(await isConversationParticipant(conversation, req.user))) {
      return next(new AppError('You do not have permission to view this conversation', 403));
    }

    res.status(200).json({
      success: true,
      data: { conversation },
    });
  }
);

/**
 * Create new conversation
 * POST /api/conversations
 */
export const createConversation = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const { contractorId, projectId, message } = req.body;

    if (!contractorId) {
      return next(new AppError('Contractor ID is required', 400));
    }

    if (!mongoose.Types.ObjectId.isValid(contractorId)) {
      return next(new AppError('Invalid contractor ID', 400));
    }

    // Check if conversation already exists
    const existingConversation = await Conversation.findOne({
      userId: req.user.userId,
      contractorId,
    });

    if (existingConversation) {
      res.status(200).json({
        success: true,
        message: 'Conversation already exists',
        data: { conversation: existingConversation },
      });
      return;
    }

    // Create new conversation
    const conversation = await Conversation.create({
      userId: req.user.userId,
      contractorId,
      projectId: projectId || null,
      messages: message
        ? [
            {
              senderId: req.user.userId,
              message,
              timestamp: new Date(),
              isRead: false,
            },
          ]
        : [],
      lastMessage: message || null,
      lastMessageTime: message ? new Date() : null,
      unreadCount: {
        user: 0,
        contractor: message ? 1 : 0,
      },
    });

    const populatedConversation = await populateConversationById(conversation._id);

    res.status(201).json({
      success: true,
      message: 'Conversation created successfully',
      data: { conversation: populatedConversation },
    });
  }
);

/**
 * Send message in conversation
 * POST /api/conversations/:id/messages
 */
export const sendMessage = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const { id } = req.params;
    const { message, attachments } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid conversation ID', 400));
    }

    if (!message || message.trim().length === 0) {
      return next(new AppError('Message content is required', 400));
    }

    const conversation = await Conversation.findById(id);

    if (!conversation) {
      return next(new AppError('Conversation not found', 404));
    }

    // Check permission
    const participantRole = await getConversationParticipantRole(conversation, req.user);

    if (!participantRole) {
      return next(new AppError('You do not have permission to send messages in this conversation', 403));
    }

    // Add message
    conversation.messages.push({
      senderId: new mongoose.Types.ObjectId(req.user.userId),
      message: message.trim(),
      timestamp: new Date(),
      isRead: false,
      attachments: attachments || [],
    });

    // Update conversation metadata
    conversation.lastMessage = message.trim();
    conversation.lastMessageTime = new Date();

    // Update unread count
    if (participantRole === 'user') {
      conversation.unreadCount.contractor += 1;
    } else {
      conversation.unreadCount.user += 1;
    }

    await conversation.save();

    const populatedConversation = await populateConversationById(id);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: { conversation: populatedConversation },
    });
  }
);

/**
 * Mark messages as read
 * PUT /api/conversations/:id/read
 */
export const markAsRead = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid conversation ID', 400));
    }

    const conversation = await Conversation.findById(id);

    if (!conversation) {
      return next(new AppError('Conversation not found', 404));
    }

    // Check permission
    const participantRole = await getConversationParticipantRole(conversation, req.user);

    if (!participantRole) {
      return next(new AppError('You do not have permission to update this conversation', 403));
    }

    // Mark messages as read
    conversation.messages.forEach((msg) => {
      if (msg.senderId.toString() !== req.user!.userId) {
        msg.isRead = true;
      }
    });

    // Reset unread count
    if (participantRole === 'user') {
      conversation.unreadCount.user = 0;
    } else {
      conversation.unreadCount.contractor = 0;
    }

    await conversation.save();

    const populatedConversation = await populateConversationById(id);

    res.status(200).json({
      success: true,
      message: 'Messages marked as read',
      data: { conversation: populatedConversation },
    });
  }
);

/**
 * Delete/Archive conversation
 * DELETE /api/conversations/:id
 */
export const deleteConversation = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid conversation ID', 400));
    }

    const conversation = await Conversation.findById(id);

    if (!conversation) {
      return next(new AppError('Conversation not found', 404));
    }

    // Check permission
    if (
      !(await isConversationParticipant(conversation, req.user))
    ) {
      return next(new AppError('You do not have permission to delete this conversation', 403));
    }

    // Soft delete by marking as inactive
    conversation.isActive = false;
    await conversation.save();

    res.status(200).json({
      success: true,
      message: 'Conversation archived successfully',
    });
  }
);
