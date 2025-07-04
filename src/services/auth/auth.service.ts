import { Request } from 'express';
import { redisClient } from '../../config/redisConfig';
import Applicant from '../../models/applicant.model';
import TempUser from '../../models/tempUser.model';
import User, { userInterface } from '../../models/user.model';
import { generateRandomToken, hashData, verifyData, verifyToken } from '../../utils/auth/auth.utils';
import { BadRequest, NotFoundError, ResourceConflicts, UnauthorizedError } from '../../utils/errors';
import { BaseError } from '../../utils/errors/BaseError';
import logger from '../../utils/logger';
import omit from 'lodash.omit';
import mongoose, { Model } from 'mongoose';
import Mailer from '../../utils/others/mailer';


class AuthService {
  //register a user
  static async register(data: userInterface): Promise<userInterface> {
    try {
      let user;
      const existingUser = await User.findOne({ email: data.email }) || await TempUser.findOne({ email: data.email }) || await Applicant.findOne({ email: data.email });
      if (existingUser) {
        throw new ResourceConflicts('User with similar data already exist, kindly activate your account and log in!')
      }

      const { password, role } = data
      const hashPassword = await hashData(password);
      data.password = hashPassword
      if (role === 'applicant') {
        user = await new TempUser(data).save()
        return user;
      }
      user = await new User(data).save();
      return user;

    } catch (error) {
      if (error instanceof BaseError) {
        logger.error('Error Registering user', error.message)
      }
      throw error;
    }

  }

  static async getUserFromToken(token: string) {
    try {
      const decoded = await verifyToken(token) as { id: string; role: string };
      const user = await User.findById(decoded.id).select('id role email preferred_name') || await Applicant.findById(decoded.id).select('id role email preferred_name');
      return user;
    } catch (error) {
      if (error instanceof BaseError) {
        logger.error('Error getting user from token', error.message);
      } else {
        logger.error('Unknown Error', error);
      }
      throw error;
    }
  }
  //activate account
  static async generateActivationLink(userId: mongoose.Schema.Types.ObjectId): Promise<string> {
    const activationToken = await generateRandomToken();
    const newUserToken = await redisClient.set(`actToken_${activationToken}`, userId.toString(), 'EX', 900);
    return activationToken
  }
  static async activateAccount(activationToken: string): Promise<string> {
    let newUser;
    try {
      const userId = await redisClient.get(`actToken_${activationToken}`);
      // console.log('userId', userId)
      if (!userId) {
        throw new BadRequest('Invalid or expired activation token.');
      }

      const tempUser = await TempUser.findById(userId).select('+password');
      if (!tempUser) {
        throw new NotFoundError('Temp user not found.');
      }

      // Check for existing user both in user and applicant db
      const existingUser = await User.findOne({ email: tempUser.email }) || await Applicant.findOne({
        email: tempUser.email
      });

      if (existingUser) {
        await TempUser.findByIdAndDelete(userId);
        await redisClient.del(`actToken_${activationToken}`);
        throw new BadRequest('Account already activated. Please log in.');
      }

      const userData = omit(tempUser.toObject(), ['_id', '__v']);
      switch (userData.role.toLowerCase()) {
        case 'applicant':
          newUser = new Applicant(userData);
          newUser.activated = true;
          newUser.lastActiveAt = new Date(Date.now());
          console.log('The user Data:', newUser);
          break;
        case 'user':
        case 'admin':
          newUser = new User(userData);
          break;
        default:
          throw new BadRequest('Invalid user role during activation.');
      }
      await newUser.save();

      await TempUser.findByIdAndDelete(userId);
      await redisClient.del(`actToken_${activationToken}`);

      return 'Account successfully activated!';
    } catch (error: any) {
      logger.error('❌ Error activating user account:', error);
      if (error.code === 11000) {
        throw new BadRequest('Email already registered. Activation failed.');
      }
      if (error instanceof BaseError) throw error;
      throw new BadRequest('Activation failed. Please try again.');
    }
  }
  static async checkApplicantStatus(id: string, model: Model<any>): Promise<boolean> {
    try {
      const user = await model.findOne({ _id: id }).exec();
      return user.status === 'deactivated';
    } catch (error) {
      if (error instanceof BaseError) {
        console.log('Error getting user status', error.message);
      }
      throw error;
    }
  }
  //log a user in
  static async login(data: Partial<userInterface>): Promise<Partial<userInterface>> {
    try {
      const user = await User.findOne({ email: data.email }).select('+password')
        || await Applicant.findOne({ email: data.email }).select('+password');

      if (!user) {
        throw new NotFoundError('Verify your data and try again or sign up, also ensure your account has been activated');
      }

      const verifyPassword = await verifyData(data.password as string, user.password as string);
      if (!verifyPassword) {
        throw new BadRequest('invalid data, kindly confirm provided details');
      }
      if (user.role === 'applicant') {
        const isDeactivated = await this.checkApplicantStatus(user._id, Applicant);
        // console.log(isDeactivated);
        if (!isDeactivated) {
          user.lastActiveAt = new Date(Date.now()).toLocaleString();
          // console.log(user.lastActiveAt);
        } else {
          throw new UnauthorizedError('Kindly reach out to Admin or the HR as your account has been deactivated due to hours of inactivity.');
        }
      }
      user.lastActiveAt = new Date(Date.now()).toLocaleString();
      await user.save();

      const { password, ...detailsWithOutPassword } = user.toObject();
      return detailsWithOutPassword as Partial<userInterface>;
    } catch (error) {
      if (error instanceof BaseError) {
        logger.error('Error logging in user', error.message);
      } else {
        logger.error('Unknown Error', error);
      }
      throw error;
    }
  }

