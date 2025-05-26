import { NextFunction, Request, Response } from "express";
import { ApplicantInterface } from "../../models/applicant.model";
import ApplicantService from "../../services/apllicant/applicant.service";
import logger from "../../utils/logger";



class ApplicantController {
    static async pingApplicants(req: Request, res: Response, next: NextFunction) {
        const applicants = await ApplicantService.getApplicants();
        for (let applicant of applicants) {
            logger.info(`applicant ${applicant._id} was last active on ${applicant.lastActiveAt}`);
        }
        res.status(200).json({ "success": true });
        return;
    }

}

export default ApplicantController;