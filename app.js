const express = require("express");
const app = express();
const cors = require("cors");

const authRouter = require("./routes/authRoute");
const userRouter = require("./routes/userRoute");
const linkRouter = require("./routes/linkRoute");
const clickRouter = require("./routes/clickRoute");

app.use(cors());
app.use(express.json());

app.use("/api/v1", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/link", linkRouter);
app.use("/api/v1/click", clickRouter);
app.get("/", (__, res) => {
  return res.status(200).json({ message: "this is test page" });
});

module.exports = app;
