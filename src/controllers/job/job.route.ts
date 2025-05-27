import express from 'express';
import JobController from './job.controller';
import passport from 'passport';
import { permit } from '../../middlewares/auth.middleware';



const router = express.Router();

router.get('', JobController.getAllJobs)
router.get('/:identifier', JobController.getJob)
router.post('/addJob', passport.authenticate('jwt', { session: false }), permit('create'), JobController.addJob)
router.put('/updateJob/:id', passport.authenticate('jwt', { session: false }), permit('update'), JobController.updateJob)
router.delete('/deletejobs', passport.authenticate('jwt', { session: false }), permit('delete'), JobController.deleteJob)


export default router