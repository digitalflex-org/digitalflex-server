import express from 'express';
import ApplicantController from './applicant.controller';

const router = express.Router();

router.get('', ApplicantController.getApplicants);
router.get('/ping', ApplicantController.pingApplicants);
router.get('/:id', ApplicantController.getApplicantById);


export default router;