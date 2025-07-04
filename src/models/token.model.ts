import mongoose, { Schema, Document, Model } from 'mongoose';

export interface tokenInterface extends Document {
    email: string,
    resetToken: string
}

const tokenSchema: Schema = new Schema<tokenInterface>({
  email: { type: String },
  resetToken: { type: String }
})

const Token: Model<tokenInterface> = mongoose.model<tokenInterface>('Token', tokenSchema);
export default Token;