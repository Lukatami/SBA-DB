import express from "express";
import mongoose from "mongoose";
import "dotenv/config";

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to my API!");
});

app.listen(port, async () => {
  console.log(`Listening on port: http://localhost:${port}`);
});
