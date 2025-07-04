import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Request } from 'express';
import User, { rolesHierarchy } from '../models/user.model';
import { configVariables } from '../config/envConfig';
import Applicant from '../models/applicant.model';

const cookieExtractor = (req: Request) => {
  let token, sessionId = null;
  if (req && req.cookies) {
    token = req.cookies['auth_token'];
    // sessionId = req.cookies['sessionId'];
  }
  return token;
}

const opts = {
  jwtFromRequest: cookieExtractor,
  secretOrKey: configVariables.jwtConfig.secret as string,
};

passport.use('jwt',new JwtStrategy(opts, async (jwtPayload: any, done: any) => {
  try {
    const user = (await User.findById({ _id: jwtPayload.id })) || (await Applicant.findById({ _id: jwtPayload.id }));

    if (user) {
      const userPayload= {
        id: user._id as string,
        role: user.role as keyof typeof rolesHierarchy,
        name: user.name,
        email: user.email,
      };
      return done(null, userPayload);
    } else {
      return done(null, false);
    }

  } catch (error) {
    return done(error, false);
  }
}));

export default passport;
