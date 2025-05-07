import Joi from 'joi';
import { userInterface } from '../../models/user.model';

export const signUpValidation = (data: userInterface) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    preferred_name: Joi.string().optional(),
    password: Joi.string().min(6).max(20).required(),
    role: Joi.string().optional()
  });
  return schema.validate(data);
};
export const signInValidation = (data: userInterface) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });
  return schema.validate(data);
};