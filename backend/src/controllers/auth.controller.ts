import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';

export const signup = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Cet email est déjà utilisé' });
        }

        // Créer un nouvel utilisateur
        const user = new User({
            name,
            email,
            password
        });

        await user.save();

        // Générer le token JWT
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'votre_secret_jwt_super_securise',
            { expiresIn: '24h' }
        );

        // Retourner les informations de l'utilisateur (sans le mot de passe) et le token
        res.status(201).json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            },
            token
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de l\'inscription', error });
    }
};

export const signin = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Vérifier si l'utilisateur existe
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        // Vérifier le mot de passe
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        // Générer le token JWT
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'votre_secret_jwt_super_securise',
            { expiresIn: '24h' }
        );

        // Retourner les informations de l'utilisateur et le token
        res.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            },
            token
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la connexion', error });
    }
}; 