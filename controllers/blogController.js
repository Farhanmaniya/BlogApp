const fs       = require("fs");
const path     = require("path");
const Blog     = require("../models/Blog");
const multer   = require("multer");
const slugify  = require("slugify");

// ── Multer config ────────────────────────────────────────────────────────
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.resolve(__dirname, `../uploads/${req.user._id}`);
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({ storage });

// ── Create Blog ──────────────────────────────────────────────────────────
const createBlog = async (req, res) => {
    try {
        const { title, body, category, excerpt } = req.body;
        let coverImage;

        if (req.file) {
            coverImage = `/uploads/${req.user._id}/${req.file.filename}`;
        } else if (typeof req.body.coverImage === "string") {
            coverImage = req.body.coverImage;
        }

        if (!title || !body) {
            return res.status(400).json({ success: false, message: "Title and body are required" });
        }

        const baseSlug = slugify(title, { lower: true, strict: true, trim: true });
        const slug = `${baseSlug}-${Date.now()}`;

        const newBlog = new Blog({
            title, body, category, excerpt, slug, coverImage,
            createdBy: req.user._id,
        });

        await newBlog.save();

        return res.status(201).json({
            success: true,
            message: "Blog created successfully",
            blog: newBlog,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// ── Get All Blogs (with pagination + search + category filter) ───────────
const getAllBlogs = async (req, res) => {
    try {
        const page  = parseInt(req.query.page)  || 1;
        const limit = parseInt(req.query.limit) || 6;
        const skip  = (page - 1) * limit;
        const filter = {};

        // ✅ Category filter
        if (req.query.category) {
            filter.category = req.query.category;
        }

        // ✅ Search filter — searches title and body
        if (req.query.search) {
            filter.$or = [
                { title: { $regex: req.query.search, $options: "i" } },
                { body:  { $regex: req.query.search, $options: "i" } },
            ];
        }

        const total = await Blog.countDocuments(filter);
        const blogs = await Blog.find(filter)
            .populate("createdBy", "fullName email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // Normalize response shape
        const normalizedBlogs = blogs.map((blog) => ({
            ...blog,
            excerpt: blog.excerpt || blog.body.substring(0, 120) + "...",
            views:   blog.views || 0,
        }));

        return res.status(200).json({
            success: true,
            blogs: normalizedBlogs,       // ✅ key is "blogs" not "posts"
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Internal Error" });
    }
};

// ── Get Blog by ID ───────────────────────────────────────────────────────
const getBlogById = async (req, res) => {
    try {
        const { id } = req.params;
        const blog = await Blog.findById(id).populate("createdBy", "fullName email");

        if (!blog) {
            return res.status(404).json({ success: false, message: "Blog not found" });
        }

        // ✅ Increment views every time a post is read
        await Blog.findByIdAndUpdate(id, { $inc: { views: 1 } });

        return res.status(200).json({ success: true, blog });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Internal Error", error: error.message });
    }
};

// ── Get Blog by Slug ─────────────────────────────────────────────────────
const getBlogBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const blog = await Blog.findOne({ slug }).populate("createdBy", "fullName email");

        if (!blog) {
            return res.status(404).json({ success: false, message: "Blog not found" });
        }

        // ✅ Increment views
        await Blog.findByIdAndUpdate(blog._id, { $inc: { views: 1 } });

        return res.status(200).json({ success: true, blog });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Internal Error", error: error.message });
    }
};

// ── Get Categories ───────────────────────────────────────────────────────
const getCategories = async (req, res) => {
    try {
        const categories = await Blog.distinct("category", {
            category: { $exists: true, $ne: "" },
        });

        return res.status(200).json({
            success: true,
            categories: categories.map((name) => ({ _id: name, name })),
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Internal Error" });
    }
};

// ── Delete Blog ──────────────────────────────────────────────────────────
const deleteBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const blog = await Blog.findById(id);

        if (!blog) {
            return res.status(404).json({ success: false, message: "Blog not found" });
        }

        if (blog.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized to delete this blog" });
        }

        // ✅ Also delete cover image file if exists
        if (blog.coverImage) {
            const imgPath = path.resolve(__dirname, `..${blog.coverImage}`);
            if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
        }

        await Blog.findByIdAndDelete(id);

        return res.status(200).json({ success: true, message: "Blog deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Internal Error", error: error.message });
    }
};

// ── Update Blog ──────────────────────────────────────────────────────────
const updateBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, body, category, excerpt } = req.body;

        const blog = await Blog.findById(id);

        if (!blog) {
            return res.status(404).json({ success: false, message: "Blog not found" });
        }

        if (blog.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized to update this blog" });
        }

        // ✅ Regenerate slug if title changes
        if (title && title !== blog.title) {
            blog.title = title;
            blog.slug  = slugify(title, { lower: true, strict: true, trim: true }) + "-" + Date.now();
        }

        blog.body     = body     || blog.body;
        blog.category = category || blog.category;
        blog.excerpt  = excerpt  || blog.excerpt;

        await blog.save();

        return res.status(200).json({ success: true, message: "Blog updated successfully", blog });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Internal Error", error: error.message });
    }
};

module.exports = {
    createBlog, upload,
    getAllBlogs, getBlogById, getBlogBySlug,
    getCategories,
    deleteBlog, updateBlog,
};