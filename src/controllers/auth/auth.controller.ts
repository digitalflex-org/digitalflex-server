import { signUpValidation, signInValidation } from '../../utils/validators/auth.validators';
import AuthService from '../../services/auth/auth.service';
import { Request, Response, NextFunction } from 'express';
import { BadRequest } from '../../utils/errors';
import { generateToken } from '../../utils/auth/auth.utils';


class AuthController {
  static async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      let activationLink;
      const { error } = signUpValidation(req.body);
      if (error) {
        throw new BadRequest(`${error.details[0].message}`);
        return;
      }
      const user = await AuthService.register(req.body);
      // send activation link to mail if user is an applicant
      // generate activation link
      if (user.role === 'applicant') {
        let activationToken = await AuthService.generateActivationLink(user._id as string);
        activationLink = `${req.protocol}://${req.get('host')}/api/auth/activate/${activationToken}`;
        // console.log('token', user)
      }
      // console.log('link', activationLink)
      res.status(201).json({ success: true, data: user, activationLink})
      return;

    } catch (error) {
      next(error);
    }
  }


  static async activateAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { activationToken } = req.params;
      
      const tokenController = await AuthService.activateAccount(activationToken);
      // console.log('tokenController', tokenController)
      res.status(200).json({ message: 'Account activated successfully' });
      return;

    } catch (error) {
      next(error)
    }
  }

  static async signIn(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { error } = signInValidation(req.body);
      if (error) {
        throw new BadRequest(`${error.details[0].message}`);
      }

      const user = await AuthService.login(req.body);
      const { _id, role } = user as { _id: string; role: string };
      const token = await generateToken(_id, role);
      res.status(200).json({ success: true, data: user, token });
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController