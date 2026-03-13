import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalytics extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userType: 'user' | 'contractor' | 'admin';
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  periodDate: Date; // Start date of the period
  
  // Project metrics
  projectMetrics: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    cancelledProjects: number;
    pendingProjects: number;
    averageProjectValue: number;
    averageCompletionTime: number; // in days
  };
  
  // Financial metrics
  financialMetrics: {
    totalRevenue: number;
    totalSpent: number;
    pendingPayments: number;
    completedPayments: number;
    averageTransactionValue: number;
    totalTransactionFees: number;
  };
  
  // Performance metrics
  performanceMetrics: {
    averageRating: number;
    totalReviews: number;
    completionRate: number;
    responseTime: number; // average in hours
    disputeRate: number;
    onTimeDeliveryRate: number;
  };
  
  // Engagement metrics
  engagementMetrics: {
    totalMessages: number;
    newConversations: number;
    profileViews?: number;
    projectInquiries?: number;
    contractorSearches?: number;
  };
  
  // Custom data for charts
  chartData?: {
    revenueByMonth?: Array<{ month: string; amount: number }>;
    projectsByStatus?: Array<{ status: string; count: number }>;
    topContractors?: Array<{ contractorId: mongoose.Types.ObjectId; spent: number }>;
    topCategories?: Array<{ category: string; count: number }>;
    [key: string]: any;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

const analyticsSchema = new Schema<IAnalytics>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    userType: {
      type: String,
      enum: ['user', 'contractor', 'admin'],
      required: [true, 'User type is required'],
    },
    period: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
      required: [true, 'Period is required'],
    },
    periodDate: {
      type: Date,
      required: [true, 'Period date is required'],
    },
    projectMetrics: {
      totalProjects: { type: Number, default: 0 },
      activeProjects: { type: Number, default: 0 },
      completedProjects: { type: Number, default: 0 },
      cancelledProjects: { type: Number, default: 0 },
      pendingProjects: { type: Number, default: 0 },
      averageProjectValue: { type: Number, default: 0 },
      averageCompletionTime: { type: Number, default: 0 },
    },
    financialMetrics: {
      totalRevenue: { type: Number, default: 0 },
      totalSpent: { type: Number, default: 0 },
      pendingPayments: { type: Number, default: 0 },
      completedPayments: { type: Number, default: 0 },
      averageTransactionValue: { type: Number, default: 0 },
      totalTransactionFees: { type: Number, default: 0 },
    },
    performanceMetrics: {
      averageRating: { type: Number, default: 0 },
      totalReviews: { type: Number, default: 0 },
      completionRate: { type: Number, default: 0 },
      responseTime: { type: Number, default: 0 },
      disputeRate: { type: Number, default: 0 },
      onTimeDeliveryRate: { type: Number, default: 0 },
    },
    engagementMetrics: {
      totalMessages: { type: Number, default: 0 },
      newConversations: { type: Number, default: 0 },
      profileViews: { type: Number, default: 0 },
      projectInquiries: { type: Number, default: 0 },
      contractorSearches: { type: Number, default: 0 },
    },
    chartData: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one analytics record per user per period
analyticsSchema.index({ userId: 1, period: 1, periodDate: 1 }, { unique: true });

// Indexes for efficient queries
analyticsSchema.index({ userId: 1, periodDate: -1 });
analyticsSchema.index({ userType: 1, period: 1 });
analyticsSchema.index({ periodDate: -1 });

const Analytics = mongoose.model<IAnalytics>('Analytics', analyticsSchema);

export default Analytics;
