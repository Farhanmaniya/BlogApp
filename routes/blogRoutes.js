const { Router } = require("express");
const router = Router();
const { createBlog, 
    upload, 
    getAllBlogs, 
    getBlogById,
    getBlogBySlug,
    deleteBlog,
    updateBlog } = require("../controllers/blogController");
const { requireAuth } = require("../middleware/authMiddleware");

const uploadMiddleware = (req, res, next) => {
  if (req.is && req.is("multipart/form-data")) {
    return upload.single("coverImage")(req, res, next);
  }
  return next();
};

router.post("/create", requireAuth("token"), uploadMiddleware, createBlog);
router.get("/slug/:slug", getBlogBySlug);
router.get("/", getAllBlogs);
router.get('/:id', getBlogById);
router.delete('/:id', requireAuth("token"), deleteBlog);
router.put('/:id', requireAuth('token'), updateBlog);


module.exports = router;
