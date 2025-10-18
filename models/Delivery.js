import mongoose from "mongoose";

// Subschema for deliveryItem
const deliveryItemSchema = new mongoose.Schema({
  // SKU must exist in db
  sku: {
    type: String,
    required: true,
    validate: {
      validator: async function (sku) {
        return await mongoose.model("Item").exists({ sku });
      },
      message: "SKU must exist in the database",
    },
  },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  subtotal: { type: Number, required: true, min: 0 },
});

// Main deliverySchema
const deliverySchema = new mongoose.Schema(
  {
    // Partner ObjectId must exist in db
    partner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Partner",
      required: true,
      validate: {
        validator: async function (partnerId) {
          return await mongoose.model("Partner").exists({ _id: partnerId });
        },
        message: "Partner must exist in the database",
      },
    },
    // Delivery Items must be more than 0
    items: {
      type: [deliveryItemSchema],
      required: true,
      validate: [
        (arr) => arr.length > 0,
        "Delivery must include at least one item",
      ],
    },
    totalAmount: { type: Number, required: true, min: 0 },
    deliveryDate: { type: Date, default: Date.now },
    // Receiving user must exist and have roles manager or admin
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      validate: {
        validator: async function (userId) {
          const user = await mongoose.model("User").findById(userId);
          return user && ["manager", "admin"].includes(user.role);
        },
        message: "Only users with manager or admin role can receive deliveries",
      },
    },
    // Ordered user must exist and have roles manager or admin
    orderedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      validate: {
        validator: async function (userId) {
          const user = await mongoose.model("User").findById(userId);
          return user && ["manager", "admin"].includes(user.role);
        },
        message: "Only users with manager or admin role can order deliveries",
      },
    },
  },
  { timestamps: true }
);

// Automatic calculation subtotal
deliveryItemSchema.pre("validate", function (next) {
  this.subtotal = this.quantity * this.unitPrice;
  next();
});

// Automatic calculation totalAmount
deliverySchema.pre("validate", function (next) {
  this.totalAmount = this.items.reduce(
    (total, item) => total + item.subtotal,
    0
  );
  next();
});

deliverySchema.post("save", async function (delivery) {
  // Process each item in delivery
  for (let item of delivery.items) {
    // Find item in database by SKU
    const itemDoc = await mongoose.model("Item").findOne({ sku: item.sku });
    // If item exists
    if (itemDoc) {
      await mongoose.model("Storage").updateOne(
        // Find storage record by item ID
        { item: itemDoc._id },
        {
          // Increment quantity
          $inc: { quantity: item.quantity },
          // Update lastUpdated Date
          $set: { lastUpdated: new Date() },
        },
        // Create if doesn't exist
        { upsert: true }
      );
    }
  }
});

// Optimize recent deliveries
deliverySchema.index({ deliveryDate: -1 });
// Optimize financial reports
deliverySchema.index({ totalAmount: -1 });

export default mongoose.model("Delivery", deliverySchema);
