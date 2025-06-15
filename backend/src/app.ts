import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import postRoutes from './routes/post.routes';
import messageRoutes from './routes/message.routes';
import userRoutes from './routes/user.routes';
import path from 'path';

// Charger les variables d'environnement
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Servir les fichiers statiques du dossier 'uploads'
// Les fichiers seront accessibles via /uploads, par exemple http://localhost:3000/uploads/nom_du_fichier.jpg
app.use('/uploads', express.static(path.join(__dirname, '..', '..', 'uploads')));

// Temporairement pour tester la route POST de base à la racine - RETIRE
// app.post('/', (req, res) => {
//     console.log('Requête POST reçue sur la racine (/)');
//     res.status(200).json({ message: 'Test POST racine réussi!', body: req.body });
// });

// Temporairement pour tester la route POST de base sur /test-post (laissez celle-ci aussi pour l'instant) - RETIRE
// app.post('/test-post', (req, res) => {
//     console.log('Requête POST reçue sur /test-post');
//     res.status(200).json({ message: 'Test POST réussi!', body: req.body });
// });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campusmarket')
    .then(() => {
        console.log('Connecté à MongoDB');
    })
    .catch((error) => {
        console.error('Erreur de connexion à MongoDB:', error);
    });

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
}); 