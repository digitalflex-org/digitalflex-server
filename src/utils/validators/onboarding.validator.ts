import Joi from 'joi';


export const addScreeningMaterialValidator = (data: any) => {
  const schema = Joi.object({
    title: Joi.string().required(),
    taskDescription: Joi.string().required().min(10),
    category: Joi.string().required(),
    documentUrl: Joi.string().optional().empty(''),
    videoUrl: Joi.string().optional().empty(''),
    duration: Joi.number().optional(),
    isCompleted: Joi.boolean().optional(),
  });
  return schema.validate(data, { abortEarly: false });
}