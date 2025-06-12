import express from "express";
const app = express();

app.get("/", (req, res) => {
  res.send("Hello from Express!");
});

export default app;
