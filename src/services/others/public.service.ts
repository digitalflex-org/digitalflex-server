import { redisClient } from "../../config/redisConfig";
import { NotFoundError } from "../../utils/errors";
import { BaseError } from "../../utils/errors/BaseError";
import logger from "../../utils/logger";


class PublicService {
    static async getActiveUsers() {
        try {
            const keys = await redisClient.keys('activeUsers:*');

            if (keys.length === 0) {
                throw new NotFoundError('No active users at the moment');
            }

            const userJsons = await Promise.all(keys.map(key => redisClient.get(key)));
            const users = userJsons
                .filter((item): item is string => item !== null)
                .map(item => JSON.parse(item));

            return users;

        } catch (error) {
            if (error instanceof BaseError) {
                logger.error('❌ Error fetching active users:', error.message);
            } else {
                throw new BaseError('Failed to fetch active users', 500);
            }
        }
    }
      

    static async addToActiveUsersList(sessionId: string, data: any, exp: number): Promise<void> {
        try {
            const ttl = exp - Math.floor(Date.now() / 1000);
            await redisClient.set(`activeUsers:${sessionId}`, JSON.stringify(data), 'EX', ttl);

        } catch (error) {
            if (error instanceof BaseError) {
                logger.error('❌ Error adding to active users list:', error.message);
            } else {
                throw new BaseError('Failed to add to active users list', 500);
            }
        }
    }
      


}

export default PublicService