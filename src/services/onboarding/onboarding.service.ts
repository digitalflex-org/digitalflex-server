import onboardingMaterials, { onboardingInterface } from '../../models/onboarding.model';
import { NotFoundError, ResourceConflicts } from '../../utils/errors';
import { BaseError } from '../../utils/errors/BaseError';
import logger from '../../utils/logger';


class onboardingService {
  static async uploadMaterials(data: Partial<onboardingInterface>) {
    const { title, videoUrl, taskDescription, documentUrl } = data;
    try {
      const existingMaterial = await onboardingMaterials.findOne({ title }).exec();
      if (existingMaterial) {
        throw new ResourceConflicts('Material with similar data already exist, Do you mean to update?');
      }
      const material = await new onboardingMaterials({
        title: title,
        taskDescription: taskDescription,
        videoUrl: videoUrl || '',
        documentUrl: documentUrl || ''
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
        category: updatedData.category || material.category
      }
      const updatedMaterial = await onboardingMaterials.updateOne({ _id: id },{$set: payload })
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
}
export default onboardingService;