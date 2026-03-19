import mongoose, { Schema, Document } from 'mongoose';

export type ProjectStatus = 
  | 'pending' 
  | 'approved' 
  | 'in_progress' 
  | 'completed' 
  | 'disputed' 
  | 'cancelled';

export interface IProject extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  contractorId?: mongoose.Types.ObjectId;
  title: string;
  description: string;
  type: string;
  budget: number;
  status: ProjectStatus;
  startDate?: Date;
  endDate?: Date;
  estimatedDuration: number; // in days
  location: string;
  requirements: string[];
  attachments: string[];
  progress: number; // 0-100
  milestones: Array<{
    title: string;
    description: string;
    dueDate: Date;
    isCompleted: boolean;
    completedDate?: Date;
  }>;
  timeline: string;
  notes?: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  rejectionReason?: string;
  conversationId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    contractorId: {
      type: Schema.Types.ObjectId,
      ref: 'Contractor',
      default: null,
    },
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
      trim: true,
      minlength: [20, 'Description must be at least 20 characters'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    type: {
      type: String,
      required: [true, 'Project type is required'],
      trim: true,
    },
    budget: {
      type: Number,
      required: [true, 'Budget is required'],
      min: [0, 'Budget cannot be negative'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'in_progress', 'completed', 'disputed', 'cancelled'],
      default: 'pending',
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    estimatedDuration: {
      type: Number,
      required: [true, 'Estimated duration is required'],
      min: [1, 'Duration must be at least 1 day'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    requirements: {
      type: [String],
      default: [],
    },
    attachments: {
      type: [String],
      default: [],
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    milestones: [
      {
        title: { type: String, required: true },
        description: { type: String },
        dueDate: { type: Date, required: true },
        isCompleted: { type: Boolean, default: false },
        completedDate: { type: Date },
      },
    ],
    timeline: {
      type: String,
      required: [true, 'Timeline is required'],
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Notes cannot exceed 2000 characters'],
    },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: [500, 'Rejection reason cannot exceed 500 characters'],
    },
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for efficient queries
projectSchema.index({ userId: 1, status: 1 });
projectSchema.index({ contractorId: 1, status: 1 });
projectSchema.index({ status: 1, createdAt: -1 });
projectSchema.index({ approvalStatus: 1, createdAt: -1 });

const Project = mongoose.model<IProject>('Project', projectSchema);

export default Project;
