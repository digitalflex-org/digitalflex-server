import { redisClient } from '../../config/redisConfig';
import Applicant from '../../models/applicant.model';
import TempUser from '../../models/tempUser.model';
import User, { userInterface } from '../../models/user.model';
import { generateRandomToken, hashData, verifyData } from '../../utils/auth/auth.utils';
import { BadRequest, NotFoundError, ResourceConflicts } from '../../utils/errors';
import { BaseError } from '../../utils/errors/BaseError';
import logger from '../../utils/logger';
import omit from 'lodash.omit';


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
      if (role.toLocaleLowerCase() === 'applicant') {
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

  //activate account
  static async generateActivationLink(userId: string): Promise<string> {
    const activationToken = await generateRandomToken();
    const newUserToken = await redisClient.set(`actToken_${activationToken}`, userId, 'EX', 900);
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


  //log a user in
  static async login(data: Partial<userInterface>): Promise<Partial<userInterface>> {
    try {
      const user = await User.findOne({ email: data.email }).select('+password') || await Applicant.findOne({ email: data.email }).select('+password');
      if (!user) {
        throw new NotFoundError('Verify your data and try again or sign up, also ensure your account has been activated');
      }

      const verifyPassword = await verifyData(data.password as string, user.password as string)
      if (!verifyPassword) {
        throw new BadRequest('invalid data, kindly confirm provided details')
      }
      const { password, ...detailsWithOutPassword } = user.toObject();
      if (!detailsWithOutPassword.name) {
        throw new BadRequest('User data is incomplete. Name is missing.');
      }
      return detailsWithOutPassword as Partial<userInterface>;
    } catch (error) {
      logger.error('Error logging in user', error instanceof Error ? error.message : 'Unknown error');
      if (error instanceof BaseError) {
        throw error;
      }
      throw new BadRequest('Login failed. Please try again.');
    }
  }

  //forgot password
  static async forgotPassword(email: string) {
    const user = await User.findOne({ email: email }) || await Applicant.findOne({email:email});
    if (!user) {
      throw new BaseError('Not a registred user');
    }
    //if the user exist send reset link or otp to user or applicant email
    // add limit to the time reset link or otp can e requested
  }
  //reset password
  // 

}

export default AuthService