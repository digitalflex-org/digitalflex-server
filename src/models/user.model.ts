import mongoose, { Document, Model, Schema } from 'mongoose';


export interface userInterface extends Document {
  name: string,
  email: string,
  password: string,
  preferred_name?: string,
  resetToken: string
  role: string
  lastActiveAt?: Date
}
export const rolesHierarchy = {
  admin: ["create", "update", "delete", "view"],
  editor: ["create", "update", "view"],
  viewer: ["view"],
  user: ['view'],
  applicant: ["view"]
};
const userSchema: Schema = new Schema<userInterface>({
  name: { type: String, required: true, trim: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, min: 8, required: true, select: false },
  preferred_name: { type: String, min: 4 },
  resetToken: { type: String, default: null },
  // role: { type: String, enum: ['admin','editor', 'user', 'applicant'], default: 'user' },
  role: { type: String, enum: Object.keys(rolesHierarchy), default: 'viewer' },
  lastActiveAt: { type: Date, default: Date.now }
})
// userSchema.index({ email: 1 }, { unique: true });

const User: Model<userInterface> = mongoose.model<userInterface>('User', userSchema);
export default User

