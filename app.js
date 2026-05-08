const express = require('express');
const cors = require('cors');
const userRoute = require('./routes/userRoute');
const blogRoute = require('./routes/blogRoutes');
const app = express();
const cookieParser = require('cookie-parser');
const { checkAuth } = require("./middleware/authMiddleware");

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(checkAuth("token")); // Optional auth middleware to populate req.user when token is present

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Blog API!' });
});

app.use('/user', userRoute);
app.use('/blog', blogRoute);
module.exports = app;

