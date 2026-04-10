import express from 'express';
import { createSession, joinSession, updateSessionStatus } from '../controllers/sessionController';

const router = express.Router();

router.post('/', createSession);
router.post('/join', joinSession);
router.put('/:sessionCode/status', updateSessionStatus);

export default router;
