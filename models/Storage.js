import mongoose from "mongoose";
const { Schema } = mongoose;

const storageSchema = new Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
      unique: true,
    },
    quantity: { type: Number, required: true, min: 0, default: 0 },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

storageSchema.pre("save", async function (next) {
  this.lastUpdated = new Date();
  next();
});

// Optimize item searching
storageSchema.index({ item: 1 });
// Optimize latest updates
storageSchema.index({ lastUpdated: -1 });
// Optimize searching low-stock
storageSchema.index({ quantity: 1 });

export default mongoose.model("Storage", storageSchema);
