const express = require("express");
const app = express();
const cors = require("cors");

const authRouter = require("./routes/authRoute");
const userRouter = require("./routes/userRoute");

app.use(cors());
app.use(express.json());

app.use("/api/v1", authRouter);
app.use("/api/v1/user", userRouter);
app.get("/", (__, res) => {
  return res.status(200).json({ message: "this is test page" });
});

module.exports = app;
