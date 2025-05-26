import express from 'express'
import UserController from './user.controller'
import PublicController from '../others/public.controller';


const router = express.Router()

router.get('/', UserController.getUsers);
router.get('/active-users', PublicController.getActiveUsers);

export default router;