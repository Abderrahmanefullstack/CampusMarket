import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ad } from './ad.schema';

@Injectable()
export class AdService {
    constructor(@InjectModel(Ad.name) private adModel: Model<Ad>) { }

    async findAll(): Promise<Ad[]> {
        return this.adModel.find().exec();
    }

    async findById(id: string): Promise<Ad> {
        return this.adModel.findById(id).exec();
    }

    async create(data: Partial<Ad>): Promise<Ad> {
        const ad = new this.adModel(data);
        return ad.save();
    }

    async update(id: string, data: Partial<Ad>): Promise<Ad> {
        return this.adModel.findByIdAndUpdate(id, data, { new: true }).exec();
    }

    async delete(id: string): Promise<void> {
        await this.adModel.findByIdAndDelete(id).exec();
    }
} 