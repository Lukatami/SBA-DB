import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

import logger from "./middleware/logger.js";

dotenv.config();

import itemsRouter from "./routes/items.js";
import partnersRouter from "./routes/partners.js";
import usersRouter from "./routes/users.js";
import storageRouter from "./routes/storage.js";

const app = express();
app.use(express.json());

const port = process.env.PORT || 5000;
const connectionString = process.env.ATLAS_URI;

app.use(logger);

app.use("/api/items", itemsRouter);
app.use("/api/partners", partnersRouter);
app.use("/api/users", usersRouter);
app.use("/api/storage", storageRouter);

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
