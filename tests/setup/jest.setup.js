const { connectDB, closeDB } = require("./db"); // Import in-memory DB setup

beforeAll(async () => {
  console.log("✅ Jest Setup Done");
  await connectDB(); // 🛠️ Connect to in-memory MongoDB
});

afterAll(async () => {
  await closeDB(); // 🛑 Stop in-memory MongoDB
  console.log("✅ Jest Cleanup Done");
});
