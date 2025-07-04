import { configVariables } from './../../config/envConfig';
import { string } from 'joi';
import { redisClient } from '../../config/redisConfig';
import Applicant, { ApplicantInterface } from '../../models/applicant.model';
import { NotFoundError } from '../../utils/errors';
import { BaseError } from '../../utils/errors/BaseError';
import logger from '../../utils/logger';
import { ObjectId } from 'mongoose';
import AuthService from '../auth/auth.service';
import Mailer from '../../utils/others/mailer';
import Paginate from '../../utils/others/pagination';
const { baseUrl } = configVariables


const MAX_INACTIVITY_PERIOD_MS = 88 * 60 * 60 * 1000;

class ApplicantService {
  static async getApplicants(limit = 10, page = 1, filter: Record<string, any> = {}, sort: Record<string, 1 | -1> = { _id: -1 }): Promise<any> {
    try {
      const cachedApplicants = await redisClient.get(`applicants:page=${page}:limit=${limit}`);
      if (cachedApplicants) {
        return JSON.parse(cachedApplicants);
      }

      const applicants = await Paginate('Applicant', limit, page, filter, sort);


      if (!applicants || applicants.data.length === 0) {
        throw new NotFoundError('No Applicants at the moment')
      }
      if (page > applicants.totalPages) {
        throw new NotFoundError(`Page ${page} exceeds total available pages (${applicants.totalPages})`)
      }
      await redisClient.set(
        `applicants:page=${page}:limit=${limit}`,
        JSON.stringify(applicants),
        'EX',
        3600
      );
      return applicants;
    } catch (error) {
      if (error instanceof BaseError) {
        logger.error('Error fetching applicants', error.message);
      } else {
        logger.error('Uknown Error')
      }
      throw error;
    }
  }

  static async getApplicantById(id: string): Promise<ApplicantInterface> {
    const applicant = await Applicant.findById(id);
    if (!applicant) {
      throw new NotFoundError('Selected Applicant not found or deleted!')
    }
    return applicant;
  }

  static async updateApplicantData(id: string, data: Partial<ApplicantInterface>) {
    try {

      const applicant = await Applicant.findById(id);
      if (!applicant) {
        throw new NotFoundError('No applicant with the selected data found!');
      }
      const { name, status, activated } = data;
      const payload = {
        name, status, activated
      }
      const updatedApplicant = await Applicant.updateOne({ _id: id }, { $set: payload });
      return updatedApplicant;
    } catch (error) {
      if (error instanceof BaseError) {
        logger.error('Error updating applicant data', error.message);
      } else {
        logger.error('Uknown Error')
      }
      throw error;
    }
  }

  static async deleteApplicant(id: string): Promise<void> {
    try {
      const applicant = await Applicant.findById(id);
      if (!applicant) {
        throw new NotFoundError('Selected Applicant Not found, Probably deleted.');
      }
      await Applicant.deleteOne({ _id: id });
    }
    catch (error) {
      if (error instanceof BaseError) {
        logger.error('Error deleting applicant', error.message);
      } else {
        logger.error('Uknown Error')
      }
      throw error;
    }
  }

  static async pingApplicantsLastActive() {
    try {
      const cutoff = new Date(Date.now() - MAX_INACTIVITY_PERIOD_MS);
      const inactiveApplicants = await Applicant.find({
        activated: true,
        lastActiveAt: { $lte: cutoff }
      }).exec();

      const ids = inactiveApplicants.map(applicant => applicant._id as string);

      if (ids.length > 0) {
        await this.deactivateInactivityApplicant(ids);
        inactiveApplicants.forEach(applicant => {
          logger.info(`${applicant._id} was last active at ${applicant.lastActiveAt} and has been deactivated.`);
        });
      } else {
        logger.info('No inactive applicants found to deactivate.');
      }

    } catch (error) {
      if (error instanceof BaseError) {
        logger.error('Error checking applicant activity', error.message);
      } else {
        logger.error('Unknown error in pingApplicantsLastActive', error);
      }
      throw error;
    }
  }

  static async deactivateInactivityApplicant(ids: string[]): Promise<any> {
    try {
      // const applicant = await Applicant.findById(id);
      if (!ids || ids.length === 0) {
        throw new NotFoundError('No applicant IDs provided for deactivation!');
      }
      const deacivatedApplicants = await Applicant.updateMany(
        { _id: { $in: ids } },
        { $set: { status: 'deactivated' } }
      );
      logger.info(`Deactivated ${ids.length} applicants.`);
      return deacivatedApplicants;
    } catch (error) {
      if (error instanceof BaseError) {
        logger.error('Error deactivating applicant', error.message);
      } else {
        logger.error('Unknown error', error);
      }
      throw error;
    }

  }
  static async retryNotActivatedApplicants(id: string | null = null) {
    let req: Request
    try {
      let applicants: ApplicantInterface[] = [];

      if (id) {
        const applicant = await this.getApplicantById(id);
        applicants = [applicant];
      } else {
        applicants = await Applicant.find({ activated: { $ne: true } });
      }

      if (!applicants.length) {
        logger.info('No unactivated applicants found.');
        return;
      }

      for (const applicant of applicants) {
        const activationToken = await AuthService.generateActivationLink(applicant._id as ObjectId);
        let activationLink = `${baseUrl}/api/auth/activate/${activationToken}`;


        await Mailer.sendActivationMessage(
          applicant.email,
          'Activate Your Account',
          activationLink
        );

        logger.info(`Activation link re-sent to applicant: ${applicant.email}`);
      }

    } catch (error) {
      if (error instanceof BaseError) {
        logger.error('Error retrying unactivated applicants', error.message);
      } else {
        logger.error('Unknown error during retryNotActivatedApplicants', error);
      }
      throw error;
    }
  }

}
export default ApplicantService;