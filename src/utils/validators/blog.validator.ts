import Joi from 'joi';


export const postBlogValidator = (data: any) => {
  const schema = Joi.object({
    title: Joi.string().min(6).required(),
    category: Joi.array().items(Joi.string()).required(),
    tags: Joi.array().items(Joi.string()).optional(),
    slug: Joi.string().required(),
    featured: Joi.boolean().optional(),
    content: Joi.string().required(),
    imageUrl: Joi.string().allow('').optional()
  });

  return schema.validate(data, { abortEarly: false });
};
