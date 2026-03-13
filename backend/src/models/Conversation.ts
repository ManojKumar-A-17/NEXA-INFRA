import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage {
  senderId: mongoose.Types.ObjectId;
  message: string;
  timestamp: Date;
  isRead: boolean;
  attachments?: string[];
}

export interface IConversation extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  contractorId: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  messages: IMessage[];
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: {
    user: number;
    contractor: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
      maxlength: [5000, 'Message cannot exceed 5000 characters'],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    attachments: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

const conversationSchema = new Schema<IConversation>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    contractorId: {
      type: Schema.Types.ObjectId,
      ref: 'Contractor',
      required: [true, 'Contractor ID is required'],
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
    },
    messages: {
      type: [messageSchema],
      default: [],
    },
    lastMessage: {
      type: String,
      default: null,
    },
    lastMessageTime: {
      type: Date,
      default: null,
    },
    unreadCount: {
      user: { type: Number, default: 0 },
      contractor: { type: Number, default: 0 },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
conversationSchema.index({ userId: 1, contractorId: 1 });
conversationSchema.index({ userId: 1, isActive: 1 });
conversationSchema.index({ contractorId: 1, isActive: 1 });
conversationSchema.index({ lastMessageTime: -1 });

const Conversation = mongoose.model<IConversation>('Conversation', conversationSchema);

export default Conversation;
