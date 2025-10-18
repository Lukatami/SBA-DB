import express from "express";
import Partner from "../models/Partner.js";
import Item from "../models/Item.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const partners = await Partner.find({});
    res.status(200).json(partners);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id);
    if (!partner) {
      return res.status(404).json({ message: "Partner not found" });
    }
    res.status(200).json(partner);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, contact, address, notes } = req.body;

    const newPartner = new Partner({
      name,
      contact,
      address,
      notes,
    });

    const savedPartner = await newPartner.save();
    res.status(201).json(savedPartner);
  } catch (err) {
    console.error(err);
    res
      .status(400)
      .json({ message: "Invalid data or not unique name", error: err.message });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    // Store id from req.params
    const { id } = req.params;
    // Store body from req.body
    const updates = req.body;

    // Check name for unique value
    if (updates.name) {
      // Try to find partner with the same name
      const existingPartner = await Partner.findOne({
        name: updates.name,
        // Not include id from request
        _id: { $ne: id },
      });
      // If it's true
      if (existingPartner) {
        return res
          .status(400)
          .json({ message: "Another partner with this name already exist" });
      }
    }

    // If unique name validation passed, try to find requested partnerId
    // 1st: id, 2nd: body, 3rd: options
    const updatedPartner = await Partner.findByIdAndUpdate(id, updates, {
      // Return updated document
      new: true,
      // Use schema validation
      runValidators: true,
    });
    // If partnerId not found
    if (!updatedPartner) {
      return res.status(404).json({ message: "Partner not found" });
    }
    res.status(200).json(updatedPartner);
  } catch (err) {
    console.error("Error updating partner:", err);
    res
      .status(400)
      .json({ message: "Invalid data or not unique name", error: err.message });
  }
});

// Warning! If you delete a partner, you will delete all linked items!
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const partner = await Partner.findById(id);
    if (!partner) {
      return res.status(404).json({ message: `Partner not found` });
    }
    await Item.deleteMany({ partner: id });
    await partner.deleteOne();
    res
      .status(200)
      .json({ message: `Partner and all linked items succsessfully deleted` });
  } catch (err) {
    console.error("Error deleting partner:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
