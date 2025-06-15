import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
    user?: {
        id: string;
    };
}

export const authMiddleware: RequestHandler = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            (res.status(401).json({ message: 'Token d\'authentification manquant' }) as Response<any, Record<string, any>>).end();
            return;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'votre_secret_jwt_super_securise') as { userId: string };
        (req as AuthRequest).user = { id: decoded.userId };
        next();
    } catch (error) {
        (res.status(401).json({ message: 'Token invalide' }) as Response<any, Record<string, any>>).end();
        return;
    }
}; 