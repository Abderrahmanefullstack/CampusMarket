import { Request, Response, RequestHandler } from 'express';
import { isValidObjectId } from 'mongoose';
import { Message } from '../models/message.model';
import { AuthRequest } from '../types/express';
import { Post } from '../models/post.model'; // Import du modèle Post

// Envoyer un message
export const sendMessage = async (req: AuthRequest, res: Response) => {
    try {
        const { receiverId, postId, content } = req.body;
        const senderId = req.user?.id;

        if (!senderId) {
            return res.status(401).json({ message: 'Non authentifié' });
        }

        const message = new Message({
            senderId,
            receiverId,
            postId,
            content
        });

        await message.save();
        await message.populate('senderId', 'name email');
        await message.populate('receiverId', 'name email');
        await message.populate('postId', 'title');

        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de l\'envoi du message', error });
    }
};

// Obtenir les conversations de l'utilisateur
export const getConversations: RequestHandler = async (req, res) => {
    try {
        const userId = (req as AuthRequest).user?.id;

        if (!userId) {
            res.status(401).json({ message: 'Non authentifié' });
            return;
        }

        const conversations = await Message.find({
            $or: [{ sender: userId }, { receiver: userId }]
        })
            .populate('sender', 'name email')
            .populate('receiver', 'name email')
            .populate('post', 'title')
            .sort({ createdAt: -1 });

        res.json(conversations);
    } catch (error) {
        console.error('Erreur lors de la récupération des conversations:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des conversations' });
    }
};

// Marquer un message comme lu
export const markAsRead = async (req: AuthRequest, res: Response) => {
    try {
        const messageId = req.params.id;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'Non authentifié' });
        }

        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({ message: 'Message non trouvé' });
        }

        if (message.receiver.toString() !== userId) {
            return res.status(403).json({ message: 'Non autorisé' });
        }

        message.read = true;
        await message.save();

        res.json(message);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la mise à jour du message', error });
    }
};

// Créer un nouveau message
export const createMessage: RequestHandler = async (req, res) => {
    try {
        const { receiverId, postId, content } = req.body;
        const senderId = (req as AuthRequest).user?.id;

        // *** LOG DE DEBUG TEMPORAIRE ***
        console.log('Backend - createMessage:');
        console.log('receiverId:', receiverId);
        console.log('postId:', postId);
        console.log('content:', content);
        console.log('senderId:', senderId);
        // *****************************

        if (!senderId) {
            res.status(401).json({ message: 'Non authentifié' });
            return;
        }

        if (!isValidObjectId(receiverId) || !isValidObjectId(postId)) {
            res.status(400).json({ message: 'IDs invalides pour le récepteur ou le post' });
            return;
        }

        const post = await Post.findById(postId);
        if (!post) {
            res.status(404).json({ message: 'Post non trouvé' });
            return;
        }

        if (post.userId.toString() !== receiverId) {
            res.status(403).json({ message: 'Le destinataire n\'est pas le propriétaire de ce post' });
            return;
        }

        const message = new Message({
            sender: senderId,
            receiver: receiverId,
            post: postId,
            content: content,
        });

        await message.save();
        const populatedMessage = await Message.findById(message._id)
            .populate('sender', 'name email')
            .populate('receiver', 'name email')
            .populate('post', 'title');

        res.status(201).json(populatedMessage);

    } catch (error) {
        console.error('Erreur lors de la création du message:', error);
        res.status(500).json({ message: 'Erreur lors de l\'envoi du message' });
    }
};

// Récupérer les messages d'une conversation
export const getConversation: RequestHandler = async (req, res) => {
    try {
        const { receiverId, postId } = req.params;
        const userId = (req as AuthRequest).user?.id;

        if (!userId) {
            res.status(401).json({ message: 'Non authentifié' });
            return;
        }

        if (!isValidObjectId(receiverId) || !isValidObjectId(postId)) {
            res.status(400).json({ message: 'IDs invalides pour le récepteur ou le post' });
            return;
        }

        const messages = await Message.find({
            post: postId,
            $or: [
                { sender: userId, receiver: receiverId },
                { sender: receiverId, receiver: userId }
            ]
        })
            .populate('sender', 'name email')
            .populate('receiver', 'name email')
            .populate('post', 'title')
            .sort({ createdAt: 1 });

        // Marquer les messages non lus comme lus
        await Message.updateMany(
            { receiver: userId, sender: receiverId, post: postId, read: false },
            { $set: { read: true } }
        );

        res.json(messages);

    } catch (error) {
        console.error('Erreur lors de la récupération de la conversation:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération de la conversation' });
    }
};

export const getConversationStats: RequestHandler = async (req, res) => {
    try {
        const userId = (req as AuthRequest).user?.id;

        if (!userId) {
            res.status(401).json({ message: 'Non authentifié' });
            return;
        }

        const total = await Message.countDocuments({
            $or: [{ sender: userId }, { receiver: userId }]
        });

        const unread = await Message.countDocuments({
            receiver: userId,
            read: false
        });

        const archived = await Message.countDocuments({
            $or: [{ sender: userId }, { receiver: userId }],
            status: 'archived'
        });

        // Pour l'instant, le blocage est géré au niveau utilisateur, pas par conversation status.
        // Vous pourriez ajuster ceci si vous avez un modèle séparé pour les utilisateurs bloqués.
        const blocked = 0; // À implémenter si nécessaire

        res.json({
            total,
            unread,
            archived,
            blocked
        });

    } catch (error) {
        console.error('Erreur lors du chargement des statistiques de conversation:', error);
        res.status(500).json({ message: 'Erreur lors du chargement des statistiques de conversation' });
    }
};

// Vous pourriez ajouter d'autres fonctions ici, comme getConversationsList (liste de toutes les conversations d'un utilisateur) 