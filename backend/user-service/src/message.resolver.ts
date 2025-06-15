import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { MessageService } from './message.service';
import { Message } from './message.schema';

@Resolver(() => Message)
export class MessageResolver {
    constructor(private readonly messageService: MessageService) { }

    @Query(() => [Message])
    async messages(@Args('userId') userId: string) {
        return this.messageService.findForUser(userId);
    }

    @Mutation(() => Message)
    async sendMessage(
        @Args('senderId') senderId: string,
        @Args('receiverId') receiverId: string,
        @Args('content') content: string,
    ) {
        return this.messageService.send({ senderId, receiverId, content });
    }
} 