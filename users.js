const express = require('express');
const router = express.Router();
const User = require('../models/User');

// ✅ Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, fullName, email, password } = req.body;
    const user = new User({ username, fullName, email, password });
    await user.save();
    res.status(201).json({ message: 'User registered successfully!', user });
  } catch (err) {
    res.status(400).json({ error: 'User registration failed', details: err.message });
  }
});

// ✅ Login user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ error: "Invalid password" });

    res.json({ message: "Login successful", user });
  } catch (err) {
    res.status(500).json({ error: "Login failed", details: err.message });
  }
});

// ✅ Follow a user
router.post('/:id/follow', async (req, res) => {
  const { userId } = req.body;
  const targetUserId = req.params.id;

  if (userId === targetUserId) return res.status(400).json({ error: "You can't follow yourself" });

  try {
    const user = await User.findById(userId);
    const targetUser = await User.findById(targetUserId);

    if (!user || !targetUser) return res.status(404).json({ error: "User not found" });

    if (!user.following.includes(targetUserId)) {
      user.following.push(targetUserId);
      targetUser.followers.push(userId);
      await user.save();
      await targetUser.save();
      res.json({ message: "Followed successfully" });
    } else {
      res.json({ message: "Already following" });
    }
  } catch (err) {
    res.status(500).json({ error: "Follow failed", details: err.message });
  }
});

// ✅ Unfollow a user
router.post('/:id/unfollow', async (req, res) => {
  const { userId } = req.body;
  const targetUserId = req.params.id;

  try {
    const user = await User.findById(userId);
    const targetUser = await User.findById(targetUserId);

    if (!user || !targetUser) return res.status(404).json({ error: "User not found" });

    user.following = user.following.filter(id => id != targetUserId);
    targetUser.followers = targetUser.followers.filter(id => id != userId);

    await user.save();
    await targetUser.save();

    res.json({ message: "Unfollowed successfully" });
  } catch (err) {
    res.status(500).json({ error: "Unfollow failed", details: err.message });
  }
});

// ✅ Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Fetch user failed", details: err.message });
  }
});

// ✅ Test route
router.post('/test', (req, res) => {
  res.json({ message: 'POST route working!' });
});

// ✅ Export the router at the end
module.exports = router;
