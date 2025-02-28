const { mongoose } = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "Provide your name"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Provide your name"],
      trim: true,
    },
    userName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      unique: [true, "Provide your email"],
      required: [true, "Provide your email"],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Provide a password"],
    },
    imageurl: String,
    category: String,
    bio: String,
    bannerColor: String,
    bannerBackground: String,
    buttonAlignment: String,
    buttonStyle: String,
    buttonColor: String,
    buttonFontColor: String,
    theme: String,
    agree: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
