import { Request, Response, RequestHandler } from 'express';
import { isValidObjectId } from 'mongoose';
import { User } from '../models/user.model'; // Assurez-vous que le modèle User est exporté correctement

export const getUserById: RequestHandler = async (req, res) => {
    try {
        const userId = req.params.id;

        if (!isValidObjectId(userId)) {
            res.status(400).json({ message: 'ID utilisateur invalide' });
            return;
        }

        const user = await User.findById(userId).select('-password'); // Exclure le mot de passe

        if (!user) {
            res.status(404).json({ message: 'Utilisateur non trouvé' });
            return;
        }

        res.json(user);

    } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération de l\'utilisateur' });
    }
}; 