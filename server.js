const app = require('./app');
const connectDB = require('./config/db');
require('dotenv').config();
const PORT = process.env.PORT || 8000;

// Connect to MongoDB
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    })
});