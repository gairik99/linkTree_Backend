const express = require("express");
const app = express();
const cors = require("cors");

const authRouter = require("./routes/authRoute");

app.use(cors());
app.use(express.json());

app.use("/api/v1", authRouter);
app.get("/", (__, res) => {
  return res.status(200).json({ message: "this is test page" });
});

module.exports = app;
