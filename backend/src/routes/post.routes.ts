import { Router, RequestHandler } from 'express';
import { createPost, getAllPosts, getPost, updatePost, deletePost } from '../controllers/post.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { uploadImages } from '../middleware/multer.middleware';
import { AuthRequest } from '../types/express';

const router = Router();

// Routes protégées par l'authentification
router.post('', authMiddleware as RequestHandler, uploadImages, createPost as any);
router.get('/', getAllPosts);
router.get('/:id', getPost);
router.put('/:id', authMiddleware as RequestHandler, uploadImages, updatePost as any);
router.delete('/:id', authMiddleware as RequestHandler, deletePost as any);

export default router; 