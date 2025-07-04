import path from 'path';
import dotenv from 'dotenv'
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const configVariables = {
  baseUrl: process.env.BASE_URL,
  dbConfig: {
    dbUrl: process.env.DBURL as string,
    db2Url: process.env.DB2URL as string,
    dbName: process.env.DBNAME as string || 'DigitalFlex',
    db2Name: process.env.DB2NAME as string || 'DFBlogDatabase'
  },
  serverConfig: {
    port: process.env.PORT || 5000,
  },
  redisConfig: {
    host: undefined,
    port: 6379,
    url: process.env.REDISURL
    // password:

  },
  jwtConfig: {
    secret: process.env.JWT_SECRET
  },
  accountManager: {
    email: process.env.ACCOUNT_MANAGER_EMAIL
  }

}