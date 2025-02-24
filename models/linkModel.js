const { mongoose, Schema } = require("mongoose");

const linkSchema = new mongoose.Schema(
  {
    linkTitle: {
      type: String,
      required: [true, "Provide a title"],
      trim: true,
    },
    linkUrl: {
      type: String,
      required: [true, "Provide a URL"],
      trim: true,
    },
    domain: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Provide a category"],
      trim: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Link = mongoose.model("Link", linkSchema);
module.exports = Link;
