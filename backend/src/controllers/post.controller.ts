import { Request, Response } from 'express';
import mongoose, { isValidObjectId } from 'mongoose';
import { Post } from '../models/post.model';
import { AuthRequest } from '../types/express';

// Extend AuthRequest pour inclure les fichiers de Multer
interface RequestWithFiles extends AuthRequest {
    files?: Express.Multer.File[];
}

// Fonction utilitaire pour convertir les chemins de fichiers en URLs complètes
const convertImagePathsToUrls = (req: Request, imagePaths: string[]): string[] => {
    if (!imagePaths || imagePaths.length === 0) {
        return [];
    }
    // const baseUrl = `${req.protocol}://${req.get('host')}`; // Récupère le protocole et l'hôte (ex: http://localhost:3000)
    // Assurez-vous que les imagePaths sont bien des chemins relatifs ici (uploads/...) avant de les joindre à baseUrl
    // Cette fonction ne devrait être appelée qu'avec des chemins relatifs.
    return imagePaths.map(filePath => {
        // S'assurer que le chemin est relatif et utiliser des slashes pour l'URL
        let cleanPath = filePath.replace(/\\/g, '/'); // Convertit les anti-slashes en slashes
        if (cleanPath.startsWith('/')) {
            cleanPath = cleanPath.substring(1); // Enlève le slash initial si présent
        }
        return `${cleanPath}`; // Joint la base URL avec le chemin relatif
    });
};

export const createPost = async (req: RequestWithFiles, res: Response): Promise<void> => {
    try {
        // Extrayez les données du corps de la requête (champs texte)
        const { title, description, price, category, condition, location } = req.body;
        const userId = req.user.id;

        // Récupérez les informations sur les fichiers uploadés par Multer
        const uploadedImages = req.files as Express.Multer.File[] | undefined;
        const imageUrls = uploadedImages ? uploadedImages.map(file => file.path) : []; // Utilisez file.path (chemin relatif fourni par Multer)

        // *** LOG DE DEBUG TEMPORAIRE ***
        console.log('Chemins des nouvelles images (avant sauvegarde) dans createPost:', imageUrls);
        // *****************************

        const post = new Post({
            title,
            description,
            price,
            category,
            condition,
            images: imageUrls, // Sauvegarde les chemins relatifs
            location,
            userId
        });

        await post.save();

        // Convertir les chemins d'images enregistrés (relatifs) en URLs complètes pour la réponse
        const postWithUrls = { ...post.toObject(), images: convertImagePathsToUrls(req, post.images) };

        res.status(201).json(postWithUrls);
    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            res.status(400).json({ message: error.message });
        } else {
            console.error('Erreur lors de la création du post:', error);
            res.status(500).json({ message: 'Erreur lors de la création du post' });
        }
    }
};

export const getAllPosts = async (req: Request, res: Response): Promise<void> => {
    try {
        const posts = await Post.find()
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });

        // Convertir les chemins d'images (relatifs) en URLs pour tous les posts
        const postsWithUrls = posts.map(post => ({
            ...post.toObject(),
            images: convertImagePathsToUrls(req, post.images) // Appelle convertImagePathsToUrls sur les chemins relatifs
        }));

        res.json(postsWithUrls);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des posts' });
    }
};

export const getPost = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            res.status(404).json({ message: 'ID de post invalide' });
            return;
        }

        const post = await Post.findById(id)
            .populate('userId', 'name email');

        if (!post) {
            res.status(404).json({ message: 'Post non trouvé' });
            return;
        }

        // Convertir les chemins d'images (relatifs) en URLs pour le post unique
        const postWithUrls = { ...post.toObject(), images: convertImagePathsToUrls(req, post.images) }; // Appelle convertImagePathsToUrls sur les chemins relatifs

        res.json(postWithUrls);
    } catch (error) {
        if (error instanceof mongoose.Error.CastError) {
            res.status(404).json({ message: 'ID de post invalide' });
        } else {
            res.status(500).json({ message: 'Erreur lors de la récupération du post' });
        }
    }
};

