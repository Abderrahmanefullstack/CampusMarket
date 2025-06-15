import express, { RequestHandler } from 'express';
import { createMessage, getConversation, getConversations, getConversationStats } from '../controllers/message.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

// Créer un nouveau message
router.post('', createMessage);

// Obtenir une conversation spécifique
router.get('/:postId/:receiverId', getConversation);

// Obtenir toutes les conversations de l'utilisateur
router.get('', getConversations);

// Obtenir les statistiques des conversations
router.get('/stats', getConversationStats as RequestHandler);

export default router; 