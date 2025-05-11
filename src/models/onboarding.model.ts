import mongoose, { Document, Schema, Model } from "mongoose";

export interface onboardingInterface {
    title: string;
    taskDescription: string;
    category: 'tech-readiness' | 'mindset' | 'others';
    documentUrl?: string;
    videoUrl?: string;

}

const onboardingMaterialsSchema: Schema<onboardingInterface> = new Schema({
    title: { type: String, required: true },
    taskDescription: { type: String, required: true },
    category: { type: String, enum: ['tech-readiness', 'mindset', 'others'], required: true },
    documentUrl: { type: String },
    videoUrl: { type: String }
})

const onboardingMaterials: Model<onboardingInterface> = mongoose.model<onboardingInterface>('onboardingMaterials', onboardingMaterialsSchema);
export default onboardingMaterials;