import multer from 'multer';
import path from 'path';

// Configuration du stockage pour Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Spécifiez le dossier de destination pour les fichiers uploadés
        // Assurez-vous que ce dossier existe
        cb(null, 'uploads/'); // Le dossier 'uploads/' doit exister à la racine du backend
    },
    filename: (req, file, cb) => {
        // Définissez le nom du fichier (ex: nomfichier-timestamp.ext)
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

// Créez le middleware Multer
// Gérez l'upload pour le champ 'images', en acceptant jusqu'à un certain nombre de fichiers (ex: 10)
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // Limite de taille de fichier (ex: 10MB)
});

// Middleware pour gérer l'upload d'un tableau de fichiers pour le champ 'images'
export const uploadImages = upload.array('images', 10); // 'images' doit correspondre au nom du champ dans FormData, 10 est le nombre max de fichiers 