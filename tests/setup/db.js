const mongoose = require("mongoose");

const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect("mongodb://127.0.0.1:27017/randomdots_test", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
};

const closeDB = async () => {
    try {
      if (mongoose.connection.readyState === 1) { // Check if connection is open
        await mongoose.connection.db.dropDatabase();
      }
      await mongoose.connection.close();
    } catch (error) {
      console.error("Error closing database:", error);
    }
  };

module.exports = { connectDB, closeDB };
