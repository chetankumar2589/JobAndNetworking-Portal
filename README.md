# ConnectUS: A Next-Generation Job & Networking Portal

ConnectUS is a full-stack web application that combines the best of job portals, professional networking, and modern Web3 technology. Built with React, Node.js, MongoDB, and Solana blockchain integration, ConnectUS offers a seamless platform for job seekers and employers to connect, with intelligent AI-powered job matching and secure blockchain-based payments.

## 🚀 Features

### Authentication & User Management
- **Secure Authentication**: JWT-based authentication system with password hashing
- **User Profiles**: Complete profile management with bio, skills, LinkedIn integration, and wallet address
- **Profile Editing**: Easy-to-use interface for updating profile information
- **AI-Powered Skill Extraction**: Automatically extracts skills from user bio using NLP

### Job Management
- **Job Listings**: Public job feed with comprehensive job details
- **Advanced Search**: Search and filter jobs by title, description, and skills
- **Job Posting**: Secure job posting with Solana blockchain payment integration
- **Deadline Management**: Application deadlines with validation
- **Payment History**: Complete transaction history for posted jobs

### Application System
- **Resume Upload**: Support for PDF, DOC, and DOCX resume uploads
- **Application Tracking**: Track application status (submitted, reviewed, shortlisted, rejected)
- **Duplicate Prevention**: Prevents multiple applications to the same job
- **Application Management**: View applications for posted jobs and track your own applications

### AI-Powered Features
- **Smart Job Matching**: AI-powered algorithm that calculates match scores between user profiles and job requirements
- **Match Score Calculation**: Percentage-based matching using skill overlap and bio analysis
- **AI Chatbot**: Intelligent chatbot powered by Groq API for career guidance and platform assistance
- **Skill Extraction**: Automatic skill detection from job descriptions and user bios

### Web3 Integration
- **Phantom Wallet Integration**: Seamless integration with Phantom wallet
- **Solana Blockchain**: Secure payment processing on Solana devnet
- **Transaction Verification**: Blockchain-verified payments for job postings
- **Payment Tracking**: View all transactions on Solana Explorer

## 🛠️ Tech Stack

### Frontend
- **React.js** - Class Components with React Router
- **Tailwind CSS** - Modern, responsive styling
- **Font Awesome** - Icon library
- **Solana Web3.js** - Blockchain integration

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **Solana Web3.js** - Blockchain integration
- **Groq SDK** - AI chatbot integration
- **Compromise** - NLP for skill extraction

### Database
- **MongoDB Atlas** - Cloud database

### Blockchain
- **Solana Devnet** - Blockchain network
- **Phantom Wallet** - Web3 wallet integration

