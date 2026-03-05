import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CatalogsModule } from './catalogs/catalogs.module';
import { QuotesModule } from './quotes/quotes.module';
import { PoliciesModule } from './policies/policies.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    CatalogsModule,
    QuotesModule,
    PoliciesModule,
  ],
})
export class AppModule {}
