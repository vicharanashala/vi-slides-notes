import express from 'express';
import { protect } from '../middleware/auth';
import { getDashboardByRole } from '../controllers/dashboardController';

const router = express.Router();

router.get('/:role', protect, getDashboardByRole);

export default router;