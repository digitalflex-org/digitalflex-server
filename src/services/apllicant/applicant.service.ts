import { redisClient } from "../../config/redisConfig";
import Applicant, { ApplicantInterface } from "../../models/applicant.model";
import { NotFoundError } from "../../utils/errors";
import { BaseError } from "../../utils/errors/BaseError";
import logger from "../../utils/logger";


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
        const { name, status } = data;
        const payload = {
            name, status
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

    static async pingApplicantsLastActive(ids: string[]) {
        try {
            const applicants = await Applicant.find().exec();
            for (const aplicant of applicants) {
                logger.info(aplicant._id);
                logger.info(`${aplicant} was last active at ${aplicant.lastActiveAt}`)

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
            const MAX_INACTIVITY_PERIOD_MS = 88 * 60 * 60 * 1000;
            const applicant = await Applicant.findById(id);
            if (!applicant) {
                throw new NotFoundError('Selected Applicant not found!')
            }
            if (applicant.lastActiveAt && (Date.now() - applicant.lastActiveAt.getTime()) >= MAX_INACTIVITY_PERIOD_MS) {
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
}
export default ApplicantService;