const mongoose = require("mongoose");
const districts = require("../constants/districts");

const companySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      maxlength: 100,
    },
    district: {
      type: String,
      required: [true, "District is required"],
      enum: districts,
      trim: true,
      index: true,
      maxlength: 50,
    },
    address: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    additionalAddress: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    website: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    contactPerson: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    contactNumber: {
      type: String,
      trim: true,
      maxlength: 20,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 100,
    },
    companyType: {
      type: String,
      enum: ["Product", "Service", "Consulting", "Startup", "MNC", "Other"],
      default: "Other",
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: userId + district for efficient district-wise queries
companySchema.index({ userId: 1, district: 1 });
// Compound index: userId + name for duplicate detection
companySchema.index({ userId: 1, name: 1 });

module.exports = mongoose.model("Company", companySchema);