const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

// Create a new post
router.post('/', async (req, res) => {
  try {
    const { user, content } = req.body;
    const post = new Post({ user, content });
    await post.save();
    res.status(201).json({ message: 'Post created', post });
  } catch (err) {
    res.status(400).json({ error: 'Failed to create post', details: err.message });
  }
});

// Like/unlike post
router.post('/:postId/like', async (req, res) => {
  const { userId } = req.body;
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const alreadyLiked = post.likes.includes(userId);
    if (alreadyLiked) {
      post.likes.pull(userId); // remove like
    } else {
      post.likes.push(userId); // add like
    }

    await post.save();
    res.json({ message: alreadyLiked ? 'Unliked' : 'Liked', likes: post.likes.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle like', details: err.message });
  }
});

// Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', 'username fullName')
      .populate({
        path: 'comments',
        populate: {
          path: 'user',
          select: 'username fullName'
        }
      })
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch posts', details: err.message });
  }
});

// DELETE a post
router.delete('/:id', async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed', details: err.message });
  }
});

// PUT (update/edit) a post
router.put('/:id', async (req, res) => {
  const { content } = req.body;
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, { content }, { new: true });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Update failed', details: err.message });
  }
});


module.exports = router;
