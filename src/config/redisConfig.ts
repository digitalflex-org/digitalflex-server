import Redis from 'ioredis';
import { configVariables } from './envConfig';
import logger from '../utils/logger';

const redisClient = new Redis();

const connectRedis = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    redisClient.on('connect', () => {
      logger.info('✅ Redis Client Connected');
      resolve();
    });

    redisClient.on('error', (error) => {
      console.error('❌ Redis Client Error:', error);
      reject(error);
    });
  });
};

export { redisClient, connectRedis };
