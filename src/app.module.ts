import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  WinstonModule,
  utilities as nestWinstonModuleUtilities,
} from 'nest-winston';
import * as winston from 'winston';
import { CommonModule } from './common/common.module';
import { AuthModule } from './modules/auth/auth.module';
import { AmqpModule } from './amqp/amqp.module';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ClientsModule } from '@nestjs/microservices';

const { databaseDefaultConfig, applicationName, amqp, clients } =
  configuration();

@Module({
  imports: [
    ClientsModule.register(clients),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRoot({
      ...databaseDefaultConfig,
    }),
    RabbitMQModule.forRoot(RabbitMQModule, {
      exchanges: [amqp.exchanges.events],
      uri: `amqp://${amqp.username}:${amqp.password}@${amqp.hostname}:${amqp.port}`,
      connectionInitOptions: { wait: false },
    }),
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            nestWinstonModuleUtilities.format.nestLike(applicationName, {
              prettyPrint: true,
            }),
          ),
        }),
      ],
    }),
    AmqpModule,
    CommonModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
