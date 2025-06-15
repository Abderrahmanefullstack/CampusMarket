import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { Message, MessageSchema } from './message.schema';
import { UserService } from './user.service';
import { MessageService } from './message.service';
import { UserResolver } from './user.resolver';
import { MessageResolver } from './message.resolver';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Message.name, schema: MessageSchema },
        ]),
    ],
    providers: [UserService, MessageService, UserResolver, MessageResolver],
})
export class UserModule { } 