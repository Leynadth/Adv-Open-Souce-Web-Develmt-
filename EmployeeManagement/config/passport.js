const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Load User model
const AppUsers = require("../models/AppUsers");

module.exports = function (passport) {
  passport.use(
    new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
      // Match User
      try {
        const user = await AppUsers.findOne({ email: email });

        if (!user) {
          console.error("Login failed: Email not registered");
          return done(null, false, { message: "That email is not registered" });
        }

        // Debugging: Check entered and stored passwords
        console.log("Entered password:", password);
        console.log("Stored hashed password:", user.password);

        // Match password
        const isMatch = await bcrypt.compare(password, user.password);
        console.log("Password match result:", isMatch);

        if (!isMatch) {
          console.error("Login failed: Incorrect password");
          return done(null, false, { message: "Incorrect password" });
        }

        console.log("Login successful:", user);
        return done(null, user);
      } catch (err) {
        console.error("Error during authentication:", err);
        return done(err);
      }
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await AppUsers.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};
