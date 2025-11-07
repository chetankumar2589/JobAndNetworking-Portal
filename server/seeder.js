require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Job = require('./models/Job');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding.');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

const importData = async () => {
  try {
    await connectDB();
    await User.deleteMany();
    await Job.deleteMany();

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const sampleUsers = [
      { name: 'Vanitha', email: 'vanitha@example.com', password: hashedPassword, bio: 'Full-stack developer with a focus on MERN stack. Passionate about building scalable applications.', skills: ['React', 'Node.js', 'MongoDB', 'Express'] },
      { name: 'Sai Kumar', email: 'saikumar@example.com', password: hashedPassword, bio: 'Backend engineer specializing in Node.js and REST APIs. Experienced with blockchain and Web3.', skills: ['Node.js', 'Express', 'JavaScript', 'Web3', 'Solana'] },
      { name: 'Laxmi', email: 'laxmi@example.com', password: hashedPassword, bio: 'Frontend designer and developer. Skilled in UI/UX design with Tailwind CSS.', skills: ['React', 'Tailwind CSS', 'UI/UX'] },
      { name: 'Paparao', email: 'paparao@example.com', password: hashedPassword, bio: 'Software engineer with experience in cloud technologies and data structures.', skills: ['JavaScript', 'HTML', 'CSS'] },
      { name: 'Kavitha', email: 'kavitha@example.com', password: hashedPassword, bio: 'Junior developer exploring new technologies and frameworks. Eager to learn Web3.', skills: ['React', 'JavaScript'] },
    ];

    const createdUsers = await User.insertMany(sampleUsers);
    const vanitha = createdUsers[0]._id;
    const saikumar = createdUsers[1]._id;
    const laxmi = createdUsers[2]._id;
    const paparao = createdUsers[3]._id;
    const kavitha = createdUsers[4]._id;


    const sampleJobs = [
      { user: vanitha, title: 'React Developer Needed', description: 'Seeking a skilled React developer to build our new front-end.', skills: ['React', 'JavaScript'], budget: '$500', salary: '70000' },
      { user: saikumar, title: 'Backend Node.js Engineer', description: 'Looking for a backend engineer for a scalable API project.', skills: ['Node.js', 'Express', 'MongoDB'], budget: '$1000', salary: '85000' },
      { user: laxmi, title: 'UI/UX Designer', description: 'Need a creative designer to work on our application interface.', skills: ['UI/UX', 'Tailwind CSS'], budget: '$750', salary: '60000' },
      { user: paparao, title: 'Solana Web3 Developer', description: 'Seeking a developer experienced with Solana and Web3.js.', skills: ['Solana', 'Web3'], budget: '$2000', salary: '120000' },
      { user: vanitha, title: 'Full Stack Engineer', description: 'A senior role for a full stack engineer with expertise in MERN stack.', skills: ['React', 'Node.js', 'Express', 'MongoDB'], budget: '$1500', salary: '100000' },
      { user: saikumar, title: 'Junior Frontend Developer', description: 'An entry-level role for a motivated developer to join our team.', skills: ['HTML', 'CSS', 'JavaScript'], budget: '$300', salary: '50000' },
      { user: laxmi, title: 'Senior React Developer', description: 'Looking for a senior developer to lead our React projects.', skills: ['React', 'JavaScript', 'Redux'], budget: '$1200', salary: '95000' },
      { user: paparao, title: 'Express.js API Developer', description: 'Seeking a developer with strong Express.js skills for a microservice.', skills: ['Node.js', 'Express', 'API'], budget: '$800', salary: '75000' },
      { user: vanitha, title: 'CSS & Tailwind Specialist', description: 'A part-time role for a designer skilled in modern CSS frameworks.', skills: ['Tailwind CSS', 'CSS'], budget: '$400', salary: '55000' },
      { user: kavitha, title: 'Blockchain Engineer', description: 'A freelance opportunity for a blockchain engineer for a short-term project.', skills: ['Solana', 'Blockchain'], budget: '$3000', salary: '130000' },
    ];

    await Job.insertMany(sampleJobs);

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

importData();
