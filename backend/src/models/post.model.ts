import mongoose, { Document, Schema } from 'mongoose';

export interface IPost extends Document {
    title: string;
    description: string;
    price: number;
    category: 'books' | 'supplies';
    condition: 'new' | 'used' | 'like-new';
    images: string[];
    location: string;
    userId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const postSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        required: true,
        enum: ['books', 'supplies']
    },
    condition: {
        type: String,
        required: true,
        enum: ['new', 'used', 'like-new']
    },
    images: [{
        type: String,
        required: true
    }],
    location: {
        type: String,
        required: true,
        trim: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

export const Post = mongoose.model<IPost>('Post', postSchema); 