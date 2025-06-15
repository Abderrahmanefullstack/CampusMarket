import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from './message.schema';

@Injectable()
export class MessageService {
    constructor(@InjectModel(Message.name) private messageModel: Model<Message>) { }

    async findForUser(userId: string): Promise<Message[]> {
        return this.messageModel.find({ $or: [{ senderId: userId }, { receiverId: userId }] }).exec();
    }

    async send(data: Partial<Message>): Promise<Message> {
        const msg = new this.messageModel(data);
        return msg.save();
    }
} 