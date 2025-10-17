import mongoose from "mongoose";
import { nanoid } from "nanoid";
const { Schema } = mongoose;

const itemSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, unique: true, trim: true },
    description: { type: String },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, index: true },
    unit: {
      type: String,
      enum: ["lb", "oz", "kg", "gr", "pcs", "pack", "l", "ml"],
    },
    pack_size: { type: Number, min: 0 },
    partner: { type: mongoose.Schema.Types.ObjectId, ref: "Partner" },

    // Future logic of order automation
    //   reorder_min: {},
    //   reorder_qty: {},
    //   lead_time_days: {}
  },
  { timestamps: true }
);

//
itemSchema.pre("save", async function (next) {
  if (this.isNew && !this.sku) {
    this.sku = await generateUniqueSKU();
  }
  next();
});

async function generateUniqueSKU() {
  let sku;
  let isUnique = false;

  while (!isUnique) {
    sku = nanoid(10);
    const existingItem = await mongoose.model("Item").findOne({ sku });
    if (!existingItem) {
      isUnique = true;
    }
  }
  return sku;
}

itemSchema.index({ sku: 1 });
itemSchema.index({ name: "text", description: "text" });

export default mongoose.model("Item", itemSchema);
