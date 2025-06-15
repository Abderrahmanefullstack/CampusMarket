import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
    constructor(@InjectModel(User.name) private userModel: Model<User>) { }

    async signup(email: string, password: string, name: string): Promise<string> {
        const hashed = await bcrypt.hash(password, 10);
        const user = new this.userModel({ email, password: hashed, name });
        await user.save();
        return this.generateJwt(user);
    }

    async login(email: string, password: string): Promise<string> {
        const user = await this.userModel.findOne({ email });
        if (!user) throw new Error('Utilisateur non trouvé');
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) throw new Error('Mot de passe incorrect');
        return this.generateJwt(user);
    }

    generateJwt(user: User): string {
        return jwt.sign({ sub: user._id, email: user.email }, 'SECRET', { expiresIn: '7d' });
    }
} 