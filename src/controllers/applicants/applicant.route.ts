import express from 'express';
import ApplicantController from './applicant.controller';

const router = express.Router();

router.get('/ping', ApplicantController.pingApplicants);


export default router;