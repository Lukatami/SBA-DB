import express from "express";
import Item from "../models/Item.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const items = await Item.find({});
    // Add Partner Object to response by Partner ObjectID
    // .populate("partner");
    res.status(200).json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, description, price, category, unit, partner } = req.body;

    const newItem = new Item({
      name,
      description,
      price,
      category,
      unit,
      partner,
    });

    const savedItem = await newItem.save();

    res.status(201).json(savedItem);
  } catch (err) {
    console.error(err);
    res
      .status(400)
      .json({ message: "Invalid data or not unique SKU", error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Item.findById(id);

    if (!item) {
      return res.status(404).json({ message: `Item not found` });
    }

    await item.deleteOne();
    res.status(200).json({ message: `Item succsessfully deleted` });
  } catch (err) {
    console.error("Error deleting item:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
