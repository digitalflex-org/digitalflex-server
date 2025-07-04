import app from '../../server';
import { configVariables } from '../../config/envConfig';
import { errorHandler } from '../../middlewares/errorHandler';
import logger from '../../utils/logger';
import { connectDb } from '../../config/dbConfig';
import { connectRedis } from '../../config/redisConfig';
import '../../jobs/scheduler.jobs'
const { port } = configVariables.serverConfig
const protocol = process.env.NODE_ENV === 'dev' ? 'http' : 'https';


app.use(errorHandler)

const startServer = async () => {
  try {
    await connectRedis();
    logger.info('✅ Connected to Redis');

    await connectDb().then(() => {
      logger.info('✅ Connected to MongoDB');
      app.listen(port, () => {
        logger.info(`🚀 Server listening on ${protocol}://127.0.0.1:${port}`);
      });
    })
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);


  }
};

startServer();