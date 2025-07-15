const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Post = require('../models/Post');

// Add a comment to a post
router.post('/', async (req, res) => {
  try {
    const { user, post, text } = req.body;

    const comment = new Comment({ user, post, text });
    await comment.save();

    // Also push comment into post.comments array
    await Post.findByIdAndUpdate(post, {
      $push: { comments: comment._id }
    });

    res.status(201).json({ message: 'Comment added', comment });
  } catch (err) {
    res.status(400).json({ error: 'Failed to add comment', details: err.message });
  }
});

module.exports = router;
