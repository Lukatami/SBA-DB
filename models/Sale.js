import mongoose from "mongoose";
const { Schema } = mongoose;

const saleItemSchema = new Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true,
    validate: {
      validator: async function (itemId) {
        return await mongoose.model("Item").exists({ _id: itemId });
      },
      message: "Item must exist in db",
    },
  },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  subtotal: { type: Number, required: true, min: 0 },
});

const saleSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      validate: {
        validator: async function (userId) {
          const user = await mongoose.model("User").findById(userId);
          return user && ["manager", "admin"].includes(user.role);
        },
        message: "Only users with manager or admin role valid for sale",
      },
    },
    items: {
      type: [saleItemSchema],
      required: true,
      validate: (v) => Array.isArray(v) && v.length > 0,
    },
    total: { type: Number, required: true, min: 0 },
    date: { type: Date, default: Date.now },
    notes: { type: String },
  },
  { timestamps: true }
);

// Pre-save middleware
saleSchema.pre("save", async function (next) {
  // Calculate subtotals for each item
  this.items.forEach((item) => {
    item.subtotal = item.quantity * item.price;
  });
  // Calculate total sale amount
  this.total = this.items.reduce((sum, item) => sum + item.subtotal, 0);

  // Create array of all item ObjectIds
  const itemIds = this.items.map((item) => item.item);
  // Single request to database for all items
  const storageItems = await mongoose
    .model("Storage")
    // Get array of items matching itemIds
    .find({ item: { $in: itemIds } })
    // Get item names
    .populate("item");

  // Convert array to Map
  const storageMap = new Map();
  // Key: item ID as string, Value: stock data with name and quantity
  storageItems.forEach((storage) => {
    storageMap.set(storage.item._id.toString(), {
      // Store quantity
      quantity: storage.quantity,
      // Store name
      name: storage.item.name,
    });
  });

  // Validate stock availability for each item
  for (let item of this.items) {
    const storage = storageMap.get(item.item.toString());
    // Check if item exists in storage
    if (!storage) {
      return next(new Error(`Item not found in storage: ${item.item}`));
    }
    // Check if sufficient quantity available
    if (storage.quantity < item.quantity) {
      return next(
        new Error(
          `Insufficient stock for "${storage.name}". Available: ${storage.quantity}, Requested: ${item.quantity}`
        )
      );
    }
  }

  next();
});

// Post-save middleware if pre-save validation passed
saleSchema.post("save", async function (sale) {
  try {
    // Update Storage for each sale item
    for (let item of sale.items) {
      await mongoose.model("Storage").updateOne(
        { item: item.item },
        {
          // Update quantity
          $inc: { quantity: -item.quantity },
          // Update lastUpdated
          $set: { lastUpdated: new Date() },
        }
      );
    }
  } catch (err) {
    console.error("Failed to update storage after sale", err);
  }
});

// For sales analytics by item
saleSchema.index({ "items.item": 1 });
// For user performance tracking
saleSchema.index({ user: 1, date: -1 });
// For financial reporting
saleSchema.index({ date: -1, total: -1 });

export default mongoose.model("Sale", saleSchema);
