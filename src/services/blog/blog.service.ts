import { getBlogModel, BlogInterface } from '../../models/blog.model';
import { getBlogDb } from '../../config/dbConfig';
import { NotFoundError, ResourceConflicts } from '../../utils/errors';
import { BaseError } from '../../utils/errors/BaseError';
import logger from '../../utils/logger';
import { Model } from 'mongoose';
import { redisClient } from '../../config/redisConfig';


class BlogService {
  private Blog: Model<BlogInterface>;
  constructor() {
    const db = getBlogDb();
    this.Blog = getBlogModel(db);
  }
  async getBlogPosts(
    limit = 10,
    page = 1,
    filter: Record<string, any> = {},
    sort: Record<string, 1 | -1> = { _id: -1 }
  ): Promise<BlogInterface[]> {
    try {
      const cacheKey = `blogs:page=${page}:limit=${limit}:filter=${JSON.stringify(filter)}:sort=${JSON.stringify(sort)}`;
      const cachedBlogs = await redisClient.get(cacheKey);

      if (cachedBlogs) {
        return JSON.parse(cachedBlogs);
      }

      const blogs = await this.Blog.find(filter)
        .sort(sort)
        .limit(limit)
        .skip((page - 1) * limit)
        .exec();

      if (!blogs || blogs.length === 0) {
        throw new NotFoundError('No Blogs at the moment');
      }

      await redisClient.set(cacheKey, JSON.stringify(blogs), 'EX', 3600);
      return blogs;
    } catch (error) {
      logger.error('Error fetching blog posts', error instanceof BaseError ? error.message : error);
      throw error;
    }
  }


  async getBlogPostBySlug(query: string): Promise<BlogInterface> {
    try {

      const blogPost = await this.Blog.findOne({ slug: query });
      if (!blogPost) {
        throw new NotFoundError('No Blog with the specified data found');
      }
      return blogPost;

    } catch (error) {
      if (error instanceof BaseError) {
        logger.error('Error fetching specified blog', error.message)
      } else {
        logger.error('Unknown Error', error);
      }
      throw error;
    }
  }

  async getBlogPostById(query: string): Promise<BlogInterface> {
    try {
      const blogPost = await this.Blog.findById(query);
      if (!blogPost) {
        throw new NotFoundError('No Blog Post matching the Provided Data.');
      }
      return blogPost;

    } catch (error) {
      if (error instanceof BaseError) {
        logger.error('Error Fetching Blog Post', error.message);
      } else {
        logger.error('Unknown Error', error);
      }
      throw error;

    }
  }
  async getFeaturedPosts(): Promise<BlogInterface[]> {
    try {
      const blogPost = await this.Blog.find({ featured: true }).exec();
      if (!blogPost || blogPost.length === 0) {
        throw new NotFoundError('No Featured Blogs at the moment!');
      }
      return blogPost;
    } catch (error) {
      if (error instanceof BaseError) {
        logger.error('unable to fetch featured blogs', error.message);
      } else {
        logger.error('Unknown Error', error);
      }
      throw error;


    }
  }
  async addBlogPost(data: BlogInterface): Promise<BlogInterface> {
    try {
      const { title, category, tags, slug, featured, content, imageUrl } = data;
      const existingBlog = await this.Blog.findOne({ $or: [{ title }, { slug }] });
      if (existingBlog) {
        throw new ResourceConflicts('Blog with similar data already exist🥴')
      }
      const finalImageUrl = imageUrl?.trim() || 'https://archive.org/download/placeholder-image/placeholder-image.jpg';
      const blog = new this.Blog({
        title, category, tags, slug, featured, content, imageUrl: finalImageUrl
      });
      await blog.save();
      return blog;

    } catch (error) {
      if (error instanceof BaseError) {
        logger.error('Error Adding New Blog Post!', error.message);
      } else {
        logger.error('Uknown Error', error)
      }
      throw error;
    }
  }

  async updateBlogs(id: string, data: Partial<BlogInterface>): Promise<BlogInterface | null> {
    try {
      const updatedBlog = await this.Blog.findByIdAndUpdate(id, data, { new: true });
      if (!updatedBlog) {
        throw new NotFoundError('No Blog Post matching the Provided Data.');
      }
      const blogKey = await redisClient.keys('blogs:*');
      await redisClient.del(blogKey);
      return updatedBlog;
    } catch (error) {
      if (error instanceof BaseError) {
        logger.error('Error Updating Blog Post!', error.message);
      } else {
        logger.error('Unknown Error', error);
      }
      throw error;
    }
  }
  async deleteBlogPost(ids: string[]): Promise<void> {
    try {
      await this.Blog.deleteMany({ _id: ids });
      const blogKey = await redisClient.keys('blogs:*');
      await redisClient.del(blogKey);
    } catch (error) {
      if (error instanceof BaseError) {
        logger.error('Error Adding New Blog Post!', error.message);
      } else {
        logger.error('Uknown Error', error)
      }
      throw error;
    }
  }
}



export default BlogService;