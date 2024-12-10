const express = require('express');
const session = require('express-session');
const app = express();

const database = require('./config/database');

const courseRoutes = require('./routes/Courses');
const semesterRoutes = require('./routes/Semesters');
const userRoutes = require('./routes/User');
const adminRoutes = require('./routes/Admin');

require('dotenv').config();

const cors = require('cors');
app.use(cors()); // Enable CORS

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/course', courseRoutes);
app.use('/api/semester', semesterRoutes);
app.use('/api/auth', userRoutes);
app.use('/api/admin', adminRoutes);

// Middleware
app.use(session({ secret: 'your_secret_key', resave: false, saveUninitialized: true }));

database.dbConnect();

app.get("/", (req,res) => {
    return res.json({
        success: true,
        message: "Boooooooooom, your server is started"
    })
})

app.listen(4000 , () => {
    // console.log(`App is running at 4000`);
})