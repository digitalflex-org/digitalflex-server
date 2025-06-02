import mongoose, { Document, Schema, Model } from "mongoose";

export interface onboardingInterface extends Document {
    title: string;
    taskDescription: string;
    category: 'tech-readiness' | 'mindset' | 'others' | 'logic';
    documentUrl?: string;
    videoUrl?: string;
    isCompleted?: boolean;
    duration?: number;

}

const onboardingMaterialsSchema: Schema<onboardingInterface> = new Schema({
    title: { type: String, required: true },
    taskDescription: { type: String, required: true },
    category: { type: String, enum: ['tech-readiness', 'mindset', 'logic', 'others'], required: true },
    documentUrl: { type: String },
    videoUrl: { type: String, },
    isCompleted: {
        type: Boolean, default: false
    },
    duration: { type: Number, }
})

const onboardingMaterials: Model<onboardingInterface> = mongoose.model<onboardingInterface>('onboardingMaterials', onboardingMaterialsSchema);
export default onboardingMaterials;