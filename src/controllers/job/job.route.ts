import express from 'express';
import JobController from './job.controller';

const router = express.Router();

router.get('', JobController.getAllJobs)
router.get('/:identifier', JobController.getJob)
router.post('/addJob', JobController.addJob)
router.put('/updateJob/:id', JobController.updateJob)
router.delete('/deletejobs', JobController.deleteJob)


export default router