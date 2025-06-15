import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';

@Resolver()
export class AuthResolver {
    constructor(private readonly authService: AuthService) { }

    @Mutation(() => String)
    async signup(
        @Args('email') email: string,
        @Args('password') password: string,
        @Args('name') name: string,
    ) {
        return this.authService.signup(email, password, name);
    }

    @Mutation(() => String)
    async login(
        @Args('email') email: string,
        @Args('password') password: string,
    ) {
        return this.authService.login(email, password);
    }
} 