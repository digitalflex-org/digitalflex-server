import mongoose, { Model, Schema, Document, Connection } from 'mongoose';
import { getBlogDb } from '../config/dbConfig';


export interface BlogInterface {
  title: string;
  category: string[];
  tags: string[];
  slug: string;
  author?: string;
  postedBy?: string;
  featured?: boolean;
  content: string;
  imageUrl: string;
  createdAt?: Date;
  updatedAt?: Date;
}


const BlogSchema: Schema<BlogInterface> = new Schema({
  title: { type: String, required: true },
  category: { type: [String], required: true },
  tags: { type: [String] },
  slug: { type: String },
  author: { ref: 'User', type: Schema.Types.ObjectId },
  postedBy: { type: String },
  featured: { type: Boolean, default: false },
  content: { type: String },
  imageUrl: { type: String }
}, { timestamps: true });

export const getBlogModel = (conn: Connection): Model<BlogInterface> => {
  return conn.model<BlogInterface>('Blog', BlogSchema);
};

// const Blog: Model<BlogInterface> = blogDb.model<BlogInterface>('Blog', BlogSchema);
// export default Blog;