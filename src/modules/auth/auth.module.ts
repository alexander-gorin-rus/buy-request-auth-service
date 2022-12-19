import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import Auth from './auth.entity';
import { TokenService } from './token.service';
import { ConfigService } from '@nestjs/config';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { AmqpModule } from '../../amqp/amqp.module';
import configuration from '../../config/configuration';
import { AmqpService } from '../../amqp/amqp.service';

const { amqp } = configuration();

@Module({
  imports: [
    TypeOrmModule.forFeature([Auth]),
    RabbitMQModule.forRoot(RabbitMQModule, amqp.config),
    AmqpModule,
  ],
  providers: [AuthService, TokenService, ConfigService, AmqpService],
  controllers: [AuthController],
  exports: [TypeOrmModule],
})
export class AuthModule {}
