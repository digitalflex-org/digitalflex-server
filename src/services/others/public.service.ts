import { redisClient } from "../../config/redisConfig";
import { NotFoundError } from "../../utils/errors";
import { BaseError } from "../../utils/errors/BaseError";
import logger from "../../utils/logger";
import ApplicantService from "../apllicant/applicant.service";
import UserService from "../user/user.service";


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
                logger.error('Failed to fetch active users', error);
            }
            throw error;
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
                logger.error('Failed to add to active users list', error);
            }
            throw error;
        }
    }


    static async getUserStats() {
        try {
            let usersStats;
            const cachedStats = await redisClient.get('usersStats');
            if (cachedStats) {
                usersStats = JSON.parse(cachedStats);
                return usersStats;
            }
            const currentUsersLength = (await UserService.getUsers()).length || 0;
            const currentApplicantsLength = (await ApplicantService.getApplicants()).length || 0;
            const res = {
                'users': currentUsersLength,
                'applicants': currentApplicantsLength
            }
            console.log(res);
            usersStats = res;
            return usersStats;


        } catch (error) {
            if (error instanceof BaseError) {
                logger.error('❌ Error adding to active users list:', error.message);
            } else {
                logger.error('Failed to add to active users list', error);
            }
            throw error;

        }

    }



}

export default PublicService