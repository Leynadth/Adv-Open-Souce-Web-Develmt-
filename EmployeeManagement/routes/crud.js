const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../middleware/auth"); // Middleware for protected routes
const Employee = require("../models/Employee");

router.get("/", ensureAuthenticated, async (req, res) => {
  try {
    let employees = await Employee.find().sort({ createdAt: -1 });

    // Convert startDate to a proper format for Handlebars
    employees = employees.map((employee) => {
      return {
        ...employee._doc, // Get raw document data
        startDate: new Date(employee.startDate).toISOString().split("T")[0], // Format as YYYY-MM-DD
      };
    });

    console.log("Fetched Employees:", employees); // Debugging

    res.render("dashboard", { employees });
  } catch (err) {
    console.error("Error fetching employees:", err);
    req.flash("error_msg", "Error loading employees.");
    res.redirect("/");
  }
});


// Add New Employee
router.post("/add", ensureAuthenticated, async (req, res) => {
  const { firstName, lastName, department, startDate, jobTitle, salary } = req.body;

  if (!firstName || !lastName || !department || !startDate || !jobTitle || !salary) {
    req.flash("error_msg", "Please fill in all fields");
    return res.redirect("/employees");
  }

  try {
    const newEmployee = new Employee({
      firstName,
      lastName,
      department,
      startDate,
      jobTitle,
      salary,
    });

    await newEmployee.save();
    req.flash("success_msg", "Employee added successfully");
    res.redirect("/employees"); // Redirect back to employee list
  } catch (err) {
    console.error("Error adding employee:", err);
    req.flash("error_msg", "Failed to add employee");
    res.redirect("/employees");
  }
});

// Edit Employee Form
// Edit Employee Form
router.get("/edit/:id", ensureAuthenticated, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      req.flash("error_msg", "Employee not found");
      return res.redirect("/employees");
    }

    // Convert startDate to YYYY-MM-DD format for input field
    const formattedEmployee = {
      ...employee._doc,
      startDate: employee.startDate ? new Date(employee.startDate).toISOString().split("T")[0] : "",
    };

    res.render("editEmployee", { employee: formattedEmployee });
  } catch (err) {
    console.error("Error fetching employee for edit:", err);
    res.redirect("/employees");
  }
});


// Update Employee
router.put("/edit/:id", ensureAuthenticated, async (req, res) => {
  const { firstName, lastName, department, startDate, jobTitle, salary } = req.body;

  try {
    await Employee.findByIdAndUpdate(req.params.id, {
      firstName,
      lastName,
      department,
      startDate,
      jobTitle,
      salary,
    });
    req.flash("success_msg", "Employee updated successfully");
    res.redirect("/employees");
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Failed to update employee");
    res.redirect("/employees");
  }
});

// Delete Employee
router.delete("/delete/:id", ensureAuthenticated, async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    req.flash("success_msg", "Employee deleted successfully");
    res.redirect("/employees");
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Failed to delete employee");
    res.redirect("/employees");
  }
});

module.exports = router;
