import mongoose from 'mongoose';
import { configVariables } from './envConfig';
import logger from '../utils/logger';
import User from '../models/user.model';
import { hashData } from '../utils/auth/auth.utils';
const { dbUrl, db2Url, dbName, db2Name } = configVariables.dbConfig



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
let blogDb: mongoose.Connection | null = null;

const connectDb = async () => {
  try {
    await mongoose.connect(`${dbUrl}/${dbName}`);
    logger.info('✅ Main DB Connected');

    const existingAdmin = await User.findOne({ role: 'admin' });
    if (!existingAdmin) {
      await seedAdmin();
    }

    blogDb = mongoose.createConnection(`${db2Url}/${db2Name}`);
    blogDb.on('connected', () => {
      logger.info('✅ Blog DB Connected');
    });
    blogDb.on('error', (err) => {
      logger.error('❌ Blog DB connection error:', err);
    });

  } catch (error) {
    logger.error('⚠️ DB Connection Error:', error);
    process.exit(1);
  }
};

const getBlogDb = (): mongoose.Connection => {
  if (!blogDb) {
    throw new Error('Blog DB is not yet connected.');
  }
  return blogDb;
};

export { connectDb, getBlogDb };