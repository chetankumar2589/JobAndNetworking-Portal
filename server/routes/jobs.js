const express = require('express');
const auth = require('../middleware/auth');
const Job = require('../models/Job');
const User = require('../models/User');
const Payment = require('../models/Payment');
const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');

const router = express.Router();

// Load environment variables
require('dotenv').config();

router.post('/', auth, async (req, res) => {
  try {
    const { title, description, skills, budget, salary, deadline, txSignature } = req.body;
    
    if (!deadline) {
      return res.status(400).json({ msg: 'Deadline is required' });
    }
    
    const deadlineDate = new Date(deadline);
    if (deadlineDate <= new Date()) {
      return res.status(400).json({ msg: 'Deadline must be in the future' });
    }

    if (!txSignature) {
      return res.status(400).json({ msg: 'Payment transaction signature is required.' });
    }

    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    const confirmedTx = await connection.getParsedTransaction(txSignature, 'confirmed');

    if (!confirmedTx || confirmedTx.meta.err !== null) {
      return res.status(400).json({ msg: 'Payment verification failed.' });
    }

    const adminWallet = process.env.ADMIN_WALLET_ADDRESS;
    if (!adminWallet) {
      console.error('ADMIN_WALLET_ADDRESS is not set in the environment variables.');
      return res.status(500).send('Server configuration error.');
    }

    // A more reliable way to check the recipient
    const instruction = confirmedTx.transaction.message.instructions.find(
        (inst) => inst.programId.toBase58() === '11111111111111111111111111111111' // SystemProgram
    );

    if (!instruction || instruction.parsed.info.destination !== adminWallet) {
        return res.status(400).json({ msg: 'Incorrect recipient for payment.' });
    }

    // Check if the sender is the same as the user who posted the job
    const senderAddress = confirmedTx.transaction.message.accountKeys[0].pubkey.toBase58();
    const user = await User.findById(req.user.id);

    if (!user || senderAddress !== user.publicWalletAddress) {
      return res.status(400).json({ msg: 'Sender wallet does not match authenticated user.' });
    }

    const newJob = new Job({
      user: req.user.id,
      title,
      description,
      skills: Array.isArray(skills) ? skills : skills.split(',').map(skill => skill.trim()),
      budget,
      salary,
      deadline: deadlineDate,
    });

    const job = await newJob.save();

    // Save payment history
    try {
      // Extract payment amount from transaction (0.01 SOL as per JobPost component)
      // Calculate from balance changes or use instruction amount
      let amount = 0.01; // Default amount
      if (instruction && instruction.parsed && instruction.parsed.info && instruction.parsed.info.lamports) {
        amount = instruction.parsed.info.lamports / LAMPORTS_PER_SOL;
      } else {
        // Fallback: calculate from balance difference
        const balanceDiff = confirmedTx.meta.preBalances[0] - confirmedTx.meta.postBalances[0];
        if (balanceDiff > 0) {
          amount = balanceDiff / LAMPORTS_PER_SOL;
        }
      }
      
      await Payment.create({
        user: req.user.id,
        jobTitle: title,
        amount: amount,
        txSignature: txSignature,
      });
    } catch (paymentErr) {
      console.error('Error saving payment:', paymentErr);
      // Don't fail job posting if payment save fails
    }

    res.json({ msg: 'Job posted successfully!', job });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find().sort({ date: -1 });
    res.json(jobs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// GET /api/jobs/my-jobs - get jobs posted by current user
router.get('/my-jobs', auth, async (req, res) => {
  try {
    const jobs = await Job.find({ user: req.user.id }).sort({ date: -1 });
    res.json(jobs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;