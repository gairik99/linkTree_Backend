const { mongoose, Schema } = require("mongoose");

const clickSchema = new mongoose.Schema(
  {
    domain: {
      type: String,
      trim: true,
      default: "others",
    },
    category: {
      type: String,
      trim: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    link: {
      type: Schema.Types.ObjectId,
      ref: "Link",
    },
    device: {
      type: {
        type: String,
        enum: ["mobile", "tablet", "desktop", "unknown"],
        default: "unknown",
      },
      browser: {
        name: String,
        version: String,
      },
      os: {
        name: String,
        version: String,
      },
      vendor: String,
    },
    ip: {
      type: String,
      trim: true,
      required: true,
    },
  },
  { timestamps: true }
);

const Click = mongoose.model("Click", clickSchema);
module.exports = Click;
