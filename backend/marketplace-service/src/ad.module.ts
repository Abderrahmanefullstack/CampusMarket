import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Ad, AdSchema } from './ad.schema';
import { AdService } from './ad.service';
import { AdResolver } from './ad.resolver';

@Module({
    imports: [MongooseModule.forFeature([{ name: Ad.name, schema: AdSchema }])],
    providers: [AdService, AdResolver],
})
export class AdModule { } 