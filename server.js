require("dotenv").config(); // Load environment variables from .env
const mongoose = require("mongoose");
const express = require("express");
const app = express();

const startServer = async () => {
  try {
    await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Database Connected");

    const PORT = process.env.PORT || 4000; // Default to 4000 if PORT is not set
    app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
})
  } catch (err) {
    console.error("❌ DB Connection Error:", err);
    process.exit(1);
  }
};

startServer();
