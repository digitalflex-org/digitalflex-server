import { BaseError } from "../../utils/errors/BaseError";
import logger from "../../utils/logger";
import ApplicantWorker from "../../workers/applicants";


class WorkerService {
    static async inactiveApplicants() {
        try {
            await ApplicantWorker.inactiveChecker();
        } catch (error) {
            if (error instanceof BaseError) {
                logger.error('Error in WorkerService.inactiveApplicants', error.message);
            } else {
                logger.error('Unknown error in WorkerService.inactiveApplicants', error);
            }
            throw error;
        }
    }

    static async notActivatedApplicants() {
        try {
            await ApplicantWorker.notActivatedChecker();
        } catch (error) {
            if (error instanceof BaseError) {
                logger.error('Error in WorkerService.notActivatedApplicants', error.message);
            } else {
                logger.error('Unknown error in WorkerService.notActivatedApplicants', error);
            }
            throw error;
        }
    }
}

export default WorkerService;