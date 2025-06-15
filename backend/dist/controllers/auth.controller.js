"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signin = exports.signup = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../models/user.model");
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
        // Vérifier si l'utilisateur existe déjà
        const existingUser = yield user_model_1.User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Cet email est déjà utilisé' });
        }
        // Créer un nouvel utilisateur
        const user = new user_model_1.User({
            name,
            email,
            password
        });
        yield user.save();
        // Générer le token JWT
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT_SECRET || 'votre_secret_jwt_super_securise', { expiresIn: '24h' });
        // Retourner les informations de l'utilisateur (sans le mot de passe) et le token
        res.status(201).json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            },
            token
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Erreur lors de l\'inscription', error });
    }
});
exports.signup = signup;
const signin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Vérifier si l'utilisateur existe
        const user = yield user_model_1.User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }
        // Vérifier le mot de passe
        const isMatch = yield user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }
        // Générer le token JWT
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT_SECRET || 'votre_secret_jwt_super_securise', { expiresIn: '24h' });
        // Retourner les informations de l'utilisateur et le token
        res.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            },
            token
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Erreur lors de la connexion', error });
    }
});
exports.signin = signin;
