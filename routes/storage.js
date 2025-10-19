import express from "express";
import Storage from "../models/Storage.js";

const router = express.Router();

// GET all storage records with item details
router.get("/", async (req, res) => {
  try {
    const storage = await Storage.find({})
      .populate("item", "name sku category unit")
      .sort({ quantity: 1 });
    res.status(200).json(storage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// GET storage by item ID
router.get("/item/:itemId", async (req, res) => {
  try {
    const storage = await Storage.findOne({ item: req.params.itemId }).populate(
      "item",
      "name sku category unit"
    );

    if (!storage) {
      return res
        .status(404)
        .json({ message: "Storage record not found for this item" });
    }
    res.status(200).json(storage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// GET low stock items (quantity below threshold)
router.get("/low-stock", async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 10;
    const lowStock = await Storage.find({ quantity: { $lt: threshold } })
      .populate("item", "name sku category unit")
      .sort({ quantity: 1 });

    res.status(200).json({
      threshold,
      count: lowStock.length,
      items: lowStock,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// GET storage analytics
router.get("/analytics/summary", async (req, res) => {
  try {
    const totalItems = await Storage.countDocuments();
    const totalQuantity = await Storage.aggregate([
      { $group: { _id: null, total: { $sum: "$quantity" } } },
    ]);
    const lowStockCount = await Storage.countDocuments({
      quantity: { $lt: 10 },
    });
    const recentlyUpdated = await Storage.find({})
      .populate("item", "name")
      .sort({ lastUpdated: -1 })
      .limit(5);

    res.status(200).json({
      totalItems,
      totalQuantity: totalItems > 0 ? totalQuantity[0].total : 0,
      lowStockCount,
      recentlyUpdated,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;
