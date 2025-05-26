import dotenv from 'dotenv'
dotenv.config();

export const configVariables = {
  dbConfig: {
    dbUrl: process.env.DBURL as string,
    dbName: process.env.DBNAME as string || 'DigitalFlex'
  },
  serverConfig: {
    port: process.env.PORT || 5000,
  },
  redisConfig: {
    host: undefined,
    port: 6379,
    // password:

  },
  jwtConfig: {
    secret:process.env.JWT_SECRET
  }

}