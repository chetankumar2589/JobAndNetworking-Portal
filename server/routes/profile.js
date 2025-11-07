const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Payment = require('../models/Payment');

const router = express.Router();

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'Profile not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.post('/', auth, async (req, res) => {
  const { bio, linkedIn, skills, publicWalletAddress } = req.body;
  const profileFields = {};
  if (bio) {
    profileFields.bio = bio;
    const nlp = require('compromise');
    const doc = nlp(bio);
    const extractedSkills = doc.nouns().out('array').filter(noun => 
      ['react', 'node', 'javascript', 'mongodb', 'solana', 'express', 'tailwind', 'css', 'html'].includes(noun.toLowerCase())
    );
    let allSkills = new Set(extractedSkills);
    if (skills) {
      skills.split(',').map(skill => skill.trim()).forEach(skill => allSkills.add(skill));
    }
    profileFields.skills = [...allSkills];
  } else if (skills) {
    profileFields.skills = skills.split(',').map(skill => skill.trim());
  }
  
  if (linkedIn) profileFields.linkedIn = linkedIn;
  if (publicWalletAddress) profileFields.publicWalletAddress = publicWalletAddress;

  try {
    let user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: profileFields },
      { new: true, runValidators: true }
    );
    if (!user) {
      user = await new User({ _id: req.user.id, ...profileFields }).save();
      return res.json(user);
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// GET /api/profile/payment-history - get payment history for current user
router.get('/payment-history', auth, async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user.id })
      .sort({ date: -1 });
    res.json(payments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
