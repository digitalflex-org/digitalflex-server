import Joi from "joi";

export const addMaterialValidator = (data: any) => {
    const schema = Joi.object({
        title: Joi.string().required(),
        videoUrl: Joi.string().optional(),
        taskDescription: Joi.string().required(),
        documentUrl: Joi.string().optional(),
        isVideoCompleted: Joi.boolean().optional(),
        

    })
    return schema.validate(data, { abortEarly: false });
}