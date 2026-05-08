const { Router } = require('express');
const router = Router();
const { createBlog, upload } = require('../controllers/blogController');
const { requireAuth } = require("../middleware/authMiddleware");

const uploadMiddleware = (req, res, next) => {
    if (req.is && req.is('multipart/form-data')) {
        return upload.single('coverImage')(req, res, next);
    }
    return next();
};

router.post('/create', requireAuth("token"), uploadMiddleware, createBlog);

module.exports = router;
