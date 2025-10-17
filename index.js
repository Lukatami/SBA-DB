import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import itemsRouter from "./routes/items.js";
import partnersRouter from "./routes/partners.js";

const app = express();
const port = process.env.PORT || 5000;
const connectionString = process.env.ATLAS_URI;

app.use(express.json());

app.use("/items", itemsRouter);
app.use("/partners", partnersRouter);

mongoose
  .connect(connectionString)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(port, async () => {
      console.log(`Listening on port: http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("Connection error:", err);
  });
