import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { AdService } from './ad.service';
import { Ad } from './ad.schema';

@Resolver(() => Ad)
export class AdResolver {
    constructor(private readonly adService: AdService) { }

    @Query(() => [Ad])
    async ads() {
        return this.adService.findAll();
    }

    @Query(() => Ad)
    async ad(@Args('id') id: string) {
        return this.adService.findById(id);
    }

    @Mutation(() => Ad)
    async createAd(
        @Args('title') title: string,
        @Args('description') description: string,
        @Args('price') price: number,
        @Args('sellerId') sellerId: string,
    ) {
        return this.adService.create({ title, description, price, sellerId });
    }

    @Mutation(() => Ad)
    async updateAd(
        @Args('id') id: string,
        @Args('title') title: string,
        @Args('description') description: string,
        @Args('price') price: number,
    ) {
        return this.adService.update(id, { title, description, price });
    }

    @Mutation(() => Boolean)
    async deleteAd(@Args('id') id: string) {
        await this.adService.delete(id);
        return true;
    }
} 