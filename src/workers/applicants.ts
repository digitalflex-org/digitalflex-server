import ApplicantService from "../services/apllicant/applicant.service";
import ApplicantController from "../controllers/applicants/applicant.controller";
import { BaseError } from "../utils/errors/BaseError";
import logger from "../utils/logger";

class ApplicantWorker{
    static async notActivatedChecker() {
        try {
            
        } catch (error) {
            if (error instanceof BaseError) {
                logger.error('Unable to check for unactivated applicant from W', error.message, error.isOperational=false);
            } else {
                logger.error('Unknown Error', error)
            }
            throw error;
            
        }
    }


}

export default ApplicantWorker;