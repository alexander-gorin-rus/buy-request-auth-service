export default {
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT, 10),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.AUTH_SERVICE_DATABASE,
  autoLoadEntities: true,
  // synchronize: process.env.ENV_MODE !== 'production',
  synchronize: false,
  migrations: ['dist/src/migration/*.{ts,js}'],
  entities: ['dist/**/*.entity.{ts,js}'],
  cli: {
    entitiesDir: 'src/modules',
    migrationsDir: 'src/migration',
  },
};
