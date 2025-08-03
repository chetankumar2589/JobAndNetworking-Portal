const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const nlp = require('compromise');
const Job = require('../models/Job');
const User = require('../models/User');

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

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
    const skills = nouns.filter(noun => 
      ['react', 'node', 'javascript', 'mongodb', 'solana', 'express', 'tailwind', 'css', 'html', 'groq', 'nlp', 'ai', 'web3'].includes(noun.toLowerCase())
    );
    res.json({ skills });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/ai/match-job
// @desc    Get a match score for a job based on user profile
// @access  Private
router.post('/match-job', async (req, res) => {
    try {
        const { userId, jobId } = req.body;
        const user = await User.findById(userId);
        const job = await Job.findById(jobId);

        if (!user || !job) {
            return res.status(404).json({ msg: 'User or Job not found.' });
        }

        const prompt = `You are a professional HR assistant. Your task is to analyze a candidate's profile and a job description and provide a match score.
        Candidate Profile:
        - Bio: ${user.bio}
        - Skills: ${user.skills.join(', ')}
        Job Description:
        - Title: ${job.title}
        - Description: ${job.description}
        - Required Skills: ${job.skills.join(', ')}
        
        Provide a match score as a number between 0 and 100 in the format: {"matchScore": number}. Do not add any other text.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const geminiResponse = JSON.parse(text);
        
        res.json({ matchScore: geminiResponse.matchScore });
    } catch (error) {
        console.error('Gemini LLM error:', error);
        res.status(500).send('LLM processing error.');
    }
});

module.exports = router;
