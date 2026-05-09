const fs = require("fs");
const path = require("path");
const Blog = require("../models/Blog");
const multer = require("multer");
const slugify = require("slugify");

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
    const { title, body, category, excerpt } = req.body;
    let coverImage;

    if (req.file) {
      coverImage = `/uploads/${req.user._id}/${req.file.filename}`;
    } else if (typeof req.body.coverImage === "string") {
      coverImage = req.body.coverImage;
    } else if (
      req.body.coverImage &&
      typeof req.body.coverImage.path === "string"
    ) {
      coverImage = req.body.coverImage.path;
    }

    if (!title || !body) {
      return res.status(400).json({
        success: false,
        message: "Title and body are required",
      });
    }

    const slug = slugify(title, {
      lower: true,
      strict: true,
      trim: true,
    });

    const newBlog = new Blog({
      title,
      body,
      category,
      excerpt,
      slug: `${slug}-${Date.now()}`,
      coverImage,
      createdBy: req.user._id,
    });

    await newBlog.save();

    return res.status(201).json({
      success: true,
      message: "Blog created successfully",
      blog: newBlog,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Get all blogs
const getAllBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;
    const filter = {};

    if (req.query.category) {
      filter.category = req.query.category;
    }

    const total = await Blog.countDocuments(filter);
    const blogs = await Blog.find(filter)
      .populate("createdBy", "fullName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const posts = blogs.map((blog) => ({
      ...blog,
      category: blog.category
        ? { _id: blog.category, name: blog.category }
        : null,
      excerpt:
        blog.excerpt ||
        (blog.body ? `${blog.body.substring(0, 120)}...` : ""),
      views: blog.views || 0,
    }));

    return res.status(200).json({
      success: true,
      blogs: posts,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server Internal Error" });
  }
};

// Get Blog by ID
const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id).populate(
      "createdBy",
      "fullName email"
    );

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Blog retrieved successfully",
      blog,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Internal Error",
      error: error.message,
    });
  }
};

const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const blog = await Blog.findOne({ slug }).populate(
      "createdBy",
      "fullName email"
    );

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Blog retrieved successfully",
      blog,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Internal Error",
      error: error.message,
    });
  }
};

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
    return res.status(500).json({
      success: false,
      message: "Server Internal Error",
      error: error.message,
    });
  }
};

// Blog delete functionality
const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    if (blog.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to delete this blog",
      });
    }

    await Blog.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Internal Error",
      error: error.message,
    });
  }
};

// Update the Blog
const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, body, category, excerpt } = req.body;

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not Found",
      });
    }

    if (blog.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to update this blog",
      });
    }

    blog.title = title || blog.title;
    blog.body = body || blog.body;
    blog.category = category || blog.category;
    blog.excerpt = excerpt || blog.excerpt;
    
    await blog.save();

    return res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      blog,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Internal Error",
      error: error.message,
    });
  }
};

// Module Export
module.exports = {
  createBlog,
  upload,
  getAllBlogs,
  getBlogById,
  getBlogBySlug,
  getCategories,
  deleteBlog,
  updateBlog,
};
