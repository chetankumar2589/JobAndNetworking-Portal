const express = require('express');
const auth = require('../middleware/auth');
const Job = require('../models/Job');
const User = require('../models/User'); // Import the User model
const { Connection, PublicKey } = require('@solana/web3.js');

const router = express.Router();

// Load environment variables
require('dotenv').config();

router.post('/', auth, async (req, res) => {
  try {
    const { title, description, skills, budget, salary, txSignature } = req.body;

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
    });

    const job = await newJob.save();
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

module.exports = router;