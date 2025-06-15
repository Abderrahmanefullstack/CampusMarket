import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdModule } from './ad.module';

@Module({
    imports: [
        MongooseModule.forRoot('mongodb://mongodb:27017/campusmarket-marketplace'),
        AdModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule { } 