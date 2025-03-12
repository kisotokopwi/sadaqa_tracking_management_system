require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/authRoutes'); // import authRoute model
const db = require('./config/db'); // Database connection

const app = express();



// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({ credentials: true, origin: 'http://localhost:3000' })); // Adjust as needed
app.use(helmet());

// Rate Limiting
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW * 60 * 1000, 
  max: process.env.RATE_LIMIT_MAX, 
  message: 'Too many requests, please try again later.'
});
app.use('/api/auth', limiter);  // Apply to authentication routes

//  Routes
app.use("/api/auth", authRoutes);


// db test 


db.query('SELECT 1')
  .then(() => console.log('✅ Database connection test successful'))
  .catch(err => console.error('❌ Database test failed:', err.message));


// Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
