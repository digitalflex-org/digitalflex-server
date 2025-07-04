import { signUpValidation, signInValidation, forgotPasswordValidator, resetPasswordValidator } from '../../utils/validators/auth.validators';
import AuthService from '../../services/auth/auth.service';
import { Request, Response, NextFunction } from 'express';
import { BadRequest, UnauthorizedError } from '../../utils/errors';
import { decodeToken, generateSessionId, generateToken } from '../../utils/auth/auth.utils';
import Mailer from '../../utils/others/mailer';
import logger from '../../utils/logger';
import mongoose, { ObjectId } from 'mongoose';
import { Types } from 'joi';
import PublicService from '../../services/others/public.service';

class AuthController {
  static async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      let activationLink;
      const { error } = signUpValidation(req.body);
      const { role } = req.query;
      // console.log('role from query:', role);
      if (error) {
        throw new BadRequest(`${error.details[0].message}`);
      }
      if (role === 'admin') {
        logger.error(`${req.ip} tried creating an admin!`);
        throw new UnauthorizedError('you do not have the permission to perform this action, kindly contact the system administrator!');
        return;
      }
      const payload = { ...req.body, role }
      const user = await AuthService.register(payload);
      // send activation link to mail if user is an applicant
      if (user.role === 'applicant') {
        const activationToken = await AuthService.generateActivationLink(user._id as ObjectId);
        activationLink = `${req.protocol}://${req.get('host')}/api/auth/activate/${activationToken}`;
        await Mailer.sendActivationMessage(user.email, `Applicant Account Activation`, activationLink);
      }
      console.log(user)
      res.status(201).json({ success: true, data: user, activationLink })
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
      const { _id, role, preferred_name, name } = user as { _id: mongoose.Schema.Types.ObjectId; role: string, preferred_name: string, name: string };
      const idStr = _id.toString();
      const token = await generateToken(idStr, role);
      const decoded: any = await decodeToken(token);
      const { exp: tokenExp } = decoded
      // console.log('token expiry period:', tokenExp)
      const sessionId = await generateSessionId(tokenExp as number);

      res.cookie('auth_token', token, {
        httpOnly: true,
        // secure: process.env.NODE_ENV === 'production',
        secure: true,
        sameSite: 'none',
        maxAge: 1000 * 60 * 60,
      });
      res.cookie('sessionId', sessionId.generatedId, {
        httpOnly: true,
        // secure: process.env.NODE_ENV === 'production',
        secure: true,
        sameSite: 'none',
        maxAge: ((tokenExp as number) * 1000) - Date.now(),
      });
      const userData = { preferred_name, name, role, idStr };
      const resPayload = { userData };
      await PublicService.addToActiveUsersList(sessionId, userData, tokenExp as number);
      res.status(200).json({ success: true, message: 'Login Successfully', data: resPayload });
    } catch (error) {
      next(error);
    }
  }


  static async resendActivationLink(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await AuthService.resendActivationLink(req);
      res.status(200).json({ success: true, message: 'activation link sent to unactivated accounts' });

    } catch (error) {
      next(error);
    }
  }
  static async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { error } = forgotPasswordValidator(req.body);
      if (error) {
        logger.error(`Error at forgot password: ${error.details[0].message}`);
        throw new BadRequest(`Error at forgot password: ${error.details[0].message}`)
      }
      const { email } = req.body;
      await AuthService.forgotPassword(email, req);
      res.status(200).json({ success: true, message: 'Reset link sent to your mail' });
      return;
    } catch (error) {
      next(error);

    }
  }
  static async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { resetToken } = req.params;
      const { newPassword } = req.body;

      const { error } = resetPasswordValidator({ resetToken, newPassword });
      if (error) {
        throw new BadRequest(`Error at reset password: ${error.details[0].message}`);
      }
      const payload = { resetToken, newPassword }
      await AuthService.resetPassword(payload);
      res.status(200).json({ success: true, message: 'Password reset successfully' });
      return;

    } catch (error) {
      next(error);
    }
  }

  static async getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.cookies.auth_token;
      if (!token) {
        throw new UnauthorizedError('Unauthorized, you do not have the permission to perform this action');
      }
      const user = await AuthService.getUserFromToken(token);
      if (!user) {
        throw new UnauthorizedError('user not found or invalid token');
      }
      res.status(200).json({ user });
      return;

    } catch (error) {
      next(error);
    }
  }

  static async signOut(req: Request, res: Response, next: NextFunction): Promise<void> {
    // console.log('cookies:', req.cookies);
    try {
      const { sessionId, auth_token } = req.cookies;
      if (!auth_token) { throw new BadRequest('missing required parameter') }
      const decodedToken = await decodeToken(auth_token);
      // console.log(decodedToken)
      const { id } = decodedToken;
      await AuthService.logOut(id);
      res.clearCookie('auth_token', { httpOnly: true, secure: true, sameSite: 'none', })
      res.clearCookie('sessionId', { httpOnly: true, secure: true, sameSite: 'none', })
      res.status(200).json({ success: true, message: 'Logged Out' });
      return;
    } catch (error) {
      next(error)
    }
  }
}


export default AuthController