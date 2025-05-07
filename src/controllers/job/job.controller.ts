import { Request, Response, NextFunction } from 'express';
import JobService from '../../services/job/job.service';
import { BadRequest, NotFoundError } from '../../utils/errors';
import { createJobValidation } from '../../utils/validators/job.validator';
import { isValidObjectId } from 'mongoose';
import { string } from 'joi';
import Job, { jobInterface } from '../../models/job.model';
// import { redisClient } from '../../config/redisConfig';



class JobController {
    static async getAllJobs(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const jobs = await JobService.getJobs();
            if (!jobs || jobs.length === 0) {
                throw new NotFoundError('No jobs at the moment check back later!')
            }

            res.status(200).json({ success: true, jobs })
        } catch (error) {
            next(error)
        }
    }

    static async getJob(req: Request, res: Response, next: NextFunction) {
        try {
            let job;
            const { identifier } = req.params;
            if (!identifier) {
                throw new BadRequest('verify selected job exists')
            }
            job = isValidObjectId(identifier) ? await JobService.getJobById(identifier) : await JobService.getJobBySlug(identifier)
            if (!job) throw new NotFoundError('Job Not Found!');
            res.status(200).json({ 'success': true, job })
        } catch (error) {
            next(error)
        }
    }

    static async addJob(req: Request, res: Response, next: NextFunction) {
        try {
            const { error } = createJobValidation(req.body);
            if (error) {
                throw new BadRequest(`"missing required parameters!:"
                ${error.message}`)
            }
            const job = await JobService.createJob(req.body);
            res.status(200).json({ success: true, job })
        } catch (error) {
            next(error)

        }
    }

    static async updateJob(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const { title, ...data } = req.body;
            
            const updatedJob = await JobService.updateJobDetails(id, data);
            res.status(200).json({ success: true, message: 'Job details updated sucessfully!', job: updatedJob });
        } catch (error) {
            next(error);
        }
    }


    static async deleteJob(req: Request, res: Response, next: NextFunction) {
        try {
            const { ids } = req.body
            if (!ids || !Array.isArray(ids)) {
                throw new BadRequest(`Not a valid format for items to be deleted. id's must be an array of string`)
            }
            await JobService.deleteJobs(ids as string[])
            res.status(204).send();
            return;
        } catch (error) {
            next(error);
        }
    }
}

export default JobController