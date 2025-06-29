const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const crypto = require("crypto");
const transporter = require("../utils/nodemailers");
const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require("../validators/userValidator");

const saltRounds = 10;
const generateResetCode = () => {
  return crypto.randomInt(100000, 1000000).toString(); // 6-digit number
};
const login = async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(403).json({ message: "Not authorized" });

    // Generate unique jti for the token
    const jti = crypto.randomBytes(16).toString("hex");
    const token = jwt.sign(
      { email: user.email, id: user._id, jti },
      process.env.JWT_KEY,
      { expiresIn: "90d" }
    );

    // Add new session and enforce 2-device limit
    user.activeSessions.push({ jti });
    user.activeSessions.sort((a, b) => b.createdAt - a.createdAt);
    if (user.activeSessions.length > 2) {
      user.activeSessions = user.activeSessions.slice(0, 2);
    }
    await user.save();

    const { password: _, ...userWithoutPassword } = user.toObject();
    res.status(200).json({ status: "ok", token, user: userWithoutPassword });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
};

const createUser = async (req, res) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });
    req.body.password = await bcrypt.hash(req.body.password, saltRounds);
    const newUser = await User.create(req.body);

    const { password, ...userWithoutPassword } = newUser.toObject();
    return res.status(201).json({
      status: "ok",
      user: userWithoutPassword,
    });
  } catch (err) {
    return res.status(400).json({
      message: `user is not created ${err}`,
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { error } = forgotPasswordSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate and save code
    const resetCode = generateResetCode();
    user.resetPasswordCode = crypto
      .createHash("sha256")
      .update(resetCode)
      .digest("hex");
    user.resetPasswordCodeExpire = Date.now() + 600000; // 10 minutes

    await user.save();

    // Send email with plain text code
    await transporter.sendMail({
      to: user.email,
      subject: "Password Reset Code",
      html: `Your verification code is: <strong>${resetCode}</strong> (valid for 10 minutes)`,
    });

    res.status(200).json({ message: "Verification code sent" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { error } = resetPasswordSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });
    const { email, code, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Verify code
    const hashedCode = crypto.createHash("sha256").update(code).digest("hex");

    if (user.resetPasswordCode !== hashedCode) {
      return res.status(400).json({ message: "Invalid code" });
    }

    if (Date.now() > user.resetPasswordCodeExpire) {
      return res.status(400).json({ message: "Code has expired" });
    }

    // Update password
    user.password = await bcrypt.hash(newPassword, saltRounds);
    user.resetPasswordCode = undefined;
    user.resetPasswordCodeExpire = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { login, createUser, forgotPassword, resetPassword };
