import { Router, RequestHandler } from 'express';
import { signup, signin } from '../controllers/auth.controller';

const router = Router();

router.post('/signup', signup as RequestHandler);
router.post('/signin', signin as RequestHandler);

export default router; 