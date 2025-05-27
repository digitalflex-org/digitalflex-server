import mongoose from 'mongoose';
import { configVariables } from './envConfig';
import logger from '../utils/logger';
import User from '../models/user.model';
import { hashData } from '../utils/auth/auth.utils';
const dbPort = configVariables.dbConfig.dbUrl
const dbName = configVariables.dbConfig.dbName

const seedAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ role: 'admin' });

    if (!existingAdmin) {
      if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
        logger.error('Admin user environment variables are not properly set');
        return;
      }
      const hashedPassword = await hashData(`${process.env.ADMIN_PASSWORD}`, 10);

      const adminUser = new User({
        name: process.env.ADMIN_USERNAME,
        email: process.env.ADMIN_EMAIL,
        password: hashedPassword,
        preferred_name: 'admin',
        role: 'admin'
      });
      await adminUser.save();
      logger.info('Admin user created');
    } else {
      logger.info('Admin user already exists');
      return;
    }
  } catch (error) {
    logger.error('Error creating admin user', error);
  }
};

const connectDb = async () => {
  try {
    await mongoose.connect(`${dbPort}/${dbName}`)
    logger.info('✅ DB Connected');
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (!existingAdmin) {
      await seedAdmin()
    }

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