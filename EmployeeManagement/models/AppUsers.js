const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const AppUserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"], // Basic email validation
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving user
AppUserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    console.log("Hashing password before saving...");
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log("Hashed password:", this.password);
    next();
  } catch (err) {
    console.error("Error hashing password:", err);
    next(err);
  }
});

const AppUsers = mongoose.model("AppUsers", AppUserSchema);
module.exports = AppUsers;
