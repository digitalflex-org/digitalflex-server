import mongoose, { Model } from 'mongoose';
import { NotFoundError } from '../errors';

const Paginate = async (
  model: string,
  limit: number = 10,
  page: number = 1,
  filter: Record<string, any> = {},
  sort: Record<string, 1 | -1> = {}
) => {
  const models: Record<string, Model<any>> = {
    User: mongoose.model('User'),
    Applicant: mongoose.model('Applicant'),
    Job: mongoose.model('Job'),
    OnboardingMaterial: mongoose.model('onboardingMaterials'),
  };

  const selectedModel = models[model];

  if (!selectedModel) {
    throw new NotFoundError(`Model "${model}" not found.`);
  }

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    selectedModel.find(filter).sort(sort).skip(skip).limit(limit),
    selectedModel.countDocuments(filter)
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data,
    total,
    page,
    totalPages,
  };
};

export default Paginate;
