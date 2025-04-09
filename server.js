const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();

// Serve static files from "public" folder
app.use(express.static(path.join(__dirname, "public")));

// Parse JSON request bodies
app.use(bodyParser.json());

// Contact form endpoint
app.post("/api/contact", (req, res) => {
  const { name, email, message } = req.body;
  console.log("New contact form submission:", req.body);

  // TODO: Add logic here for storing in a database, sending emails, etc.

  return res.json({
    success: true,
    message: "Thanks for reaching out! We’ll get back to you soon."
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});