import express from 'express';
import {
  createReview,
  getContractorReviews,
  getReview,
  updateReview,
  respondToReview,
  markHelpful,
  deleteReview,
} from '../controllers/review.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Create review (authenticated)
router.post('/', authenticate, createReview);

// Get contractor reviews (public)
router.get('/contractor/:contractorId', getContractorReviews);

// Get single review (public)
router.get('/:id', getReview);

// Update review (authenticated, owner only)
router.put('/:id', authenticate, updateReview);

// Respond to review (authenticated, contractor only)
router.post('/:id/response', authenticate, respondToReview);

// Mark review as helpful (authenticated)
router.post('/:id/helpful', authenticate, markHelpful);

// Delete review (authenticated, owner only)
router.delete('/:id', authenticate, deleteReview);

export default router;
