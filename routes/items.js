import express from "express";
import Item from "../models/Item.js";
import mongoose from "mongoose";

const router = express.Router();

// GET all items
router.get("/", async (req, res) => {
  try {
    const items = await Item.find({})
      // Replace ObjectId Partner with its name in the output
      .populate("partner", "name")
      .sort({ name: 1 });
    res.status(200).json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// GET item by id
router.get("/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate("partner", "name");
    // Existing validation
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.status(200).json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// GET item by SKU
router.get("/sku/:sku", async (req, res) => {
  try {
    const { sku } = req.params;
    const item = await Item.findOne({ sku }).populate("partner", "name"); // Replace ObjectId Partner with its name in the output
    // Existing validation
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.status(200).json(item);
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
      pack_size,
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

router.patch("/:id", async (req, res) => {
  try {
    // Store id from req.params
    const { id } = req.params;
    // Store body from req.body
    const updates = req.body;

    // Validation for SKU in body - not allowed to modify
    if (updates.sku) {
      return res.status(400).json({ message: "SKU can't be modified" });
    }

    // Validation for existing Item
    const existingItem = await Item.findById(id);
    if (!existingItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Validstion for existing Partner
    if (updates.partner) {
      const existingPartner = await mongoose
        .model("Partner")
        .exists({ _id: updates.partner });
      if (!existingPartner) {
        return res.status(404).json({ message: "Partner not found" });
      }
    }

    // Validation for prevent duplicates
    const checkName = updates.name || existingItem.name;
    const checkPartner = updates.partner || existingItem.partner;

    // Try to find Items with the same key fields
    const duplicateItem = await Item.findOne({
      // Check all items for name and partner combination
      name: checkName,
      partner: checkPartner,
      // Not include current id
      _id: { $ne: id },
    });

    // If duplicate validation not passed
    if (duplicateItem) {
      return res
        .status(400)
        .json({ message: "Same Item name already exist with same Partner" });
    }

    // If all validations passed update document
    const updatedItem = await Item.findByIdAndUpdate(id, updates, {
      // Return updated document
      new: true,
      // Use schema validation
      runValidators: true,
    });

    res.status(200).json(updatedItem);
  } catch (err) {
    console.error("Error updating item:", err);
    res.status(400).json({ message: "Invalid data", error: err.message });
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
