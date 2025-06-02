import { string } from "joi";
import { redisClient } from "../../config/redisConfig";
import Applicant, { ApplicantInterface } from "../../models/applicant.model";
import { NotFoundError } from "../../utils/errors";
import { BaseError } from "../../utils/errors/BaseError";
import logger from "../../utils/logger";

const MAX_INACTIVITY_PERIOD_MS = 88 * 60 * 60 * 1000;

class ApplicantService {
    static async getApplicants(): Promise<ApplicantInterface[]> {
        const applicants = await Applicant.find().exec();
        if (!applicants || applicants.length === 0) {
            throw new NotFoundError('No Applicants at the moment')
        }
        await redisClient.set('applicants', JSON.stringify(applicants), 'EX', 3600);
        return applicants;
    }

    static async getApplicantById(id: string): Promise<ApplicantInterface> {
        const applicant = await Applicant.findById(id);
        if (!applicant) {
            throw new NotFoundError('Selected Applicant not found or deleted!')
        }
        return applicant;
    }

    static async updateApplicantData(id: string, data: Partial<ApplicantInterface>) {
        await Applicant.findById(id);
        if (!Applicant) {
            throw new NotFoundError('No applicant with the selected data found!');
        }
        const { name, status, activated } = data;
        const payload = {
            name, status, activated
        }
        const updatedApplicant = await Applicant.updateOne({ _id: id }, { $set: payload });
        return updatedApplicant;
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
            const applicants = await Applicant.find().exec();
            for (const applicant of applicants) {
                if (applicant.activated) {
                    if (applicant.lastActiveAt && (Date.now() - applicant.lastActiveAt.getTime()) >= MAX_INACTIVITY_PERIOD_MS) {
                        let id = applicant._id
                        this.deactivateInactivityApplicant(id as string)
                        logger.info(`${applicant} was last active at ${applicant.lastActiveAt} and has past the limit threshold so account has been deactivated.`);
                    }
                    logger.info(applicant._id);
                    logger.info(`${applicant} was last active at ${applicant.lastActiveAt}`)
                } else {
                    logger.info(`${applicant._id} has not been activated yet`)
                    // 
                }
            }

        } catch (error) {
            if (error instanceof BaseError) {
                logger.error('Error getting a ping on applicant', error.message);
            } else {
                logger.error('Unknown error', error);
            }
            throw error;
        }

    }
    static async deactivateInactivityApplicant(id: string): Promise<ApplicantInterface> {
        try {
            const applicant = await Applicant.findById(id);
            if (!applicant) {
                throw new NotFoundError('Selected Applicant not found!')
            }
            if (applicant.activated && applicant.lastActiveAt && (Date.now() - applicant.lastActiveAt.getTime()) >= MAX_INACTIVITY_PERIOD_MS) {
                await Applicant.updateOne({ _id: id }, { status: 'deactivated' });
            }
            return applicant;
        } catch (error) {
            if (error instanceof BaseError) {
                logger.error('Error deactivating applicant', error.message);
            } else {
                logger.error('Unknown error', error);
            }
            throw error;
        }

    }
    static async retryNotActivatedApplicants(id=null) {
        try { 
            let applicants;
            if (id) {
                applicants = await this.getApplicantById(id);
            }
            applicants = await Applicant.find({ activated: { $ne: true } });
            // if id is present get the applicant with the id and skip the second step move to the next step
            // get applicants that their account has not been activated yet
            // track if activation link has been sent to their mail
            // base on the status of the previous state(2) above construct a nice mail to resend the activation link to their mail.
            // and if there is error catch and throw the error to the middleware.
        } catch (error) {
            if (error instanceof BaseError) {
                logger.error('Error reactivating unactivated applicants account', error.isOperational = false, error.message)
            } else {
                logger.error('Unknown Error while trying not activated applicants account ', error)
            }
            throw error;

        }
    }
}
export default ApplicantService;