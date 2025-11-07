RizeOS: A Next-Generation Job & Networking Portal
-
This is a full-stack web application inspired by platforms like LinkedIn and Upwork, with a unique blend of Web3, AI, and modern web technologies.

Features
-
Task 1: Full-Stack Product Development
-
Module 1: Authentication & Profile Management
-
User Authentication: Secure registration and login using JSON Web Tokens (JWT) for session management.

Profile Management: A dedicated "My Profile" page to view user data and a separate "Edit Profile" page to update information such as bio, skills, and linked accounts.

Module 2: Job Posting & Feed
-
Job Listings: A public feed that displays all job postings.

Search & Filtering: A dynamic search bar that allows users to filter jobs by title, description, and skills.

Job Posting: A protected page for authenticated users to post new job listings.

Module 3: Blockchain Payment Integration
-
Phantom Wallet: Seamless integration with the Phantom wallet for secure transactions.

Solana Devnet: A platform fee of 0.01 SOL is required to post a job, demonstrating a clear monetization model. The transaction is verified on the Solana Devnet.

Payment Logging: Implemented the optional feature to log all successful payments on the backend for audit purposes.

Module 4: AI Enhancements
-
Job Matching: A backend endpoint calculate a "match score" between a user's profile and a job listing. This provides an intelligent, data-driven experience.

AI Chatbot: A separate chatbot feature, powered by Groq, provides a friendly, knowledgeable assistant to answer questions about the platform and the tech industry.


Tech Stack
-
Frontend: React.js (Class Components), React Router, Tailwind CSS, Font Awesome

Backend: Node.js, Express.js

Database: MongoDB Atlas

Web3: Solana Web3.js

AI/LLM: Groq API, NLP

Setup and Installation
-
Prerequisites
-
Node.js and npm

MongoDB Atlas account

Groq API key

Phantom wallet with Devnet SOL

Backend Setup (server directory)
-
npm install

Create a .env file with your API keys and connection strings.

npm run dev

Frontend Setup (client directory)
-
npm install

npm start

Once you've added this README.md to your repository and pushed the changes, the project will be fully complete and ready for deployment and presentation.
