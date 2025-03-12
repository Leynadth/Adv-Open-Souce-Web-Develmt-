const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
const { ensureAuthenticated } = require("../middleware/auth"); // Import authentication middleware

// Load User model
const AppUsers = require("../models/AppUsers");

// Login Page
router.get("/login", (req, res) => res.render("login"));

// Register Page
router.get("/register", (req, res) => res.render("register"));

// Register Handle
router.post("/register", async (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  // Check required fields
  if (!name || !email || !password || !password2) {
    errors.push({ msg: "Please fill in all fields" });
  }

  // Check passwords match
  if (password !== password2) {
    errors.push({ msg: "Passwords do not match" });
  }

  // Check password length
  if (password.length < 6) {
    errors.push({ msg: "Password must be at least 6 characters" });
  }

  if (errors.length > 0) {
    res.render("register", { errors, name, email, password, password2 });
  } else {
    try {
      let user = await AppUsers.findOne({ email: email });

      if (user) {
        errors.push({ msg: "Email is already registered" });
        res.render("register", { errors, name, email, password, password2 });
      } else {
        const newUser = new AppUsers({ name, email, password });

        // Save User (password will be hashed in AppUsers.js)
        await newUser.save();
        console.log("User registered:", newUser);
        req.flash("success_msg", "You are now registered and can log in");
        res.redirect("/login");
      }
    } catch (err) {
      console.error("Error registering user:", err);
      res.redirect("/register");
    }
  }
});

// Login Handle with Debugging
router.post("/login", async (req, res, next) => {
  passport.authenticate("local", async (err, user, info) => {
    if (err) {
      console.error("Error during authentication:", err);
      return next(err);
    }
    if (!user) {
      console.error("Login failed:", info.message);
      req.flash("error_msg", "Incorrect email or password");
      return res.redirect("/login");
    }

    req.logIn(user, (err) => {
      if (err) {
        console.error("Error logging in:", err);
        return next(err);
      }
      console.log("Login successful:", user);
      return res.redirect("/dashboard");
    });
  })(req, res, next);
});

// Dashboard Route (Protected)
router.get("/dashboard", ensureAuthenticated, async (req, res) => {
  try {
    res.render("dashboard", { user: req.user });
  } catch (err) {
    console.error("Error loading dashboard:", err);
    res.redirect("/login");
  }
});

// Logout Handle
router.get("/logout", (req, res) => {
  req.logout(err => {
    if (err) return next(err);
    req.flash("success_msg", "You are logged out");
    res.redirect("/login");
  });
});

module.exports = router;
