import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user.module';

@Module({
    imports: [
        MongooseModule.forRoot('mongodb://mongodb:27017/campusmarket-user'),
        UserModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule { } 