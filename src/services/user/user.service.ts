import User, { userInterface } from '../../models/user.model';
import { redisClient } from '../../config/redisConfig';
import logger from '../../utils/logger';
import { InternalServerError, NotFoundError } from '../../utils/errors';
import { BaseError } from '../../utils/errors/BaseError';

class UserService {
  static async getUsers(): Promise<userInterface[]> {
    try {
      // console.log('checking cache first....')
      const cachedData = await redisClient.get('users')
      if (cachedData) {
        logger.info('from cache')
        return JSON.parse(cachedData)
      }

      // console.log('checking db now.......')
      const users = await User.find().exec();
      await redisClient.set('users', JSON.stringify(users), 'EX', 60)
      logger.info('from db and cached')
      return users;
    } catch (error) {
      if (error instanceof BaseError) {
        logger.error('❌ Error fetching users:', error.message);
      } else {
        logger.error('❌ Unknown error:', error);
      }
      throw error;
    }
  }

  static async getUserById(id: string): Promise<userInterface> {
    try {
      // check if user exists in the cached data
      const cachedUsers = await redisClient.get('users')
      if (cachedUsers) {
        const parseData: userInterface[] = JSON.parse(cachedUsers);
        const user = parseData.find(item => item._id === id)
        if (user) {
          return user;
        }
      }

      const user = await User.findById(id).exec();
      if (!user) {
        throw new NotFoundError('User not found')
      }
      return user

    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }

      throw new InternalServerError('Failed to fetch user');
    }
  }
}



export default UserService;