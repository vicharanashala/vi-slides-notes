import { Router } from 'express';
import { analyzeQuestion } from '../controllers/ai.controller';

const router = Router();

router.post('/analyze', analyzeQuestion);

export default router;
