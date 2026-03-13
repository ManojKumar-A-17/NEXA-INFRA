import mongoose, { Schema, Document } from 'mongoose';

export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded'
  | 'disputed';

export type PaymentMethod = 'card' | 'bank_transfer' | 'wallet' | 'stripe';

export interface IPayment extends Document {
  _id: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  contractorId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  description: string;
  metadata?: {
    milestone?: string;
    phase?: string;
    notes?: string;
  };
  paidAt?: Date;
  refundedAt?: Date;
  refundAmount?: number;
  refundReason?: string;
  transactionFee: number;
  netAmount: number;
  receiptUrl?: string;
  invoiceNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
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
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'disputed'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'bank_transfer', 'wallet', 'stripe'],
      required: [true, 'Payment method is required'],
    },
    stripePaymentIntentId: {
      type: String,
      default: null,
    },
    stripeChargeId: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      required: [true, 'Payment description is required'],
      trim: true,
    },
    metadata: {
      milestone: { type: String },
      phase: { type: String },
      notes: { type: String },
    },
    paidAt: {
      type: Date,
      default: null,
    },
    refundedAt: {
      type: Date,
      default: null,
    },
    refundAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    refundReason: {
      type: String,
      trim: true,
    },
    transactionFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    netAmount: {
      type: Number,
      required: true,
    },
    receiptUrl: {
      type: String,
      default: null,
    },
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to calculate net amount
paymentSchema.pre('save', function (next) {
  if (this.isModified('amount') || this.isModified('transactionFee')) {
    this.netAmount = this.amount - this.transactionFee;
  }
  next();
});

// Indexes for efficient queries
paymentSchema.index({ userId: 1, status: 1 });
paymentSchema.index({ contractorId: 1, status: 1 });
paymentSchema.index({ projectId: 1 });
paymentSchema.index({ invoiceNumber: 1 });
paymentSchema.index({ stripePaymentIntentId: 1 });
paymentSchema.index({ createdAt: -1 });

const Payment = mongoose.model<IPayment>('Payment', paymentSchema);

export default Payment;
