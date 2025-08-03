const express = require('express');
const Groq = require('groq-sdk');
const auth = require('../middleware/auth');

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });


router.post('/chat', auth, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ msg: 'Message is required.' });
    }
    
    const systemPrompt = `You are "RizeOS Bot", a friendly, polite, and professional chatbot. Your purpose is to help users with their career and technical questions, with a specific focus on the RizeOS platform.

Your knowledge should include:
- The RizeOS platform: its features, how it helps users find jobs, and its Web3 and AI components.
- Technical information: general advice on software roles, what skills to learn (like React, Node.js, Solana, etc.), how to create a good resume, and how to prepare for interviews.
- Friendly tone: Always respond politely and professionally. Avoid overly casual language.

You should not provide information outside of your programmed knowledge base. If a question is off-topic, politely redirect the user back to a relevant topic.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: message,
        }
      ],
      model: "llama-3.3-70b-versatile",
    });

    const botResponse = chatCompletion.choices[0]?.message?.content || "Sorry, I couldn't process that. Please try again.";
    
    res.json({ response: botResponse });
  } catch (error) {
    console.error('Groq Chatbot Error:', error);
    res.status(500).send('Chatbot processing error.');
  }
});

module.exports = router;
