import { Router } from 'express';
import {
  getContractors,
  getContractor,
  getMyContractorProfile,
  updateContractor,
  addPortfolioItem,
  addCertification,
  favoriteContractor,
  blockContractor,
  getFavoriteContractors,
} from '../controllers/contractor.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route   GET /api/contractors
 * @desc    Browse/Search contractors
 * @access  Public
 */
router.get('/', getContractors);

/**
 * @route   GET /api/contractors/favorites
 * @desc    Get user's favorite contractors
 * @access  Private
 */
router.get('/favorites', authenticate, getFavoriteContractors);

/**
 * @route   GET /api/contractors/me
 * @desc    Get current contractor profile
 * @access  Private (Contractor)
 */
router.get('/me', authenticate, getMyContractorProfile);

/**
 * @route   GET /api/contractors/:id
 * @desc    Get contractor profile by ID
 * @access  Public
 */
router.get('/:id', getContractor);

/**
 * @route   PUT /api/contractors/:id
 * @desc    Update contractor profile
 * @access  Private (Contractor owner or Admin)
 */
router.put('/:id', authenticate, updateContractor);

/**
 * @route   POST /api/contractors/:id/portfolio
 * @desc    Add portfolio item
 * @access  Private (Contractor owner or Admin)
 */
router.post('/:id/portfolio', authenticate, addPortfolioItem);

/**
 * @route   POST /api/contractors/:id/certifications
 * @desc    Add certification
 * @access  Private (Contractor owner or Admin)
 */
router.post('/:id/certifications', authenticate, addCertification);

/**
 * @route   POST /api/contractors/:id/favorite
 * @desc    Favorite/Unfavorite a contractor
 * @access  Private
 */
router.post('/:id/favorite', authenticate, favoriteContractor);

/**
 * @route   POST /api/contractors/:id/block
 * @desc    Block/Unblock a contractor
 * @access  Private
 */
router.post('/:id/block', authenticate, blockContractor);

export default router;
