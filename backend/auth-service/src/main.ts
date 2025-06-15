import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    await app.listen(3001);
}
bootstrap(); 