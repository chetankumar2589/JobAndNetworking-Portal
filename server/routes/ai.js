const express = require('express');
const nlp = require('compromise');
const Job = require('../models/Job');
const User = require('../models/User');

const router = express.Router();

// Skill normalization map for common variations
// This ensures "React", "react", "React.js", "reactjs" all match as "react"
const skillNormalizationMap = {
  // React variations
  'react': 'react',
  'reactjs': 'react',
  'react js': 'react',
  
  // Node.js variations
  'node': 'nodejs',
  'nodejs': 'nodejs',
  'node js': 'nodejs',
  
  // JavaScript variations
  'javascript': 'javascript',
  'js': 'javascript',
  'ecmascript': 'javascript',
  
  // TypeScript variations
  'typescript': 'typescript',
  'ts': 'typescript',
  
  // MongoDB variations
  'mongodb': 'mongodb',
  'mongo': 'mongodb',
  'mongo db': 'mongodb',
  
  // Express variations
  'express': 'express',
  'expressjs': 'express',
  'express js': 'express',
  
  // CSS variations
  'css': 'css',
  'css3': 'css',
  
  // HTML variations
  'html': 'html',
  'html5': 'html',
  
  // Solana variations
  'solana': 'solana',
  
  // Tailwind variations
  'tailwind': 'tailwindcss',
  'tailwind css': 'tailwindcss',
  'tailwindcss': 'tailwindcss',
  
  // Web3 variations
  'web3': 'web3',
  'web 3': 'web3',
  
  // Redux variations
  'redux': 'redux',
  
  // Next.js variations
  'next': 'nextjs',
  'nextjs': 'nextjs',
  'next js': 'nextjs',
  
  // Vue variations
  'vue': 'vue',
  'vuejs': 'vue',
  'vue js': 'vue',
  
  // Angular variations
  'angular': 'angular',
  'angularjs': 'angular',
  
  // Python variations
  'python': 'python',
  'python3': 'python',
  
  // Java variations
  'java': 'java',
  
  // PHP variations
  'php': 'php',
  
  // SQL variations
  'sql': 'sql',
  'mysql': 'mysql',
  'postgresql': 'postgresql',
  'postgres': 'postgresql',
  
  // Git variations
  'git': 'git',
  
  // Docker variations
  'docker': 'docker',
  
  // AWS variations
  'aws': 'aws',
  
  // UI/UX variations
  'ui': 'ui',
  'ux': 'ux',
  'ui ux': 'ui',
};

/**
 * Normalize a skill string to a standard format for accurate matching
 * Handles variations like "React", "react", "React.js", "reactjs" → "react"
 * @param {string} skill - The skill string to normalize
 * @returns {string} - Normalized skill string
 */
function normalizeSkill(skill) {
  if (!skill || typeof skill !== 'string') return '';
  
  // Convert to lowercase and trim
  let normalized = skill.toLowerCase().trim();
  
  // Remove special characters (dots, slashes, etc.) but keep spaces and hyphens
  normalized = normalized.replace(/[^\w\s-]/g, '');
  
  // Normalize spaces: replace multiple spaces with single space
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  // Check direct mapping first
  if (skillNormalizationMap[normalized]) {
    return skillNormalizationMap[normalized];
  }
  
  // Generate variations to check (handle common patterns)
  const variations = [
    normalized,                                    // Original
    normalized.replace(/\.js$/, ''),               // Remove ".js" suffix
    normalized.replace(/js$/, ''),                 // Remove "js" suffix
    normalized.replace(/\s+js$/, ''),              // Remove " js" suffix
    normalized.replace(/\./g, ''),                 // Remove all dots
    normalized.replace(/\s+/g, ''),                // Remove all spaces
    normalized.replace(/-/g, ''),                  // Remove all hyphens
    normalized.replace(/\./g, '').replace(/\s+/g, ''), // Remove dots and spaces
  ];
  
  // Check each variation against the map
  for (const variation of variations) {
    if (variation && skillNormalizationMap[variation]) {
      return skillNormalizationMap[variation];
    }
  }
  
  // If no mapping found, return the cleaned normalized version
  // This allows exact matching for skills not in our map
  return normalized;
}

/**
 * Normalize an array of skills
 * @param {Array} skills - Array of skill strings
 * @returns {Array} - Array of normalized skill strings (unique)
 */
function normalizeSkills(skills) {
  if (!Array.isArray(skills)) {
    return [];
  }
  
  const normalized = skills
    .filter(skill => skill && typeof skill === 'string')
    .map(skill => normalizeSkill(skill))
    .filter(skill => skill.length > 0);
  
  // Return unique skills
  return [...new Set(normalized)];
}

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
// @desc    Compute an accurate match score based on exact skill matching
// @access  Private
router.post('/match-job', async (req, res) => {
  try {
    const { userId, jobId } = req.body;
    const user = await User.findById(userId);
    const job = await Job.findById(jobId);

    if (!user || !job) {
      return res.status(404).json({ msg: 'User or Job not found.' });
    }

    // Get user's explicit skills from profile (only use skills array, not bio extraction)
    const userSkills = Array.isArray(user.skills) ? user.skills : [];
    
    // Get job's required skills
    const jobSkills = Array.isArray(job.skills) ? job.skills : [];

    // If job has no skills, return 0
    if (jobSkills.length === 0) {
      return res.json({ matchScore: 0 });
    }

    // If user has no skills, return 0
    if (userSkills.length === 0) {
      return res.json({ matchScore: 0 });
    }

    // Normalize both skill arrays
    const normalizedUserSkills = normalizeSkills(userSkills);
    const normalizedJobSkills = normalizeSkills(jobSkills);

    // Create a Set for fast lookup
    const userSkillSet = new Set(normalizedUserSkills);

    // Find exact matches
    const matchedSkills = normalizedJobSkills.filter(jobSkill => 
      userSkillSet.has(jobSkill)
    );

    // Calculate match percentage: (matched skills / total job skills) * 100
    const matchScore = Math.round((matchedSkills.length / normalizedJobSkills.length) * 100);

    // Ensure score is between 0 and 100
    const finalScore = Math.max(0, Math.min(100, matchScore));

    res.json({ matchScore: finalScore });
  } catch (error) {
    console.error('Skill match error:', error);
    res.status(500).send('Skill matching error.');
  }
});

module.exports = router;
