const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    fileUrl: {
      type: String,
      required: true,
    },

    submittedAt: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["submitted", "late", "resubmitted"],
      default: "submitted",
    },

    marks: {
      type: Number,
      min: 0,
    },

    feedback: {
      type: String,
      trim: true,
    },

    gradedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

submissionSchema.index(
  {
    assignmentId: 1,
    studentId: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model("Submission", submissionSchema);