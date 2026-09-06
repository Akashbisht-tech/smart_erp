const mongoose = require("mongoose");

const facultySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    facultyId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      // required: true,
    },

    designation: {
      type: String,
      enum: [
        "professor",
        "associate_professor",
        "assistant_professor",
        "lecturer",
        "hod"
      ],
      required: true,
    },

    qualification: {
      type: String,
      trim: true,
    },

    specialization: {
      type: String,
      trim: true,
    },

    joiningDate: {
      type: Date,
    },

    phone: {
      type: String,
      trim: true,
    },

    officeRoom: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "retired"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Faculty", facultySchema);