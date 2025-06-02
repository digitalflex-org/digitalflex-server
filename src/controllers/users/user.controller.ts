import { NextFunction, Request, Response } from 'express';
import userService from '../../services/user/user.service';


class UserController {
  // get all users
  static async getUsers(req: Request, res: Response, next:NextFunction): Promise<void> {
    try {
      const users = await userService.getUsers();

      if (!users || users.length === 0) {
        res.status(404).json({ message: 'No users at the moment' });
        return;
      }

      res.status(200).json({ success: true, data: users });
      return;
    } catch (error) {
      next(error)
    }

  }

  // get single user
  static async getUser(req: Request, res: Response, next:NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ success: false, message: 'verifify provided data' })
        return
      }
      const user = await userService.getUserById(id)
      res.status(200).json({ success: true, data: user })
      return
    } catch (error) {
      next(error)
    }
  }
  

}

export default UserController