import { redisClient } from '../../config/redisConfig';
import Job, { jobInterface } from '../../models/job.model';
import { BadRequest, NotFoundError, ResourceConflicts } from '../../utils/errors';
import { BaseError } from '../../utils/errors/BaseError';
import logger from '../../utils/logger';


export const generateJobSlug = async (data: string): Promise<string> =>{
  let newstr = data.toLowerCase().split(' ').join('-');
  return newstr
}

class JobService {
  //get all jobs
  static async getJobs(): Promise<jobInterface[]> {
    try {
      //check from cache first
      const cachedJobs = await redisClient.get('jobs')
      if (cachedJobs) {
        return JSON.parse(cachedJobs)
      }
      // otherwise check the db
      const jobs = await Job.find().exec();
      const total = jobs.length;
      await redisClient.set('jobs', JSON.stringify(jobs), 'EX', 60)

      return jobs;
    } catch (error) {
      if (error instanceof BaseError) {
        logger.error('❌ Error fetching jobs:', error.message);
      } else {
        logger.error('❌ Unknown error:', error);
      }
      throw error;

    }
  }

  //get job by id
  static async getJobById(id: string): Promise<jobInterface> {
    try {
      // get job from cached jobs
      const cachedJobs = await redisClient.get('jobs');
      if (cachedJobs) {
        const parsedJobs: jobInterface[] = JSON.parse(cachedJobs)
        const job = parsedJobs.find(item => item._id === id)
        if (job) {
          return job
        }
      }
      // check from db if not in cache
      const job = await Job.findById(id)
      if (!job) {
        throw new NotFoundError('Job Not Found or exceed application deadline')
      }
      return job

    } catch (error) {
      if (error instanceof BaseError) {
        logger.error('❌ Error Fetching Job:', error.message)
      } else {
        logger.error('❌ Unknown Error:', error);
      }
      throw error;
    }
  }

  // get job by slug name
  static async getJobBySlug(data: string): Promise<jobInterface> {
    try {
      const job = await Job.findOne({ slug: data })
      if (!job) {
        throw new NotFoundError('No job with the given parameters found or probably deleted')
      }
      return job

    } catch (error) {
      if (error instanceof BaseError) {
        logger.error('Error Fetching Job', error.message)
      } else {
        logger.error('❌ Unknown Error:', error)
      } throw error;

    }
  }

  //add job
  static async createJob(data: jobInterface): Promise<jobInterface> {
    try {
      let { title, description, location, salary, deadline, slug } = data;
      const exisitingJob = await Job.findOne({ title, location });
      if (exisitingJob) {
        throw new ResourceConflicts('similar job details already exist!');
      }
      // slug = slug || await generateJobSlug(title);
      const job = new Job({
        title: title,
        description: description,
        location: location,
        salary: salary,
        deadline: deadline,
        slug: slug

      })
      await job.save();
      await redisClient.del('jobs');
      return job;
    } catch (error) {
      if (error instanceof BaseError) {
        logger.error('Error creating Job', error.message)
      } else {
        logger.error('❌ Unknown Error:', error)
      } throw error;


    }
  }

  static async updateJobDetails(id: string, data: Partial<jobInterface>): Promise<jobInterface> {
    try {
      const job = await Job.findById(id);

      if (!job) {
        throw new NotFoundError('Selected Job not found probably deleted!')
      }
      job.title = data.title || job.title;
      job.location = data.location || job.location;
      job.salary = data.salary || job.salary;
      job.deadline = data.deadline || job.deadline;
      job.slug = data.slug || job.slug;
      if (data.description) {
        job.description = {
          ...job.description,
          ...data.description
        }
      }
      const updatedJob = await job.save();
      await redisClient.del('jobs');
      return updatedJob;

    } catch (error) {
      if (error instanceof BaseError) {
        logger.error('Error updating Job details', error.message, { isOperational: false })
      } else {
        logger.error('Unknown Error', error)
      }
      throw error;

    }
  }

  static async deleteJobs(identifiers: string[]): Promise<void> {
    try {
      await Job.deleteMany({ _id: { $in: identifiers } })
      await redisClient.del('jobs')
      return;
    } catch (error) {
      if (error instanceof BaseError) {
        logger.error('Error deleting selected jobs', error.message)
      } else {
        logger.error('❌ Unknown Error:', error)
      }
      throw error;
    }
  }
}


export default JobService;