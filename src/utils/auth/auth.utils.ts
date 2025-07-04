import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { configVariables } from '../../config/envConfig';
import { v4 as uuidv4 } from 'uuid'


const jwt_secret = configVariables.jwtConfig.secret;

if (!jwt_secret) {
  throw new Error('JWT secret is not defined in environment configuration.');
}

interface JwtPayload {
  id: string;
  role: string;
  exp?: number;
}

//valid string formats jwt accepts for expiresIn
type JwtExpiry = number | `${number}${'s' | 'm' | 'h' | 'd' | 'w' | 'y'}`;

export const hashData = async (data: string, salt: number = 10): Promise<string> => {
  return bcrypt.hash(data, salt);
};

export const verifyData = async (plainData: string, hashedData: string): Promise<boolean> => {
  return bcrypt.compare(plainData, hashedData);
};

export const generateToken = async (
  id: string,
  role: string,
  exp: JwtExpiry = '1h'
): Promise<string> => {
  const payload: JwtPayload = { id, role };
  const options: SignOptions = {
    expiresIn: exp
  };
  return jwt.sign(payload, jwt_secret, options);
};

export const verifyToken = async (token: string): Promise<JwtPayload> => {
  return jwt.verify(token, jwt_secret) as JwtPayload;
};

export const generateRandomToken = async (): Promise<string> => {
  return crypto.randomUUID()
}

export const generateSessionId = async (exp: number) => {
  const generatedId = uuidv4()
  // console.log('generated sessionId:', generatedId);
  return { generatedId, exp };
}
export const decodeToken = async (token: string): Promise<any> => {
  const decoded = jwt.decode(token);
  if (decoded && typeof decoded === 'object') {
    // console.log('token dat:', decoded);
    return decoded;
  }
  return null;
};