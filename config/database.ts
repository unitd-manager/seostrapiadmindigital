import path from 'path';
import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Database => {
  const client = env('DATABASE_CLIENT', 'sqlite');
  const nodeEnv = env('NODE_ENV', 'development');
  const isProduction = nodeEnv === 'production';
  // For remote DBs, 60s connection timeout is too high — use 30s so pool errors surface quickly.
  const connectionTimeout = env.int('DATABASE_CONNECTION_TIMEOUT', 30000);
  const databaseHost = env('DATABASE_HOST', 'localhost');
  const databasePort = env.int('DATABASE_PORT', client === 'postgres' ? 5432 : 3306);
  const databaseName = env('DATABASE_NAME', 'qbstrapi');
  const databaseUser = env('DATABASE_USERNAME', 'root');
  const databaseUrl = env('DATABASE_URL');
  const databaseSsl = env.bool('DATABASE_SSL', false);
  const driverConnectTimeout = env.int('DATABASE_CONNECT_TIMEOUT', connectionTimeout);
  // Keep warm connections in the pool so admin requests never wait for a cold TCP handshake
  // to the remote DB. Use a small warm pool in development as well to avoid 10s+ first-query delays.
  const poolMin = env.int('DATABASE_POOL_MIN', isProduction ? 5 : 2);
  const poolMax = env.int('DATABASE_POOL_MAX', 25);

  const connections = {
    mysql: {
      connection: {
        host: databaseHost,
        port: env.int('DATABASE_PORT', 3306),
        database: databaseName,
        user: databaseUser,
        password: env('DATABASE_PASSWORD', ''),
        charset: env('DATABASE_CHARSET', 'utf8mb4'),
        connectTimeout: driverConnectTimeout,
        // TCP keepalive prevents OS/NAT/firewall from silently dropping idle connections
        // to the remote DB server — eliminates "Connection lost" errors on long queries.
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000,
        ssl: databaseSsl && {
          key: env('DATABASE_SSL_KEY', undefined),
          cert: env('DATABASE_SSL_CERT', undefined),
          ca: env('DATABASE_SSL_CA', undefined),
          capath: env('DATABASE_SSL_CAPATH', undefined),
          cipher: env('DATABASE_SSL_CIPHER', undefined),
          rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', true),
        },
      },
      pool: {
        min: poolMin,
        max: poolMax,
        // idleTimeoutMillis must be shorter than MySQL server's wait_timeout (default 28800s)
        // so the pool drops connections before the server forcibly closes them.
        idleTimeoutMillis: env.int('DATABASE_POOL_IDLE_TIMEOUT', 600000),
        acquireTimeoutMillis: connectionTimeout,
      },
    },
    postgres: {
      connection: {
        connectionString: databaseUrl,
        host: databaseHost,
        port: env.int('DATABASE_PORT', 5432),
        database: databaseName,
        user: databaseUser,
        password: env('DATABASE_PASSWORD', ''),
        ssl: databaseSsl && {
          key: env('DATABASE_SSL_KEY', undefined),
          cert: env('DATABASE_SSL_CERT', undefined),
          ca: env('DATABASE_SSL_CA', undefined),
          capath: env('DATABASE_SSL_CAPATH', undefined),
          cipher: env('DATABASE_SSL_CIPHER', undefined),
          rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', true),
        },
        schema: env('DATABASE_SCHEMA', 'public'),
      },
      pool: {
        min: poolMin,
        max: poolMax,
        idleTimeoutMillis: env.int('DATABASE_POOL_IDLE_TIMEOUT', 300000),
        acquireTimeoutMillis: connectionTimeout,
      },
    },
    sqlite: {
      connection: {
        filename: path.join(__dirname, '..', '..', env('DATABASE_FILENAME', '.tmp/data.db')),
      },
      useNullAsDefault: true,
    },
  };

  return {
    connection: {
      client,
      ...connections[client],
      acquireConnectionTimeout: connectionTimeout,
    },
  };
};

export default config;
