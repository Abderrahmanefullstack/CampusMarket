import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './user.schema';

@Resolver(() => User)
export class UserResolver {
    constructor(private readonly userService: UserService) { }

    @Query(() => [User])
    async users() {
        return this.userService.findAll();
    }

    @Query(() => User)
    async user(@Args('id') id: string) {
        return this.userService.findById(id);
    }

    @Mutation(() => User)
    async updateUser(
        @Args('id') id: string,
        @Args('name') name: string,
        @Args('avatarUrl') avatarUrl: string,
    ) {
        return this.userService.update(id, { name, avatarUrl });
    }
} 