const express = require('express');
const cors = require('cors');
const userRoute = require('./routes/userRoute');
const app = express();
const cookieParser = require('cookie-parser');
const { checkAuth } = require("./middleware/authMiddleware");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(checkAuth("token")); // Middleware to check authentication for protected routes

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Blog API!' });
});

app.use('/user', userRoute);
module.exports = app;

