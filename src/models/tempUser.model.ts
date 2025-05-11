import mongoose, { Document, Model, Schema } from 'mongoose';

export interface userInterface extends Document {
  name: string,
  email: string,
  password: string,
  preferred_name?: string,
  resetToken: string
  role: string
}

const tempUserSchema: Schema = new Schema<userInterface>({
  name: { type: String, required: true, trim: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, min: 8, required: true, select: false },
  preferred_name: { type: String, min: 4 },
  resetToken: { type: String },
  role: { type: String, enum: ['admin', 'user', 'applicant'], default: 'user' }
})

const TempUser: Model<userInterface> = mongoose.model<userInterface>('TempUser', tempUserSchema);
export default TempUser;

