import express from 'express';
import userRoute from '../controllers/users/user.route'
import authRoute from '../controllers/auth/auth.route'
import jobRoute from '../controllers/job/job.route'
import applicantRoute from '../controllers/applicants/applicant.route'
import onboardingRoute from '../controllers/onboarding/onboarding.route'
import crmRoute from '../controllers/crm/crm.route'
import publicRoute from '../controllers/others/public.route'
const router = express.Router()

router.use('/users', userRoute);
router.use('/auth', authRoute);
router.use('/jobs', jobRoute);
router.use('/applicants', applicantRoute);
router.use('/onboarding', onboardingRoute);
router.use('/crm', crmRoute);
router.use('/public', publicRoute);


export default router;