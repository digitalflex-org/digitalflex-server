import Joi from 'joi';

export const createJobValidation = (data: any) => {
  const schema = Joi.object({
    title: Joi.string().min(6).required(),
    location: Joi.array().items(Joi.string().required()).min(1).required(),
    description: Joi.object({
      details: Joi.string().min(30).required(),
      responsibilities: Joi.array().items(Joi.string()).optional(),
      skills: Joi.array().items(Joi.string()).min(1).required(),
      highlights: Joi.array().items(Joi.string()).optional(),
      expectations: Joi.array().items(Joi.string()).optional(),
      fits: Joi.array().items(Joi.string()).optional(),
    }).required(),
    link: Joi.string().uri().optional(),
    salary: Joi.number().optional(),
    deadline: Joi.date().optional(),
    slug: Joi.string().optional()
  });

  return schema.validate(data, { abortEarly: false });
};
