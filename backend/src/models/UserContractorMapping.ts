import mongoose, { Schema, Document } from 'mongoose';

export interface IUserContractorMapping extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  contractorId: mongoose.Types.ObjectId;
  isFavorite: boolean;
  isBlocked: boolean;
  tags: string[];
  notes?: string;
  lastInteraction?: Date;
  projectsCompleted: number;
  totalSpent: number;
  rating?: number;
  customData?: {
    preferredForCategories?: string[];
    communicationPreference?: 'email' | 'phone' | 'chat';
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

const userContractorMappingSchema = new Schema<IUserContractorMapping>(
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
    isFavorite: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    tags: {
      type: [String],
      default: [],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
    lastInteraction: {
      type: Date,
      default: Date.now,
    },
    projectsCompleted: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
      min: 0,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
    },
    customData: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one mapping per user-contractor pair
userContractorMappingSchema.index({ userId: 1, contractorId: 1 }, { unique: true });

// Indexes for efficient queries
userContractorMappingSchema.index({ userId: 1, isFavorite: 1 });
userContractorMappingSchema.index({ userId: 1, isBlocked: 1 });
userContractorMappingSchema.index({ contractorId: 1 });
userContractorMappingSchema.index({ userId: 1, lastInteraction: -1 });

const UserContractorMapping = mongoose.model<IUserContractorMapping>(
  'UserContractorMapping',
  userContractorMappingSchema
);

export default UserContractorMapping;
