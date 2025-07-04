import mongoose, { mongo, Types } from 'mongoose';
import Applicant, { ApplicantInterface } from '../../models/applicant.model';
import onboardingMaterials, { onboardingInterface } from '../../models/onboarding.model';
import { BadRequest, NotFoundError, ResourceConflicts, UnauthorizedError } from '../../utils/errors';
import { BaseError } from '../../utils/errors/BaseError';
import logger from '../../utils/logger';


class onboardingService {
  static async uploadMaterials(data: Partial<onboardingInterface>) {
    const { title, videoUrl, taskDescription, documentUrl, category, duration } = data;
    try {
      const existingMaterial = await onboardingMaterials.findOne({ title }).exec();
      if (existingMaterial) {
        throw new ResourceConflicts('Material with similar data already exist, Do you mean to update?');
      }
      const material = await new onboardingMaterials({
        title: title,
        taskDescription: taskDescription,
        videoUrl: videoUrl,
        documentUrl: documentUrl,
        category: category,
        duration: duration
      }).save()
      return material
    } catch (error) {
      if (error instanceof BaseError) {
        logger.error('Error adding onboarding material', error.message);
      } else {
        logger.error('Unknown Error', error);
      }
      throw error;
    }
  }
  static async getOnboardingMaterials(): Promise<onboardingInterface[]> {
    try {
      const boardingMaterials = await onboardingMaterials.find().exec();
      if (!boardingMaterials || boardingMaterials.length === 0) {
        throw new NotFoundError('No onboarding Materials added yet!');
      }
      return boardingMaterials;

    } catch (error) {
      if (error instanceof BaseError) {
        logger.error('Error fetching onboardiing Materials', error.message);
      } else {
        logger.error('Unknown Error', error)
      }
      throw error;
    }
  }

  static async updateMaterial(id: string, data: Partial<onboardingInterface>) {
    try {
      const material = await onboardingMaterials.findById(id);
      if (!material) {
        throw new NotFoundError('Selected Material Not Found!');
      }
      const { ...updatedData } = data;
      const payload = {
        title: updatedData.title || material.title,
        taskDescription: updatedData.taskDescription || material.taskDescription,
        documentUrl: updatedData.documentUrl || material.documentUrl,
        videoUrl: updatedData.videoUrl || material.videoUrl,
        category: updatedData.category || material.category,
        duration: updatedData.duration || material.duration
      }
      const updatedMaterial = await onboardingMaterials.updateOne({ _id: id }, { $set: payload })
      return updatedMaterial;
    } catch (error) {
      if (error instanceof BaseError) {
        logger.error('Error updating Material', error.message);
      } else {
        logger.error('Unknown Error', error);
      }
      throw error;
    }
  }

  static async removeOnboardingMaterials(ids: string[]) {
    try {
      await onboardingMaterials.deleteMany(ids)
    } catch (error) {
      if (error instanceof BaseError) {
        logger.error('Error removing onboarding materials', error.message);

      } else {
        logger.error('Unknown error', error);
      }
      throw error;
    }

  }

  static async provideRandomOnboardingQuest(category: string, userId: string) {
    try {
      const categoryMaterials = await onboardingMaterials.find({ category });
      if (!categoryMaterials || categoryMaterials.length === 0) {
        throw new NotFoundError('No Materials for this section yet, kindly reach out to the system adminstrator for futher assistance');
      }
      const applicant = await Applicant.findById(userId).select('progress');
      if (!applicant) {
        throw new BadRequest('Not an active applicant!');
      }
      const progressMap = new Map(
        applicant.progress.map((entry) => [entry.materialId.toString(), entry.isCompleted])
      );

      const personalizedMaterials = categoryMaterials.map((material: onboardingInterface) => {
        const completed = progressMap.get((material._id as Types.ObjectId).toString()) || false;
        return {
          ...material.toObject(),
          isCompleted: completed
        };
      });

      return personalizedMaterials;
    } catch (error) {
      if (error instanceof BaseError) {
        logger.error('Error fetching section Materials', error.message)
      } else {
        logger.error('Unknow Error', error);
      }
      throw error;
    }

  }

  static async applicantCompletedMaterial(applicantId: string, materialId: string) {
    try {
      const material = await onboardingMaterials.findById(materialId);
      if (!material) {
        throw new NotFoundError('Selected material not found');
      }

      const applicant = await Applicant.findById(applicantId);
      if (!applicant) {
        throw new NotFoundError('Selected applicant not found');
      }

      const existingProgress = applicant.progress.find(item => item.materialId.toString() === materialId);
      if (existingProgress?.isCompleted) {
        throw new BadRequest('Material already marked as completed');
      }

      // Update progress
      const updatedProgress = {
        materialId: material._id as Types.ObjectId,
        category: material.category,
        isCompleted: true,
        completionDate: new Date(),
      };

      applicant.progress = [
        ...applicant.progress.filter(item => item.materialId.toString() !== materialId),
        updatedProgress as ApplicantInterface['progress'][0],
      ];


      // Calculate score
      const categoryProgress = applicant.progress.filter(item => item.category === material.category);
      const completedCount = categoryProgress.filter(item => item.isCompleted).length;
      const totalCount = categoryProgress.length;
      const score = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

      const categoryScoreMap: Record<string, keyof ApplicantInterface['screening']> = {
        'tech-readiness': 'techReadiness',
        'mindset': 'mindsetScore',
        'logic': 'logicScore',
      };

      const scoreKey = categoryScoreMap[material.category];

      if (scoreKey) {
        applicant.screening[scoreKey] = Math.round(score);
      }


      await applicant.save();

      return applicant.progress;

    } catch (error) {
      logger.error('Error completing onboarding material', error);
      throw error;
    }
  }



}
export default onboardingService;