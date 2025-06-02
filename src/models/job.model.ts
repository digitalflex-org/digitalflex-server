import { required, string } from 'joi';
import mongoose, { Document, Schema, Model, mongo } from 'mongoose';
import { generateJobSlug } from '../services/job/job.service';
import User from './user.model';


export interface jobInterface extends Document {
  title: string,
  description: {
    details: string;
    responsibilities: string[];
    skills: string[];
    highlights?: string[];
    expectations?: string[];
    fits?: string[];

  },
  location: [string],
  salary: number,
  deadline: Date,
  link: string,
  slug: string,
  postedBy: mongoose.Schema.Types.ObjectId,
  updatedBy: mongoose.Schema.Types.ObjectId
}


const jobSchema: Schema = new Schema<jobInterface>({
  title: { type: String, required: true, min: 6 },
  location: { type: [String], required: true },
  description: {
    details: {
      type: String,
      required: [true, 'Job must have a description'],
      minlength: [30, 'Description must be at least 30 characters long'],
    },
    responsibilities: { type: [String] },
    skills: { type: [String], required: true },
    highlights: { type: [String] },
    expectations: { type: [String] },
    fits: { type: [String] },
  },
  link: { type: String },
  salary: { type: Number },
  deadline: { type: Date },
  slug: { type: String },
  postedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
})
jobSchema.pre('save', async function (next) {
  if (!this.slug) {
    this.slug = generateJobSlug(this.title as string);
  }
  await this.populate('postedBy')
  await this.populate('updatedBy')
  next();
});
const Job: Model<jobInterface> = mongoose.model<jobInterface>('Job', jobSchema);
export default Job