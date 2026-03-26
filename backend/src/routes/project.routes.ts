import { Router } from 'express';
import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  updateProjectStatus,
  assignContractor,
  addMilestone,
  updateMilestone,
  approveProject,
  rejectProject,
  getPendingProjects,
} from '../controllers/project.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/projects
 * @desc    Create a new project
 * @access  Private (User)
 */
router.post('/', createProject);

/**
 * @route   GET /api/projects
 * @desc    Get all projects (filtered by role)
 * @access  Private
 */
router.get('/', getProjects);

/**
 * @route   GET /api/projects/admin/pending
 * @desc    Get all pending projects for admin approval
 * @access  Private (Admin only)
 */
router.get('/admin/pending', getPendingProjects);

/**
 * @route   GET /api/projects/:id
 * @desc    Get single project by ID
 * @access  Private
 */
router.get('/:id', getProject);

/**
 * @route   PUT /api/projects/:id
 * @desc    Update project
 * @access  Private (Owner or Admin)
 */
router.put('/:id', updateProject);

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete project
 * @access  Private (Owner or Admin)
 */
router.delete('/:id', deleteProject);

/**
 * @route   PUT /api/projects/:id/status
 * @desc    Update project status
 * @access  Private (Owner, Contractor, or Admin)
 */
router.put('/:id/status', updateProjectStatus);

/**
 * @route   POST /api/projects/:id/assign
 * @desc    Assign contractor to project
 * @access  Private (Owner or Admin)
 */
router.post('/:id/assign', assignContractor);

/**
 * @route   POST /api/projects/:id/milestones
 * @desc    Add milestone to project
 * @access  Private (Owner, Contractor, or Admin)
 */
router.post('/:id/milestones', addMilestone);

/**
 * @route   PUT /api/projects/:id/milestones/:milestoneIndex
 * @desc    Update milestone
 * @access  Private (Contractor or Admin)
 */
router.put('/:id/milestones/:milestoneIndex', updateMilestone);

/**
 * @route   POST /api/projects/:id/approve
 * @desc    Approve project request and assign contractor
 * @access  Private (Admin only)
 */
router.post('/:id/approve', approveProject);

/**
 * @route   POST /api/projects/:id/reject
 * @desc    Reject project request
 * @access  Private (Admin only)
 */
router.post('/:id/reject', rejectProject);

export default router;
