import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { User, UserSchema } from './user.schema';

@Module({
    imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
    providers: [AuthService, AuthResolver],
})
export class AuthModule { } 