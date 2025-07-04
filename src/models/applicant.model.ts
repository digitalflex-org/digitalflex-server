import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { userInterface } from './user.model';

export interface ApplicantInterface extends userInterface {
    phone?: string;
    qualified: boolean;
    screening: {
        techReadiness: number;
        mindsetScore: number;
        logicScore: number;
    };
    progress: {
        materialId: Types.ObjectId;
        category: 'tech-readiness' | 'mindset' | 'logic' | 'others';
        isCompleted: boolean;
        completionDate?: Date;
    }[];
    onboardingStartAt?: Date;
    lastActiveAt?: Date;
    activated: boolean;
    status: 'pending' | 'qualified' | 'rejected' | 'activated' | 'inactive' | 'deactivated';
    createdAt: Date;
    // crmId?: string;
    role: string;
}
export interface ApplicantActivationInterface {
    userId: string;
    submittedAt: Date;
    confirmation: boolean;
}

const ApplicantSchema: Schema<ApplicantInterface> = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  preferred_name: { type: String },
  phone: { type: String },
  qualified: { type: Boolean, required: true, default: false },
  screening: {
    techReadiness: { type: Number, min: 0, max: 100, required: true, default: 0 },
    mindsetScore: { type: Number, min: 0, max: 100, required: true, default: 0 },
    logicScore: { type: Number, min: 0, max: 100, required: true, default: 0 }
  },
    
  onboardingStartAt: { type: Date },
  lastActiveAt: { type: Date },
  activated: { type: Boolean, required: true, default: false },
  status: {
    type: String,
    enum: ['pending', 'qualified', 'rejected', 'activated', 'inactive', 'deactivated'],
    default: 'pending'
  },
  progress: [
    {
      materialId: { type: Schema.Types.ObjectId, ref: 'OnboardingMaterial', required: true },
      category: { type: String, enum: ['tech-readiness', 'mindset', 'logic', 'others'], required: true },
      isCompleted: { type: Boolean, default: false },
      completionDate: { type: Date }
    }
  ],
  createdAt: { type: Date, default: Date.now },
  // crmId: { type: String },
  role: { type: String, default: 'applicant' }
}, { timestamps: true });

const Applicant: Model<ApplicantInterface> = mongoose.model<ApplicantInterface>('Applicant', ApplicantSchema);
export default Applicant;