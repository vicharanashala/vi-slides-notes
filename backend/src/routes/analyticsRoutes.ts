import express from 'express';
import { getSessionAnalytics, analyzeSessionMoodHandler } from '../controllers/analyticsController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/:sessionCode', protect, getSessionAnalytics);
router.post('/:sessionCode/mood', protect, analyzeSessionMoodHandler);

export default router;
