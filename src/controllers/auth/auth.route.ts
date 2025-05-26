import express from 'express'
import AuthController from './auth.controller'


const router = express.Router()

router.post('/signup', AuthController.signup)
router.post('/signin', AuthController.signIn)
router.get('/activate/:activationToken', AuthController.activateAccount)


export default router