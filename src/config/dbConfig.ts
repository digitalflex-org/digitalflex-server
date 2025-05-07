import mongoose from 'mongoose';
import { configVariables } from './envConfig';
import logger from '../utils/logger';
const dbPort = configVariables.dbConfig.dbUrl
const dbName = configVariables.dbConfig.dbName

const connectDb = async () => {
  try {
    await mongoose.connect(`${dbPort}/${dbName}`)
    logger.info('✅ DB Connected');

  } catch (error) {
    if (error instanceof Error) {
      logger.error('⚠️ Error connecting to the Database', error.message);
    } else {
      logger.error('⚠️ Unknown error', error);
    }
    process.exit(1);
  }
}


export default connectDb;