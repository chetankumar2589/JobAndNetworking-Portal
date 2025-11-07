const express = require('express');
const nlp = require('compromise');
const Job = require('../models/Job');
const User = require('../models/User');

const router = express.Router();

// @route   POST /api/ai/extract-skills
// @desc    Extract skills from text input (using compromise for simplicity)
// @access  Public
router.post('/extract-skills', (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ msg: 'No text provided' });
    }
    const doc = nlp(text);
    const nouns = doc.nouns().out('array');
    const allowed = [
      'react','node','javascript','typescript','mongodb','solana','express','tailwind','css','html','groq','nlp','ai','web3','redux','nextjs','vite'
    ];
    const skills = nouns
      .map(s => String(s).toLowerCase().trim())
      .filter(Boolean)
      .filter((noun) => allowed.includes(noun));
    res.json({ skills: Array.from(new Set(skills)) });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/ai/match-job
// @desc    Compute a match score for a job based on user profile using simple NLP overlap (no LLM)
// @access  Private
router.post('/match-job', async (req, res) => {
  try {
    const { userId, jobId } = req.body;
    const user = await User.findById(userId);
    const job = await Job.findById(jobId);

    if (!user || !job) {
      return res.status(404).json({ msg: 'User or Job not found.' });
    }

    // Collect user signals: explicit skills + skills extracted from bio
    const userExplicitSkills = Array.isArray(user.skills) ? user.skills : [];
    const userBioText = [user.bio || ''].join(' ');
    const userBioDoc = nlp(userBioText);
    const userBioNouns = userBioDoc.nouns().out('array').map(s => String(s).toLowerCase().trim());

    // Normalize job skills (strings or comma-separated strings already stored)
    const jobSkills = Array.isArray(job.skills) ? job.skills : [];

    const normalize = (arr) => arr
      .filter(Boolean)
      .map(s => String(s).toLowerCase().trim())
      .filter(Boolean);

    const userSkillSet = new Set(normalize([...userExplicitSkills, ...userBioNouns]));
    const jobSkillList = normalize(jobSkills);

    if (jobSkillList.length === 0) {
      return res.json({ matchScore: 0 });
    }

    const matches = jobSkillList.filter(s => userSkillSet.has(s));

    // Score: 70% based on coverage of required skills, 30% based on density in bio
    const coverage = matches.length / jobSkillList.length; // 0..1

    const bioDensity = (() => {
      if (!userBioText) return 0;
      const bioSet = new Set(userBioNouns);
      const bioMatches = jobSkillList.filter(s => bioSet.has(s));
      return bioMatches.length / jobSkillList.length;
    })();

    const score = Math.round((coverage * 0.7 + bioDensity * 0.3) * 100);

    res.json({ matchScore: Math.max(0, Math.min(100, score)) });
  } catch (error) {
    console.error('Skill match error:', error);
    res.status(500).send('Skill matching error.');
  }
});

module.exports = router;
