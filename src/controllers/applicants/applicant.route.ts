import express from 'express';
import ApplicantController from './applicant.controller';
import passport from '../../middlewares/passport.middleware';
import { isAdmin, permit, requiredRoles } from '../../middlewares/auth.middleware';

const router = express.Router();

router.get('', ApplicantController.getApplicants);
router.get('/ping', ApplicantController.pingApplicants);
router.get('/:id', ApplicantController.getApplicantById);
router.post('/completed-onboarding', passport.authenticate('jwt', { session: false }), ApplicantController.notifyManagerOfCompletion);
router.delete('/:id', passport.authenticate('jwt', { session: false }), isAdmin, permit('delete'), ApplicantController.deleteApplicant);


export default router;