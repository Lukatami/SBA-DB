import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

import logger from "./middleware/logger.js";

dotenv.config();

import itemsRouter from "./routes/items.js";
import partnersRouter from "./routes/partners.js";
import usersRouter from "./routes/users.js";
import storageRouter from "./routes/storage.js";
import salesRouter from "./routes/sales.js";
import deliveriesRouter from "./routes/deliveries.js";

const app = express();
app.use(express.json());

const port = process.env.PORT || 5000;

app.use(logger);

app.use("/api/items", itemsRouter);
app.use("/api/partners", partnersRouter);
app.use("/api/users", usersRouter);
app.use("/api/storage", storageRouter);
app.use("/api/sales", salesRouter);
app.use("/api/deliveries", deliveriesRouter);

mongoose
  .connect(process.env.ATLAS_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(port, async () => {
      console.log(`Listening on port: http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("Connection error:", err);
  });
