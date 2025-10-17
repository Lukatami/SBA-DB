import mongoose from "mongoose";
const { Schema } = mongoose;

const saleItemSchema = new Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  subtotal: { type: Number, required: true, min: 0 },
});

const saleRecieptSchema = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
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

saleRecieptSchema.pre("save", async function (next) {
  this.items.forEach((item) => {
    item.subtotal = item.quantity * item.price;
  });
  this.total = this.items.reduce((sum, item) => sum + item.subtotal, 0);
  next();
});

saleRecieptSchema.index({ user: 1 });
saleRecieptSchema.index({ date: -1 });

export default mongoose.model("SaleReciept", saleRecieptSchema);
