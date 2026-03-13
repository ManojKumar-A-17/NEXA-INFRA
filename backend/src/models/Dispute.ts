import mongoose, { Schema, Document } from 'mongoose';

export type DisputeStatus = 'open' | 'under_review' | 'resolved' | 'closed' | 'escalated';

export interface IDispute extends Document {
  _id: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  raisedBy: mongoose.Types.ObjectId;
  raisedAgainst: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: 'payment' | 'quality' | 'delay' | 'communication' | 'contract_breach' | 'other';
  status: DisputeStatus;
  priority: 'low' | 'medium' | 'high' | 'critical';
  evidence: Array<{
    type: 'image' | 'document' | 'video';
    url: string;
    description?: string;
    uploadedAt: Date;
  }>;
  timeline: Array<{
    action: string;
    performedBy: mongoose.Types.ObjectId;
    notes?: string;
    timestamp: Date;
  }>;
  resolution?: {
    resolvedBy: mongoose.Types.ObjectId;
    resolution: string;
    compensation?: number;
    resolvedAt: Date;
  };
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const disputeSchema = new Schema<IDispute>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
    },
    raisedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Raised by user ID is required'],
    },
    raisedAgainst: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Raised against user ID is required'],
    },
    title: {
      type: String,
      required: [true, 'Dispute title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Dispute description is required'],
      trim: true,
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    category: {
      type: String,
      enum: ['payment', 'quality', 'delay', 'communication', 'contract_breach', 'other'],
      required: [true, 'Dispute category is required'],
    },
    status: {
      type: String,
      enum: ['open', 'under_review', 'resolved', 'closed', 'escalated'],
      default: 'open',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    evidence: [
      {
        type: {
          type: String,
          enum: ['image', 'document', 'video'],
          required: true,
        },
        url: { type: String, required: true },
        description: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    timeline: [
      {
        action: { type: String, required: true },
        performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        notes: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    resolution: {
      resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      resolution: { type: String },
      compensation: { type: Number },
      resolvedAt: { type: Date },
    },
    adminNotes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
disputeSchema.index({ projectId: 1 });
disputeSchema.index({ raisedBy: 1, status: 1 });
disputeSchema.index({ raisedAgainst: 1, status: 1 });
disputeSchema.index({ status: 1, priority: -1 });
disputeSchema.index({ createdAt: -1 });

const Dispute = mongoose.model<IDispute>('Dispute', disputeSchema);

export default Dispute;
