const fs = require('fs');
const path = require('path');
const Blog = require('../models/Blog');
const multer = require('multer');

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.resolve(__dirname, `../uploads/${req.user._id}`);
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const fileName = `${Date.now()}-${file.originalname}`;
        cb(null, fileName);
    },
});

const upload = multer({ storage });

const createBlog = async (req, res) => {
    try {
        const { title, body } = req.body;
        let coverImage;

        if (req.file) {
            coverImage = `/uploads/${req.user._id}/${req.file.filename}`;
        } else if (typeof req.body.coverImage === 'string') {
            coverImage = req.body.coverImage;
        } else if (req.body.coverImage && typeof req.body.coverImage.path === 'string') {
            coverImage = req.body.coverImage.path;
        }

        if (!title || !body) {
            return res.status(400).json({
                success: false,
                message: 'Title and body are required',
            });
        }

        const newBlog = new Blog({
            title,
            body,
            coverImage,
            createdBy: req.user._id,
        });

        await newBlog.save();

        return res.status(201).json({
            success: true,
            message: 'Blog created successfully',
            blog: newBlog,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message,
        });
    }
};

module.exports = {
    createBlog,
    upload,
};