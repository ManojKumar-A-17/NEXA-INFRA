import mongoose, { Schema, Document } from 'mongoose';

export type NotificationType = 
  | 'project_update'
  | 'message'
  | 'payment'
  | 'review'
  | 'contractor_assigned'
  | 'project_completed'
  | 'dispute'
  | 'system'
  | 'milestone_reached';

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  data?: {
    projectId?: mongoose.Types.ObjectId;
    contractorId?: mongoose.Types.ObjectId;
    paymentId?: mongoose.Types.ObjectId;
    conversationId?: mongoose.Types.ObjectId;
    reviewId?: mongoose.Types.ObjectId;
    actionUrl?: string;
  };
  isRead: boolean;
  isArchived: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    type: {
      type: String,
      enum: [
        'project_update',
        'message',
        'payment',
        'review',
        'contractor_assigned',
        'project_completed',
        'dispute',
        'system',
        'milestone_reached',
      ],
      required: [true, 'Notification type is required'],
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    data: {
      projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
      contractorId: { type: Schema.Types.ObjectId, ref: 'Contractor' },
      paymentId: { type: Schema.Types.ObjectId, ref: 'Payment' },
      conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation' },
      reviewId: { type: Schema.Types.ObjectId, ref: 'Review' },
      actionUrl: { type: String },
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
notificationSchema.index({ userId: 1, isRead: 1, isArchived: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 });
notificationSchema.index({ type: 1 });

// TTL index to auto-delete expired notifications
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Notification = mongoose.model<INotification>('Notification', notificationSchema);

export default Notification;
