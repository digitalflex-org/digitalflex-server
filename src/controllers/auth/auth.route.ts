import express from 'express'
import AuthController from './auth.controller'
import passport from '../../middlewares/passport.middleware';


const router = express.Router()




router.get('/me', AuthController.getCurrentUser);
router.post('/signup', AuthController.signup)
router.post('/signin', AuthController.signIn)
router.get('/activate/:activationToken', AuthController.activateAccount)
router.post('/resend-activation', AuthController.resendActivationLink);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword)


export default router