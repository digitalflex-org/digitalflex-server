import express from 'express';
import BlogController from './blog.controller';

const router = express.Router();

router.get('', BlogController.getBlogPosts);
router.post('/add-blog', BlogController.addBlogPost);
router.get('/blog', BlogController.getBlogPostBySlugOrId);
router.get('/featured', BlogController.getFeaturedPosts);
router.put('/update-blog/:id', BlogController.updateBlogPost);
router.delete('/blog', BlogController.deleteBlogPosts);


export default router;