const mongoose = require("mongoose");

const statusHistorySchema = new mongoose.Schema(
  {
    previousStatus: {
      type: String,
      enum: [
        "Interested",
        "Applied",
        "Assessment",
        "Shortlisted",
        "Interview Scheduled",
        "Interview Completed",
        "Selected",
        "Rejected",
        "Offer Received",
        "Offer Accepted",
        "Offer Declined",
        "Withdrawn",
        null,
      ],
      default: null,
    },
    newStatus: {
      type: String,
      enum: [
        "Interested",
        "Applied",
        "Assessment",
        "Shortlisted",
        "Interview Scheduled",
        "Interview Completed",
        "Selected",
        "Rejected",
        "Offer Received",
        "Offer Accepted",
        "Offer Declined",
        "Withdrawn",
      ],
      required: true,
    },
    changedDate: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    jobRole: {
      type: String,
      required: [true, "Job role is required"],
      trim: true,
      maxlength: 150,
    },
    jobDescription: {
      type: String,
      trim: true,
      maxlength: 5000,
    },
    jobType: {
      type: String,
      enum: ["Full-time", "Internship", "Contract", "Part-time", "Freelance"],
      default: "Full-time",
    },
    appliedDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    applicationSource: {
      type: String,
      enum: ["Company Website", "Naukri", "LinkedIn", "Indeed", "Referral", "Other"],
      default: "Other",
    },
    salary: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    status: {
      type: String,
      enum: [
        "Interested",
        "Applied",
        "Assessment",
        "Shortlisted",
        "Interview Scheduled",
        "Interview Completed",
        "Selected",
        "Rejected",
        "Offer Received",
        "Offer Accepted",
        "Offer Declined",
        "Withdrawn",
      ],
      default: "Interested",
      index: true,
    },
    interviewDate: Date,
    interviewMode: {
      type: String,
      enum: ["Online", "In-person", "Phone"],
    },
    interviewLocation: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    statusHistory: {
      type: [statusHistorySchema],
      default: [],
    },
  },
  { timestamps: true }
);

applicationSchema.index({ userId: 1, appliedDate: -1 });
applicationSchema.index({ userId: 1, companyId: 1 });
applicationSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model("Application", applicationSchema);
