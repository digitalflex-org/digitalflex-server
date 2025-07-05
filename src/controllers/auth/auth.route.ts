import express from 'express'
import AuthController from './auth.controller'
import passport from '../../middlewares/passport.middleware';


const router = express.Router()




router.get('/me', AuthController.getCurrentUser);
router.post('/signup', AuthController.signup)
router.post('/signin', AuthController.signIn)
router.post('/signout', AuthController.signOut)
router.get('/activate', AuthController.activateAccount)
router.post('/resend-activation', AuthController.resendActivationLink);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password/:resetToken', AuthController.resetPassword)


export default router