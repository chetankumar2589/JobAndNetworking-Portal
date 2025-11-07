const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const auth = require('../middleware/auth');
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', 'uploads', 'resumes');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || '.pdf';
    const safeBase = (req.user?.id || 'anon') + '-' + Date.now();
    cb(null, `${safeBase}${ext}`);
  }
});

const upload = multer({ storage });

// POST /api/applications - apply to a job
router.post('/', auth, upload.single('resume'), async (req, res) => {
  try {
    const { jobId, contactEmail, contactPhone } = req.body;
    if (!jobId) {
      return res.status(400).json({ msg: 'jobId is required' });
    }
    if (!req.file) {
      return res.status(400).json({ msg: 'Resume file is required' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }

    // Check if deadline has passed
    if (job.deadline && new Date(job.deadline) < new Date()) {
      return res.status(400).json({ msg: 'The deadline for this job has passed. You cannot apply anymore.' });
    }

    const applicant = await User.findById(req.user.id);
    if (!applicant) {
      return res.status(404).json({ msg: 'Applicant not found' });
    }

    // Prevent duplicate applications by the same user to the same job
    const existing = await Application.findOne({ job: job._id, applicant: applicant._id });
    if (existing) {
      return res.status(400).json({ msg: 'You have already applied to this job.' });
    }

    const ownerId = job.user;
    const resolvedEmail = contactEmail || applicant.email;
    if (!resolvedEmail) {
      return res.status(400).json({ msg: 'Contact email is required' });
    }

    const publicPath = `/uploads/resumes/${req.file.filename}`;

    const application = await Application.create({
      job: job._id,
      applicant: applicant._id,
      owner: ownerId,
      contactEmail: resolvedEmail,
      contactPhone: contactPhone || applicant.phone || '',
      resumeUrl: publicPath,
    });

    res.json({ msg: 'Application submitted', application });
  } catch (err) {
    console.error('Apply error:', err);
    res.status(500).send('Server error');
  }
});

// GET /api/applications/job/:jobId - list applicants for a job (job owner only)
router.get('/job/:jobId', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }
    if (String(job.user) !== String(req.user.id)) {
      return res.status(403).json({ msg: 'Not authorized to view applications for this job' });
    }

    const applications = await Application.find({ job: job._id })
      .populate('applicant', 'name email linkedIn skills publicWalletAddress createdAt');

    res.json(applications);
  } catch (err) {
    console.error('List applicants error:', err);
    res.status(500).send('Server error');
  }
});

// GET /api/applications/mine - list applications by current user
router.get('/mine', auth, async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user.id })
      .populate('job', 'title description skills date');
    res.json(applications);
  } catch (err) {
    console.error('My applications error:', err);
    res.status(500).send('Server error');
  }
});

// GET /api/applications/my-jobs - list all applications for jobs posted by current user
router.get('/my-jobs', auth, async (req, res) => {
  try {
    const myJobs = await Job.find({ user: req.user.id }).select('_id');
    const jobIds = myJobs.map(job => job._id);
    
    const applications = await Application.find({ owner: req.user.id })
      .populate('job', 'title description skills date')
      .populate('applicant', 'name email phone linkedIn skills publicWalletAddress createdAt')
      .sort({ createdAt: -1 });
    
    res.json(applications);
  } catch (err) {
    console.error('My jobs applications error:', err);
    res.status(500).send('Server error');
  }
});

module.exports = router;


