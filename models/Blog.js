const { Schema, model } = require("mongoose");

const blogSchema = new Schema(
  {
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
    views: {
      type: Number,
      default: 0,
    }, // ✅ ADDED
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
  },
  { timestamps: true },
);

module.exports = model("blog", blogSchema);
