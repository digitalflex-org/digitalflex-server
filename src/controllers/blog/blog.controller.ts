import { Request, Response, NextFunction } from 'express';
import BlogServiceClass from '../../services/blog/blog.service';
import { BadRequest, NotFoundError } from '../../utils/errors';
import { isValidObjectId } from 'mongoose';
import BlogService from '../../services/blog/blog.service';
import { postBlogValidator } from '../../utils/validators/blog.validator';



class BlogController {
  static async getBlogPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit = '10', page = '1' } = req.query;
      const parsedLimitToNumber = parseInt(limit as string, 10);
      const parsedPageToNumber = parseInt(page as string, 10);
      const blogService = new BlogService();
      const blogposts = await blogService.getBlogPosts(parsedLimitToNumber, parsedPageToNumber);
      if (!blogposts || blogposts.length === 0) {
        throw new NotFoundError('No blog post at the moment');
      }
      res.status(200).json({ success: true, message: 'Blog posts fetched successfully', blogposts });
    } catch (error) {
      next(error);
    }
  }

  static async getBlogPostBySlugOrId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { identifier } = req.query;
      if (!identifier || typeof identifier !== 'string') {
        throw new BadRequest('Missing or invalid identifier');
      }

      const blogService = new BlogService();

      const blogPost = isValidObjectId(identifier)
        ? await blogService.getBlogPostById(identifier)
        : await blogService.getBlogPostBySlug(identifier);

      if (!blogPost) {
        throw new NotFoundError('No Blog with the Provided params found!');
      }

      res.status(200).json({ success: true, message: 'Blog fetched', blogPost });
    } catch (error) {
      next(error);
    }
  }

  static async getFeaturedPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const blogService = new BlogService();
      const featuredPost = await blogService.getFeaturedPosts();
      if (!featuredPost) {
        throw new NotFoundError('No Featured post at the moment!');
      }
      res.status(200).json({ success: true, message: 'featured post fetched successfully', featuredPost });
    } catch (error) {
      next(error);
    }
  }
  static async addBlogPost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { error } = postBlogValidator(req.body);
      if (error) {
        throw new BadRequest(`${error?.details[0].message}`);
      }
      const blogService = new BlogService();
      await blogService.addBlogPost(req.body);
      res.status(200).json({ success: true, message: 'post added successfully 💯' });
      return;

    } catch (error) {
      next(error);

    }
  }

  static async updateBlogPost(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updatedData = req.body;
      const blogService = new BlogService();
      await blogService.updateBlogs(id, updatedData);
      res.status(200).json({ success: true, message: 'blog post updated successfully' })
      return;

    } catch (error) {
      next(error);
    }
  }

  static async deleteBlogPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { ids } = req.body;

      if (!ids || !Array.isArray(ids)) {
        throw new BadRequest(`'parameter's must be a list IDs`);
      }

      const blogService = new BlogService();
      await blogService.deleteBlogPost(ids);

      res.status(200).json({ success: true, message: 'Blog post(s) deleted successfully.' });
    } catch (error) {
      next(error);
    }
  }



}

export default BlogController;
