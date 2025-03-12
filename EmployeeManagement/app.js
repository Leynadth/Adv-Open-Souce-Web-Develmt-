const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const exphbs = require("express-handlebars");
require("dotenv").config();

// Initialize Express
const app = express();

// Database Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Passport Config
require("./config/passport")(passport);

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(methodOverride("_method"));

// Express session
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  })
);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Flash Messages
app.use(flash());

// Global Variables for Flash Messages
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

// Set Handlebars with Helpers
app.engine(
  "handlebars",
  exphbs.engine({
    defaultLayout: "main",
    partialsDir: "views/partials/",
    helpers: {
      formatDate: function (date) {
        return new Date(date).toISOString().split("T")[0]; // Formats YYYY-MM-DD
      },
      eq: function (a, b) {
        return a === b;
      },
    },
  })
);
app.set("view engine", "handlebars");

// Static Folder
app.use(express.static("public"));

// Routes
app.use("/", require("./routes/auth"));
app.use("/employees", require("./routes/crud"));

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
