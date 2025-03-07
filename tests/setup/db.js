const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

const connectDB = async () => {
  // ✅ Ensure we disconnect from any previous connection first
  if (mongoose.connection.readyState !== 0) {
    console.log("Closing existing MongoDB connection...");
    await mongoose.disconnect();
  }

  // ✅ Start the in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // ✅ Connect to the in-memory MongoDB
  await mongoose.connect(mongoUri);

  console.log("✅ Connected to in-memory MongoDB");
};

const closeDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    console.log("🛑 Dropping in-memory DB...");
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close(); // 🔥 Ensure all connections close
  }

  if (mongoServer) {
    await mongoServer.stop();
  }

  console.log("🛑 In-memory MongoDB fully stopped");
};


module.exports = { connectDB, closeDB };