### AI/ML
- **Groq API** - LLM for chatbot
- **Compromise NLP** - Natural language processing

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14 or higher) and npm
- **MongoDB Atlas account** (or local MongoDB instance)
- **Groq API key** (Get it from [Groq](https://console.groq.com))
- **Phantom Wallet** browser extension
- **Git** (for cloning the repository)

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd JobAndNetworking-Portal
```

### 2. Backend Setup

Navigate to the server directory:

```bash
cd server
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the `server` directory with the following variables:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
GROQ_API_KEY=your_groq_api_key
ADMIN_WALLET_ADDRESS=3m5Y3XZeZ4AGpqLzgTZJUgsMztHtr7ZCR3ZWgkqc9tXT
```

**Environment Variables Explanation:**
- `PORT`: Server port (default: 5000)
- `MONGO_URI`: MongoDB Atlas connection string
- `JWT_SECRET`: Secret key for JWT token signing
- `GROQ_API_KEY`: API key from Groq console
- `ADMIN_WALLET_ADDRESS`: Solana wallet address for receiving payments

Start the backend server:

```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

The backend server will run on `http://localhost:5000`

### 3. Frontend Setup

Open a new terminal and navigate to the client directory:

```bash
cd client
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm start
```

The frontend will run on `http://localhost:3000` and automatically open in your browser.

### 4. Database Setup (Optional)

If you want to seed the database with sample data:

```bash
cd server
node seeder.js
```

This will create sample users and jobs for testing purposes.

## 🚀 How to Start the Application

### Step 1: Start the Backend Server

```bash
cd server
npm install  # If you haven't already
npm run dev
```

Wait for the message: "Server is running on port 5000" and "MongoDB connected successfully!"

### Step 2: Start the Frontend Server

Open a new terminal:

```bash
cd client
npm install  # If you haven't already
npm start
```

The browser will automatically open to `http://localhost:3000`

### Step 3: Set Up Phantom Wallet

1. Install the Phantom wallet extension in your browser
2. Create a new wallet or import an existing one
3. Switch to Solana Devnet in Phantom wallet settings
4. Get some Devnet SOL from a faucet (e.g., [Solana Faucet](https://faucet.solana.com/))

### Step 4: Create an Account

1. Click on "Register" in the navigation bar
2. Fill in your name, email, and password
3. You'll be automatically logged in after registration

### Step 5: Complete Your Profile

1. Go to "My Profile" from the navigation bar
2. Click "Edit Profile"
3. Add your bio, LinkedIn URL, skills, and wallet address
4. Save your profile

### Step 6: Start Using ConnectUS

- **Browse Jobs**: Click on "Jobs" to see all available job listings
- **Apply for Jobs**: Click "Apply" on any job card and upload your resume
- **Post Jobs**: Click "Post a Job" to create a new job listing (requires 0.01 SOL payment)
- **View Applications**: Check applications for your posted jobs
- **Chat with Bot**: Use the chatbot for career guidance and platform assistance

## 📁 Project Structure

```
JobAndNetworking-Portal/
├── server/
│   ├── index.js              # Express server setup
│   ├── middleware/
│   │   └── auth.js           # JWT authentication middleware
│   ├── models/
│   │   ├── User.js           # User model
│   │   ├── Job.js            # Job model
│   │   ├── Application.js    # Application model
│   │   └── Payment.js        # Payment model
│   ├── routes/
│   │   ├── auth.js           # Authentication routes
│   │   ├── profile.js        # Profile routes
│   │   ├── jobs.js           # Job routes
│   │   ├── applications.js   # Application routes
│   │   ├── ai.js             # AI matching routes
│   │   └── chatbot.js        # Chatbot routes
│   ├── uploads/
│   │   └── resumes/          # Resume uploads directory
│   ├── seeder.js             # Database seeder
│   └── package.json          # Backend dependencies
├── client/
│   ├── public/
│   │   └── index.html        # HTML template
│   ├── src/
│   │   ├── App.js            # Main app component
│   │   ├── index.js          # React entry point
│   │   ├── components/
│   │   │   ├── auth/         # Login & Register components
│   │   │   ├── Home/         # Home page
│   │   │   ├── Navbar/       # Navigation bar
│   │   │   ├── Jobs/         # Job listings
│   │   │   ├── JobPost/      # Job posting form
│   │   │   ├── MyProfile/    # Profile view
│   │   │   ├── EditProfile/  # Profile editor
│   │   │   ├── AppliedJobs/  # User's applications
│   │   │   ├── PostedJobs/   # User's posted jobs
│   │   │   ├── ViewApplications/ # Applications for posted jobs
│   │   │   ├── Chatbot/      # AI chatbot
│   │   │   ├── Modal/        # Modal component
│   │   │   ├── ProtectedRoute.js # Route protection
│   │   │   └── withRouter.js # Router HOC
│   │   └── index.css         # Global styles
│   └── package.json          # Frontend dependencies
└── README.md                 # This file
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Profile
- `GET /api/profile/me` - Get current user profile
- `POST /api/profile` - Update user profile
- `GET /api/profile/payment-history` - Get payment history

### Jobs
- `GET /api/jobs` - Get all jobs
- `POST /api/jobs` - Create a new job (requires authentication and payment)
- `GET /api/jobs/my-jobs` - Get user's posted jobs

### Applications
- `POST /api/applications` - Submit job application
- `GET /api/applications/mine` - Get user's applications
- `GET /api/applications/my-jobs` - Get applications for user's jobs
- `GET /api/applications/job/:jobId` - Get applications for a specific job

### AI
- `POST /api/ai/extract-skills` - Extract skills from text
- `POST /api/ai/match-job` - Calculate job match score

### Chatbot
- `POST /api/chatbot/chat` - Send message to AI chatbot

## 🎨 Features in Detail

### Job Matching Algorithm
The AI-powered job matching system calculates a match score (0-100%) based on:
- **Skill Coverage (70%)**: Percentage of job-required skills that match user skills
- **Bio Density (30%)**: Frequency of job skills mentioned in user bio

### Payment System
- Job posting requires a payment of **0.01 SOL** on Solana devnet
- Payments are verified on the blockchain before job creation
- All transactions are logged and can be viewed on Solana Explorer
- Payment history is maintained for each user

### Resume Management
- Supports PDF, DOC, and DOCX file formats
- Resumes are stored securely on the server
- Job owners can view and download applicant resumes
- Unique file naming prevents conflicts

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Protected API routes
- File upload validation
- Blockchain transaction verification
- CORS configuration
- Input validation and sanitization

## 🌐 Deployment

### Backend Deployment
1. Set up environment variables on your hosting platform
2. Ensure MongoDB Atlas is accessible
3. Deploy to platforms like Heroku, Railway, or AWS

### Frontend Deployment
1. Build the production bundle: `npm run build`
2. Deploy the `build` folder to platforms like Vercel, Netlify, or AWS S3

## 📝 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

Developed with ❤️ for connecting talented professionals with great opportunities.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, please open an issue in the GitHub repository.

---

**Note**: This application uses Solana Devnet for blockchain transactions. For production use, you would need to switch to Solana Mainnet and update the wallet addresses accordingly.
