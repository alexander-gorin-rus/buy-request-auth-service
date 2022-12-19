import { join } from 'path';
import { Transport } from '@nestjs/microservices';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import ormConfig from '../../ormconfig';

const PACKAGE_NAMES = {
  NOTIFICATION_PACKAGE: {
    name: 'NOTIFICATION_PACKAGE',
    packageName: 'NotificationService',
    package: 'notificationService',
  },
};

const getClients = (): any => [
  {
    name: PACKAGE_NAMES.NOTIFICATION_PACKAGE.name,
    transport: Transport.GRPC,
    options: {
      package: PACKAGE_NAMES.NOTIFICATION_PACKAGE.package,
      protoPath: [
        join(
          process.cwd(),
          'dist/protos/notification-service/notification.proto',
        ),
        join(process.cwd(), 'dist/protos/notification-service/error.proto'),
      ],
      url: `${process.env.NOTIFICATION_SERVICE_HOST}:${process.env.NOTIFICATION_SERVICE_PORT}`,
    },
  },
];

const getAMQPOptions = () => {
  const exchanges = {
    events: {
      name: 'events',
      type: 'topic',
    },
  };
  const username = process.env.RABBITMQ_DEFAULT_USER;
  const password = process.env.RABBITMQ_DEFAULT_PASS;
  const hostname = process.env.RABBITMQ_HOST;
  const port = parseInt(process.env.RABBITMQ_PORT, 10);
  return {
    name: process.env.RABBITMQ_NAME,
    hostname,
    port,
    username,
    password,
    exchanges,
    config: {
      exchanges: [exchanges.events],
      uri: `amqp://${username}:${password}@${hostname}:${port}`,
      connectionInitOptions: { wait: false },
    },
  };
};

const databaseDefaultConfig = (): TypeOrmModuleOptions =>
  ({ ...ormConfig } as TypeOrmModuleOptions);
export default () => ({
  applicationName: `${process.env.APPLICATION_NAME} AUTH SERVICE`,
  url: `${process.env.AUTH_SERVICE_HOST}:${process.env.AUTH_SERVICE_PORT}`,
  port: process.env.AUTH_SERVICE_PORT,
  allowedOrigins: [process.env.DASHBOARD_URL],
  jwtSecretKey: process.env.JWT_SECRET_KEY,
  databaseDefaultConfig: databaseDefaultConfig(),
  amqp: getAMQPOptions(),
  clients: getClients(),
  dashboardUrl: process.env.DASHBOARD_URL,
});
