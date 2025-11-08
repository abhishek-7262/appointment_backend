import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { SlotsModule } from './slots/slots.module';
import { BookingsModule } from './bookings/bookings.module';

import { redisStore } from 'cache-manager-redis-yet';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({
          socket: {
            host: 'localhost',
            port: 6379,
          },
          ttl: 60 * 5, // default TTL = 5 minutes
        }),
      }),
    }),

    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      useFactory: async () => ({
        uri: process.env.MONGODB_URI,
        connectionFactory: (connection) => {
          connection.on('connected', () => {
            console.log('connected to db');
          });
          return connection;
        },
      }),
    }),

    UsersModule,
    AuthModule,
    SlotsModule,
    BookingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
