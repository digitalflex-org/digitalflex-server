import { NextFunction, Request, Response } from "express";
import { ApplicantInterface } from "../../models/applicant.model";
import ApplicantService from "../../services/apllicant/applicant.service";
import logger from "../../utils/logger";
import { BadRequest, NotFoundError } from "../../utils/errors";
import { Types } from "mongoose";



class ApplicantController {
    static async pingApplicants(req: Request, res: Response, next: NextFunction) {
        try {
            const applicants = await ApplicantService.pingApplicantsLastActive()
            // for (let applicant of applicants) {
            //     logger.info(`applicant ${applicant._id} was last active on ${applicant.lastActiveAt}`);
            // }
            res.status(200).json({ "success": true });
            return;
        } catch (error) {
            next(error);
        }
    }

    static async getApplicants(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const applicants: ApplicantInterface[] = await ApplicantService.getApplicants();
            res.status(200).json({ success: true, message: 'Applicants fetched successfully', data: applicants });
            return;
        } catch (error) {
            next(error);
        }
    }

    static async getApplicantById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            if (!id) {
                throw new BadRequest('Missing required parameters');
            }
            if (!Types.ObjectId.isValid(id)) {
                throw new BadRequest('Not a valid user data');
                return;
            }
            const applicant: ApplicantInterface | null = await ApplicantService.getApplicantById(id);
            if (!applicant) {
                throw new NotFoundError('Applicant not found');
                return;
            }
            res.status(200).json({ success: true, message: 'Applicant fetched successfully', data: applicant });
            return;
        } catch (error) {
            next(error);
        }
    }
    static async refreshUnactivatedApplicants(req: Request, res: Response, next: NextFunction) {
        try {
            await ApplicantService.retryNotActivatedApplicants();
            res.status(200).json({ success: true, message: 'Not Activated accounts refresh mail sent' });
        } catch (error) {
            next(error)
        }
    }

}

export default ApplicantController;