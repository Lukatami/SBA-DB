import mongoose from "mongoose";

const deliveryItemSchema = new mongoose.Schema({
  sku: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  subtotal: { type: Number, required: true, min: 0 },
});

const deliverySchema = new mongoose.Schema({});

export default mongoose.model("Delivery", deliverySchema);
