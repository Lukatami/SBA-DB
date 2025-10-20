import express from "express";
import Delivery from "../models/Delivery.js";
import mongoose from "mongoose";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const deliveries = await Delivery.find({});
    res.status(200).json(deliveries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;
