import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from 'dotenv';
import { connectDatabase } from './config/database';
import { errorHandler } from './middleware/error.middleware';

// Load environment variables
config();

// Initialize Express app
const app: Application = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'NEXA INFRA API is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
import authRoutes from './routes/auth.routes';
import projectRoutes from './routes/project.routes';
import contractorRoutes from './routes/contractor.routes';
import conversationRoutes from './routes/conversation.routes';
import paymentRoutes from './routes/payment.routes';
import reviewRoutes from './routes/review.routes';
import disputeRoutes from './routes/dispute.routes';
import notificationRoutes from './routes/notification.routes';
import adminRoutes from './routes/admin.routes';

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/contractors', contractorRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDatabase();
    
    // Start Express server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
    });

    // Socket.io setup (for chat functionality)
    // TODO: Initialize Socket.io server
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('SIGINT signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
