import mongoose from "mongoose";
const { Schema } = mongoose;

const partnerSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    contact: {
      phone: {
        type: String,
        match: /^[\+]?[0-9\s\-\(\)]{10,}$/,
        required: true,
      },
      email: {
        type: String,
        match: /^\S+@\S+\.\S+$/,
        required: true,
      },
      person: { type: String },
    },
    address: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

// Optimize contact information queries
partnerSchema.index({ "contact.email": 1 });
partnerSchema.index({ "contact.person": 1 });

export default mongoose.model("Partner", partnerSchema);
