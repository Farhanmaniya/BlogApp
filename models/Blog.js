const { Schema, model } = require('mongoose');

const blogSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    body: {
        type: String,
        required: true,
    },
    excerpt: {
        type: String,
        required: false,
    },
    category: {
        type: String,
        required: false,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
    },
    coverImage: {
        type: String,
        required: false,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'user',
    },
    views: {
        type: Number,
        default: 0
    },
}, { timestamps: true });

const Blog = model('blog', blogSchema);

module.exports = Blog;