export const updatePost = async (req: RequestWithFiles, res: Response): Promise<void> => {
    try {
        const { id } = req.params; // ID du post depuis l'URL

        if (!isValidObjectId(id)) {
            res.status(404).json({ message: 'ID de post invalide' });
            return;
        }

        // Extrayez les données du corps de la requête (champs texte)
        const { title, description, price, category, condition, location } = req.body;
        const userId = req.user.id; // ID de l'utilisateur authentifié

        // *** LOGS DE DEBUG TEMPORAIRES ***
        console.log('Mise à jour du post - ID:', id, 'par l\'utilisateur ID:', userId);
        console.log('REQ BODY dans updatePost:', req.body);
        console.log('REQ FILES dans updatePost:', req.files);
        console.log('REQ BODY existingImages:', req.body.existingImages);
        // *********************************

        // Récupérez les informations sur les nouvelles images uploadées par Multer
        const uploadedImages = req.files as Express.Multer.File[] | undefined;
        const newImageUrls = uploadedImages ? uploadedImages.map(file => file.path) : []; // Nouveaux chemins relatifs fournis par Multer

        // Récupérez les URLs des images existantes (si envoyées par le frontend)
        const existingImagesUrls = Array.isArray(req.body.existingImages) ? req.body.existingImages : [];

        // Convertir les URLs d'images existantes reçues du frontend en chemins relatifs pour la sauvegarde
        const existingImagePaths: (string | null)[] = existingImagesUrls.map((imageUrl: string) => {
            try {
                const url = new URL(imageUrl);
                // Extrait le chemin relatif après le hostname et enlève le premier slash s'il est présent
                let relativePath = url.pathname;
                if (relativePath.startsWith('/')) {
                    relativePath = relativePath.substring(1);
                }
                // Sur Windows, les chemins peuvent utiliser des anti-slashes. Uniformiser avec des slashes pour le stockage.
                // Nous nous assurons que la fonction convertImagePathsToUrls gère les slashes pour le service statique.
                return relativePath.replace(/\\/g, '/'); // Convertit les anti-slashes en slashes pour le stockage uniforme

            } catch (e) {
                console.error(`URL d'image existante invalide (ignorée pour sauvegarde): ${imageUrl}`, e);
                return null; // Si l'URL est invalide, on ignore cette image pour la sauvegarde
            }
        });

        // Filtrer les chemins invalides (qui étaient null) pour n'avoir que des strings
        const validExistingImagePaths = existingImagePaths.filter((path): path is string => path !== null);

        // Combine les chemins d'images existantes (maintenant relatifs et nettoyés) et les nouveaux chemins uploadés
        const imageUrlsToSave = [...validExistingImagePaths, ...newImageUrls]; // Tous sont des chemins relatifs uniformes

        const updateData: any = { // Utilisez any pour faciliter l'update
            title,
            description,
            price,
            category,
            condition,
            location,
            images: imageUrlsToSave // Sauvegarde le tableau de chemins relatifs uniformes
            // Ne modifiez pas userId ici
        };

        // *** LOG DE DEBUG TEMPORAIRE ***
        console.log('Données de mise à jour (updateData):', updateData);
        // *********************************


        // Utiliser findOneAndUpdate pour trouver et mettre à jour le post par ID et userId
        const updatedPost = await Post.findOneAndUpdate(
            { _id: id, userId: userId }, // Condition de recherche (ID du post et propriétaire)
            updateData, // Données à mettre à jour
            {
                new: true, // Retourne le document modifié (et non l'original)
                runValidators: true // Exécute les validateurs du schéma sur les données mises à jour
            }
        ).populate('userId', 'name email'); // Populate le champ userId pour la réponse

        // *** LOG DE DEBUG TEMPORAIRE ***
        console.log('Résultat de findOneAndUpdate:', updatedPost);
        // *********************************


        if (!updatedPost) {
            // Si updatedPost est null, aucun document n\'a été trouvé ou mis à jour (mauvais ID ou mauvais propriétaire)
            res.status(404).json({ message: 'Post non trouvé ou non autorisé' });
            return;
        }

        // Convertir les chemins d\'images enregistrés (relatifs) en URLs complètes pour la réponse
        // updatedPost.images devrait maintenant contenir des chemins relatifs uniformes
        const updatedPostWithUrls = { ...updatedPost.toObject(), images: convertImagePathsToUrls(req, updatedPost.images) };

        // *** LOG DE DEBUG TEMPORAIRE ***
        console.log('Post mis à jour avec URLs pour la réponse:', updatedPostWithUrls);
        // *********************************

        res.json(updatedPostWithUrls);

    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            res.status(400).json({ message: error.message });
        } else {
            console.error('Erreur lors de la mise à jour du post:', error);
            res.status(500).json({ message: 'Erreur lors de la mise à jour du post' });
        }
    }
};

export const deletePost = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            res.status(404).json({ message: 'Post non trouvé' });
            return;
        }

        const result = await Post.deleteOne({
            _id: id,
            userId: req.user.id
        });

        if (result.deletedCount === 0) {
            res.status(404).json({ message: 'Post non trouvé ou non autorisé' });
            return;
        }

        res.json({ message: 'Post supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la suppression du post' });
    }
};