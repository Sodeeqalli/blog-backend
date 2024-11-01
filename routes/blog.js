const express = require('express');
const jwt = require('jsonwebtoken');
const Blog = require('../models/Blog');


const router = express.Router();

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', ''); // Corrected here
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Create a new blog post
router.post('/', authenticateToken, async (req, res) => {
  const { title, blogImage, blogText } = req.body;

  try {
    const newBlog = new Blog({
      title,
      author: req.user.userId,
      blogImage,
      blogText,
    });

    const blog = await newBlog.save();
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message }); // Log the error message
  }
});

// Get all blog posts
router.get('/', async (req, res) => { // Added req parameter
  try {
    const blogs = await Blog.find().populate('author', 'username email');
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message }); // Log the error message
  }
});

// Get a single blog post by ID
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate('author', 'username email');
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message }); // Log the error message
  }
});

// Update a blog post
router.put('/:id', authenticateToken, async (req, res) => {
  const { title, blogImage, blogText } = req.body;

  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    if (blog.author.toString() !== req.user.userId) { // Corrected here
      return res.status(403).json({ message: 'User not authorized' });
    }

    blog.title = title || blog.title;
    blog.blogImage = blogImage || blog.blogImage;
    blog.blogText = blogText || blog.blogText;

    await blog.save();
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message }); // Log the error message
  }
});

// Delete a blog post
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
      const blog = await Blog.findById(req.params.id);
      if (!blog) {
        return res.status(404).json({ message: 'Blog not found' });
      }
  
      if (blog.author.toString() !== req.user.userId) {
        return res.status(403).json({ message: 'User not authorized' });
      }
  
      await blog.deleteOne();
      res.json({ message: 'Blog removed' });
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });
  

// Like a blog post
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id); // Added await
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
  const user = req.user.userId;
    if (blog.likes.includes(user)) {
        blog.likes.pull(user);
    }
    else {
    blog.likes.push(user);
   
    }
    await blog.save();
    res.json(blog);

    
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message }); // Log the error message
  }
});

// Dislike a blog post
router.post('/:id/dislike', authenticateToken, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    const user = req.user.userId
  

    if (blog.dislikes.includes(user)) {
        blog.dislikes.pull(user);
        await blog.save();
        res.json(blog);
    }
    else{
        blog.dislikes.push(user);
        if (blog.likes.includes(user)) {
          blog.likes.pull(user);
      }
    await blog.save();
    res.json(blog);
    }
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message }); // Log the error message
  }
});

module.exports = router;
