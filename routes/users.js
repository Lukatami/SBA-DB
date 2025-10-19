import express from "express";
import User from "../models/User.js";

const router = express.Router();

// GET all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find({}, "username email role");
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// GET user by id
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id, "_id username email role");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { username, email, role } = req.body;

    const newUser = new User({
      username,
      email,
      role,
    });

    const savedUser = await newUser.save();

    res.status(201).json(savedUser);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Invalid data", error: err.message });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    // Store id from req.params
    const { id } = req.params;
    // Store body from req.body
    const updates = req.body;

    // Validation for existing User
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validation for prevent duplicates
    const checkName = updates.username || existingUser.username;
    const checkEmail = updates.email || existingUser.email;

    // Try to find User with the same name and email
    const duplicateUser = await User.findOne({
      // Check all Users for same name or same email
      $or: [
        { username: checkName, _id: { $ne: id } },
        { email: checkEmail, _id: { $ne: id } },
      ],
    });

    // If duplicate validation not passed
    if (duplicateUser) {
      return res.status(400).json({ message: "Same User name already exist" });
    }

    // If all validations passed update document
    const updatedUser = await User.findByIdAndUpdate(id, updates, {
      // Return updated document
      new: true,
      // Use schema validation
      runValidators: true,
    });

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(400).json({ message: "Invalid data", error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.findByIdAndDelete(id);
    res.status(200).json({ message: "User successfully deleted" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
