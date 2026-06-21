const mongoose = require("mongoose");

const GallerySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    imageUrl: { type: String, required: true },
    caption: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Gallery", GallerySchema);