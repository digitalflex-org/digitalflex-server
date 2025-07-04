import ApplicantService from '../services/apllicant/applicant.service';
import { BaseError } from '../utils/errors/BaseError';
import logger from '../utils/logger';

class ApplicantWorker {
  static async notActivatedChecker() {
    try {
      await ApplicantService.retryNotActivatedApplicants();
    } catch (error) {
      if (error instanceof BaseError) {
        logger.error('Unable to check for unactivated applicants from worker', error.message);
      } else {
        logger.error('Unknown error in notActivatedChecker', error);
      }
      throw error;
    }
  }

  static async inactiveChecker() {
    try {
      await ApplicantService.pingApplicantsLastActive();
    } catch (error) {
      if (error instanceof BaseError) {
        logger.error('Unable to check for inactive applicants', error.message);
      } else {
        logger.error('Unknown error in inactiveChecker', error);
      }
      throw error;
    }
  }

}

export default ApplicantWorker;