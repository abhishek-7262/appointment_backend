import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { SlotsModule } from './slots/slots.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      useFactory: async () => ({
        uri: process.env.MONGODB_URI,
        connectionFactory: (connection) => {
          connection.on('connected', () => {
            console.log('connected to db')
          });
          return connection;
        }
      })
    }),


    UsersModule, AuthModule, SlotsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
