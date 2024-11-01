const express = require('express')
const jwt = require('jsonwebtoken')
const Comment = require('../models/Comments')
const Blog = require('../models/Blog')

const router = express.Router();

const authenticateToken = (req, res, next) =>{
    const token = req.header('Authorization').replace('Bearer ', '');
    if(!token) {
        return res.status(401).json({message: 'No token, Authorization denied'})
    }
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next()
    }
    catch(err){
        res.status(401).json({message: 'Token is not valid'})

    }
};


router.post('/:blogId', authenticateToken, async(req, res) =>{
    const {text} = req.body;

    try{
        const blog = await Blog.findById(req.params.blogId);
        if(!blog){
            return res.status(404).json({message: 'Blog not found'})
        }

        const newComment = new Comment({
            text,
            author: req.user.userId,
            blog: req.params.blogId
        })

        const comment = await newComment.save();
        res.json(comment);
    }
    catch(err){
        res.status(500).json({message: "Server Error"})

    }
})


//Get all comments for a blog

router.get('/:blogId', async(req, res)=> {
    try{

        const comments = await Comment.find({blog: req.params.blogId}).populate('author', 'username')
        res.json({comments})
    }
    catch(err){
        res.status(500).json({message:' Server Error'})
    }
})

router.put('/:id', authenticateToken, async(req, res) =>{
    const {text} = req.body
    try{
        const comment = await Comment.findById(req.params.id)
        if(!comment){
            return res.status('404').json({message: 'Comment not Found'});
        }
    
        if(comment.author.toString() !== req.user.userId){
    
            return res.status('401').json({message: 'Unauthorized user'});
        }

        comment.text = text || comment.text;
        await comment.save();
        res.json(comment);
    } catch(err){
        res.status(500).json({message: 'Server Error'});

    }
})

router.delete('/:id', authenticateToken, async (req, res) => {
    try {
      const comment = await Comment.findById(req.params.id);
      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }
  
      if (comment.author.toString() !== req.user.userId) {
        return res.status(403).json({ message: 'User not authorized' });
      }
  
      await comment.deleteOne();
      res.json({ message: 'Comment removed' });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  

module.exports = router;