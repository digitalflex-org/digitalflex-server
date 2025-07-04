import { NextFunction, Request, Response } from 'express';
import { ApplicantInterface } from '../../models/applicant.model';
import ApplicantService from '../../services/apllicant/applicant.service';
import logger from '../../utils/logger';
import { BadRequest, NotFoundError } from '../../utils/errors';
import { Types } from 'mongoose';
import Mailer from '../../utils/others/mailer';
import { configVariables } from '../../config/envConfig';
const { accountManager } = configVariables;



class ApplicantController {
  static async pingApplicants(req: Request, res: Response, next: NextFunction) {
    try {
      const applicants = await ApplicantService.pingApplicantsLastActive()
      // for (let applicant of applicants) {
      //     logger.info(`applicant ${applicant._id} was last active on ${applicant.lastActiveAt}`);
      // }
      res.status(200).json({ 'success': true });
      return;
    } catch (error) {
      next(error);
    }
  }

  static async getApplicants(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { limit = '10', page = '1' } = req.query;
      const parseLimitToNumber = parseInt(limit as string, 10);
      const parsePageToNumber = parseInt(page as string, 10);
      const applicants = await ApplicantService.getApplicants(parseLimitToNumber, parsePageToNumber);
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
      }
      const applicant: ApplicantInterface | null = await ApplicantService.getApplicantById(id);
      if (!applicant) {
        throw new NotFoundError('Applicant not found');
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

  static async deleteApplicant(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;
    if (!id) {
      throw new BadRequest('Missing Required Paramters')
    }
    try {
      await ApplicantService.deleteApplicant(id);
      res.status(204).end();
      return;

    } catch (error) {
      next(error);
    }

  }

  static async notifyManagerOfCompletion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as { _id: string };
      const { applicantId, completed } = req.body;

      if (!user?._id) {
        throw new BadRequest('User is not authenticated');
      }

      if (!applicantId) {
        throw new BadRequest('Missing applicantId in request body');
      }

      if (completed !== true) {
        res.status(400).json({
          success: false,
          message: 'Completion flag must be true to notify account manager',
        });
        return;
      }

      if (user._id !== applicantId) {
        res.status(403).json({
          success: false,
          message: 'You are not allowed to complete onboarding for another applicant',
        });
        return;
      }

      const validApplicant = await ApplicantService.getApplicantById(applicantId);
      if (!validApplicant) {
        throw new NotFoundError('Applicant not found');
      }

      const { name, email, preferred_name } = validApplicant;
      const payload = {
        name,
        email,
        preferred_name: preferred_name ?? '',
      };

      const subject = `${name} Onboarding Completion Notification 🎉`;

      await Mailer.sendCompletionMessageToAccountManager(
        accountManager.email as string,
        subject,
        payload
      );

      res.status(200).json({
        success: true,
        message:
          'Notification mail sent to Account Manager. Your CRM account will be created shortly!',
      });
    } catch (error) {
      next(error);
    }
  }



}

export default ApplicantController;