  //resendActivationLink to unactivatedApplicants
  static async resendActivationLink(req: Request) {
    try {
      const unactivatedApplicants = await TempUser.find().exec();
      if (!unactivatedApplicants || unactivatedApplicants.length === 0) {
        return;
      }
      for (const applicant of unactivatedApplicants) {
        const activationToken = await this.generateActivationLink(applicant._id as mongoose.Schema.Types.ObjectId);
        const activationLink = `${req.protocol}://${req.get('host')}/api/auth/activate/${activationToken}`;
        try {
          await Mailer.sendActivationMessage(applicant.email, 'Digital Flex Applicant Account Activation', activationLink);
        } catch (error) {
          if (error instanceof BaseError) {
            logger.error(`Unable to send activation link to ${applicant.email}`, error.message);
          } else {
            logger.error('Unknown Error Occured while trying to resend activation link', error);
          }
          continue;
        }
      }

    } catch (error) {
      if (error instanceof BaseError) {
        logger.error('Unable to resend activation link to applicant', error.message);
      } else {
        logger.error('Unknown Error', error);
      }
      throw error;
    }
  }
  //forgot password
  static async forgotPassword(email: string, req: Request) {
    try {
      const rateLimitWindow = 10 * 60;
      const maxAttempts = 3;
      const rateLimitKey = `resetRateLimit:${email}:${req.ip}`;
      const attempts = await redisClient.get(rateLimitKey);

      if (attempts && parseInt(attempts) >= maxAttempts) {
        throw new BadRequest('You have exceeded the maximum number of reset requests. Please try again in 10 to 15 minutes time.');
      }
      const user = await User.findOne({ email: email }) || await Applicant.findOne({ email: email });
      if (!user) {
        throw new NotFoundError('User not found. Please verify your email and try again.');
      }
      const userId: any = user._id;
      const resetToken = await this.generateActivationLink(userId);
      await redisClient.set(`resetToken_${resetToken}`, userId.toString(), 'EX', 3600);
      const resetLink = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;
      //if the user exist send reset link or otp to user or applicant email
      await Mailer.sendResetLinkOrOtp(user.email, 'Reset your account password', resetLink);
      await redisClient.multi()
        .incr(rateLimitKey)
        .expire(rateLimitKey, rateLimitWindow)
        .exec();
      return;
    } catch (error) {
      if (error instanceof BaseError) {
        logger.error('Error generating password reset options', error.message);
      } else {
        logger.error('Unknown Error', error);
      }
      throw error;
    }
  }

  //reset password
  static async resetPassword(data: any) {
    try {
      const { resetToken, newPassword } = data;
      const userId = await redisClient.get(`resetToken_${resetToken}`);
      if (!userId) {
        throw new NotFoundError('invalid or expired token, kindly request a new reset link');
      }
      const user = await User.findById(userId) || await Applicant.findById(userId);
      if (!user) {
        throw new NotFoundError('User not found.');
      }
      const hashedPassword = await hashData(newPassword);
      user.password = hashedPassword;
      await user.save();
      await redisClient.del(`resetToken_${resetToken}`);
      return 'Password successfully reset!';

    } catch (error) {
      if (error instanceof BaseError) {
        logger.error('Error reseting password', error.message);
      } else {
        logger.error('Unknown Error', error);
      }
      throw error;


    }
  }



  static async logOut(userId: string) {
    try {
      //confirm the user data
      const activeUser = await redisClient.get(`activeUsers:${userId}`);
      //if not found assume it already expired
      if (!activeUser) return;
      const user = await User.findById(userId) || await Applicant.findById(userId);
      if (user) {
        user.lastActiveAt = new Date(Date.now());
        await user.save();
      }
      //remove from active list on redis
      await redisClient.del(`activeUsers:${userId}`);
      // clear cookies on the controller end.
    } catch (error) {
      if (error instanceof BaseError) {
        logger.error('Error Logging user out', error.message);
      } else {
        logger.error('Unknown Error', error);
      }
      throw error;
    }
  }
}

export default AuthService