jest.setTimeout(10000); // Set timeout to 10 seconds


const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const User = require("../../models/user"); // Adjust path if needed

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
});


afterAll(async () => {
    try {
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
      }
      if (mongoServer) {
        await mongoServer.stop();
      }
    } catch (err) {
      console.error("Error shutting down MongoDB:", err);
    }
  });
    
  

describe("User Model", () => {
  it("should create a user successfully", async () => {
    const user = new User({ username: "testuser", email: "test@example.com" });
    await user.setPassword("password123"); // Passport-local-mongoose method
    const savedUser = await user.save();

    expect(savedUser._id).toBeDefined();
    expect(savedUser.username).toBe("testuser");
    expect(savedUser.email).toBe("test@example.com");
  });

  it("should fail if email is missing", async () => {
    const user = new User({ username: "testuser" });

    await expect(user.save()).rejects.toThrow();
  });

  it("should enforce unique email", async () => {
    await User.create({ username: "user1", email: "unique@example.com" });

    await expect(
      User.create({ username: "user2", email: "unique@example.com" })
    ).rejects.toThrow();
  });

  it("should have passport-local-mongoose plugin methods", async () => {
    const user = new User({ username: "testuser", email: "test@example.com" });
    await user.setPassword("password123");

    expect(typeof user.authenticate).toBe("function");
  });
});
