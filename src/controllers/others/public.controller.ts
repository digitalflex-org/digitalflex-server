import { NextFunction, Request, Response } from "express";
import PublicService  from "../../services/others/public.service";
import { NotFoundError } from "../../utils/errors";

class PublicController{
    static async getActiveUsers(req: Request, res: Response, next: NextFunction): Promise<void>{
        try {
            const activeUsers = await PublicService.getActiveUsers();
            if(!activeUsers || activeUsers.length === 0) {
                throw new NotFoundError('No active users at the moment');
                return;
            }
            res.status(200).json({ success: true, message: 'Active users fetched successfully', data: activeUsers });
            return;
         } catch (error) {
            next(error);
        }
    }

    static async getUserStats(req: Request, res: Response, next: NextFunction) {
        try {
            const userStats = await PublicService.getUserStats();
            console.log('users stats:', userStats);
            res.status(200).json({ success: true, message: 'stats fetched', data: userStats });
            return;
        } catch (error) {
            next(error);
        }
    }
}

export default PublicController;