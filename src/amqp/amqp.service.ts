import { Injectable, Logger } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Options } from 'amqplib';
import { AmqpProvider } from './amqp.provider';

@Injectable()
export class AmqpService {
  private readonly logger = new Logger();
  constructor(
    private readonly amqpProvider: AmqpProvider,
    private amqpConnection: AmqpConnection,
  ) {}

  public async publish<D>(
    exchange: string,
    routingKey: string,
    type: string,
    message: D,
    options?: Options.Publish,
  ) {
    try {
      const { message: msg, buffer } = this.amqpProvider.encodeMessage<D>(
        type,
        message,
      );
      this.logger.log(
        `<AMQP Publish message to ${routingKey}> ${JSON.stringify(msg)}`,
      );
      await this.amqpConnection.publish(exchange, routingKey, buffer, options);
    } catch (error) {
      this.logger.error(error);
    }
  }
}
