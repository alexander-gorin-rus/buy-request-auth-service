import { Module } from '@nestjs/common';
import { AmqpService } from './amqp.service';
import { ConfigModule } from '@nestjs/config';
import { AmqpProvider } from './amqp.provider';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

@Module({
  imports: [AmqpConnection, ConfigModule, AmqpModule, AmqpProvider],
  providers: [AmqpService, AmqpConnection, AmqpProvider],
  exports: [AmqpService, AmqpProvider],
  controllers: [],
})
export class AmqpModule {}
