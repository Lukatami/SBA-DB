import mongoose from "mongoose";
import { nanoid } from "nanoid";
const { Schema } = mongoose;

// 1 lb = 16 oz
// 1 gal = 4 qt = 8 pt = 128 fl_oz
// 1 qt = 2 pt = 32 fl_oz
// 1 pt = 16 fl_oz

const itemSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, unique: true, trim: true },
    description: { type: String },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, index: true },
    unit: {
      type: String,
      enum: [
        "lb",
        "oz",
        "gal",
        "qt",
        "pt",
        "fl_oz",
        "pcs",
        "pack",
        "case",
        "bunch",
        "bag",
        "box",
      ],
      required: true,
    },
    pack_size: { type: Number, min: 0 },
    partner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Partner",
      required: true,
    },

    // Future logic of order automation
    //   reorder_min: {},
    //   reorder_qty: {},
    //   lead_time_days: {}
  },
  { timestamps: true }
);

// Middleware for save method
itemSchema.pre("save", async function (next) {
  // First, verify if the PartnerId exists in the database
  // Check if document is new (not yet saved to database)
  if (this.isNew) {
    const existingPartner = await mongoose
      .model("Partner")
      .findById(this.partner);
    // If verification failed return error
    if (!existingPartner) {
      const error = new Error(
        `Partner with ID ${this.partner} not found, first create a new Partner!`
      );
      return next(error);
    }

    // Second, verify if the Item exists in the database
    const existingItem = await mongoose.model("Item").findOne({
      name: this.name,
      partner: this.partner,
    });
    // If verification failed return error
    if (existingItem) {
      const error = new Error(
        `${this.name} already exists for ${this.partner}`
      );
      error.existingItem = existingItem;
      return next(error);
    }

    // Third, protect against manual SKU input
    if (this.sku) {
      const error = new Error("Manual SKU input is disabled");
      return next(error);
    }

    // If verifications passed generate SKU
    this.sku = await generateUniqueSKU();
  }
  next();
});

// Special function generation unique SKU using nanoid
async function generateUniqueSKU() {
  let sku;
  // isUnique false by default
  let isUnique = false;

  // While loop for assigning unique SKU
  while (!isUnique) {
    // Assign (6) random digits/letters
    sku = nanoid(6);
    // Check db for same SKU
    const existingItem = await mongoose.model("Item").findOne({ sku });
    // If SKU not found in db set isUnique as true
    if (!existingItem) {
      isUnique = true;
    }
  }
  return sku;
}

// Block item duplicates
itemSchema.index({ name: 1, partner: 1 }, { unique: true });
// Optimize text search
itemSchema.index({ name: "text", description: "text" });
// Optimize price sorting
itemSchema.index({ price: 1 });
// Optimize searching by partner
itemSchema.index({ partner: 1 });

export default mongoose.model("Item", itemSchema);
