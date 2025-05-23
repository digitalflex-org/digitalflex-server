import express from 'express';
import userRoute from '../controllers/users/user.route'
import authRoute from '../controllers/auth/auth.route'
import jobRoute from '../controllers/job/job.route'
import applicantRoute from '../controllers/applicants/applicant.route'
const router = express.Router()

router.use('/users', userRoute);
router.use('/auth', authRoute);
router.use('/jobs', jobRoute);
router.use('/applicant', applicantRoute)

export default router;