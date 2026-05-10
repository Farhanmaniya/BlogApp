const express = require("express");
const cors = require("cors");
const path = require("path");
const userRoute = require("./routes/userRoute");
const blogRoute = require("./routes/blogRoutes");
const app = express();
const cookieParser = require("cookie-parser");
const { checkAuth } = require("./middleware/authMiddleware");
const categoryRoute = require("./routes/categoryRoutes");

// Middleware
const allowedOrigins = [
    "https://farhan-blogify.netlify.app",
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "http://127.0.0.1:5501",
    "http://localhost:5501",
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(checkAuth("token")); // Optional auth middleware to populate req.user when token is present
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Serve uploaded files,

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Blog API!" });
});

app.use("/user", userRoute);
app.use("/api/blog", blogRoute);
app.use("/api/posts", blogRoute);
app.use("/api/categories", categoryRoute);

// Temporary — remove after debugging
app._router.stack.forEach(r => {
    if (r.route) console.log(r.route.path);
});

module.exports = app;
