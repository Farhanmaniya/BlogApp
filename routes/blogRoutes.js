const { Router } = require("express");
const router = Router();
const {
    createBlog, upload,
    getAllBlogs, getBlogById, getBlogBySlug,
    getCategories,
    deleteBlog, updateBlog,
} = require("../controllers/blogController");
const { requireUser } = require("../middleware/authMiddleware");

const uploadMiddleware = (req, res, next) => {
    if (req.is && req.is("multipart/form-data")) {
        return upload.single("coverImage")(req, res, next);
    }
    return next();
};

// ✅ Static routes FIRST — before /:id
router.get("/",           getAllBlogs);
router.get("/categories", getCategories);
router.get("/slug/:slug", getBlogBySlug);

// ✅ Dynamic routes AFTER
router.get("/:id",    getBlogById);
router.post("/create", requireUser("token"), uploadMiddleware, createBlog);
router.put("/:id",    requireUser("token"), updateBlog);
router.delete("/:id", requireUser("token"), deleteBlog);

module.exports = router;