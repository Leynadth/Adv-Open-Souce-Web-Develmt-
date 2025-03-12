const mongoose = require("mongoose");

const EmployeeSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "First name is required"],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, "Last name is required"],
    trim: true,
  },
  department: {
    type: String,
    required: [true, "Department is required"],
    enum: ["Engineering", "HR", "IT"],
  },
  startDate: {
    type: Date,
    required: [true, "Start date is required"],
  },
  jobTitle: {
    type: String,
    required: [true, "Job title is required"],
    trim: true,
  },
  salary: {
    type: Number,
    required: [true, "Salary is required"],
    min: [0, "Salary must be a positive number"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Employee = mongoose.model("Employee", EmployeeSchema);
module.exports = Employee;
