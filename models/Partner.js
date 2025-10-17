import mongoose from "mongoose";
const { Schema } = mongoose;

const partnerSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    contact: {
      phone: { type: String, match: /^[\+]?[1-9][\d]{0,15}$/ },
      email: {
        type: String,
        match: /^\S+@\S+\.\S+$/,
      },
      person: { type: String },
    },
    address: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

partnerSchema.index({ name: 1 });

export default mongoose.model("Partner", partnerSchema);
