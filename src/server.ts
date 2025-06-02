import express from 'express';
import cors from 'cors';
import { configVariables } from './config/envConfig';
import connectDb from './config/dbConfig';
import { connectRedis } from './config/redisConfig';
// import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser';
import routes from './routes'
import passport from './middlewares/passport.middleware'


const app = express()


connectDb()
connectRedis()

const allowedOrigins = [
    'http://localhost:3000',
    'https://c48e-102-88-111-153.ngrok-free.app',
    '102.88.111.153',
  ];


app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));
app.use(passport.initialize())

// app.use(bodyParser.json());

app.use('/api', routes)




export default app;