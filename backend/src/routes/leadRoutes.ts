import { Router } from 'express';
import {
  createLead,
  getLeads,
  getLead,
  updateLead,
  deleteLead,
  exportLeadsCSV,
  getDashboardStats,
} from '../controllers/leadController';
import { authenticate } from '../middleware/auth';
import { validateLead } from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Static routes MUST come before /:id to avoid conflicts
router.get('/export/csv', exportLeadsCSV);
router.get('/stats/dashboard', getDashboardStats);

// CRUD routes
router.post('/', validateLead, createLead);
router.get('/', getLeads);
router.get('/:id', getLead);
router.put('/:id', validateLead, updateLead);
router.delete('/:id', deleteLead);

export default router;
