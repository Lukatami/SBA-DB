import mongoose from "mongoose";
const { Schema } = mongoose;

const partnerSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    contact: {
      phone: { type: String, match: /^(\+0?1\s)?\(?[A-Z0-9]{3}\)?[\s.-][A-Z0-9]{3}[\s.-][A-Z0-9]{4}$/ },
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

export default mongoose.model("Partner", partnerSchema);
