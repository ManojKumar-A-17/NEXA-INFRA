import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  _id: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  contractorId: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  reviewType: 'user_to_contractor' | 'contractor_to_user';
  aspects?: {
    quality: number;
    communication: number;
    timeliness: number;
    professionalism: number;
  };
  isVerified: boolean;
  isPublic: boolean;
  response?: {
    message: string;
    respondedAt: Date;
  };
  helpful: {
    count: number;
    users: mongoose.Types.ObjectId[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
    },
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
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true,
      minlength: [10, 'Comment must be at least 10 characters'],
      maxlength: [2000, 'Comment cannot exceed 2000 characters'],
    },
    reviewType: {
      type: String,
      enum: ['user_to_contractor', 'contractor_to_user'],
      required: true,
    },
    aspects: {
      quality: {
        type: Number,
        min: 1,
        max: 5,
      },
      communication: {
        type: Number,
        min: 1,
        max: 5,
      },
      timeliness: {
        type: Number,
        min: 1,
        max: 5,
      },
      professionalism: {
        type: Number,
        min: 1,
        max: 5,
      },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    response: {
      message: { type: String },
      respondedAt: { type: Date },
    },
    helpful: {
      count: { type: Number, default: 0 },
      users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
reviewSchema.index({ contractorId: 1, isPublic: 1 });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ projectId: 1 });
reviewSchema.index({ rating: -1 });
reviewSchema.index({ createdAt: -1 });

// Ensure one review per user per project
reviewSchema.index({ userId: 1, projectId: 1, reviewType: 1 }, { unique: true });

const Review = mongoose.model<IReview>('Review', reviewSchema);

export default Review;
