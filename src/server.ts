import express from 'express';
import { configVariables } from './config/envConfig';
import connectDb from './config/dbConfig';
import { connectRedis } from './config/redisConfig';
import bodyParser from 'body-parser'
import routes from './routes'


const app = express()


connectDb()
connectRedis()


app.use(express.json())
// app.use(bodyParser.json());

app.use('/api', routes)







export default app;