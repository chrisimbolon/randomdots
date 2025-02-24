const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const User = require("../../models/user");

let mongoServer;

// 🛠 Setup in-memory MongoDB before running tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// 🧹 Cleanup after each test
afterEach(async () => {
  await User.deleteMany(); // Clear database after each test
});

// 🛑 Close DB and stop Mongo server after tests
afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe("User Model", () => {
  it("should create a user successfully", async () => {
    const user = new User({ username: "testuser", email: "test@example.com" });
    const savedUser = await user.save();

    expect(savedUser._id).toBeDefined();
    expect(savedUser.email).toBe("test@example.com");
  });

  it("should fail if email is missing", async () => {
    const user = new User({ username: "testuser" });

    await expect(user.save()).rejects.toThrow();
  });

  it("should enforce unique email", async () => {
    await new User({ username: "user1", email: "unique@example.com" }).save();

    const duplicateUser = new User({ username: "user2", email: "unique@example.com" });

    await expect(duplicateUser.save()).rejects.toThrow();
  });

  it("should have passport-local-mongoose plugin methods", () => {
    const user = new User();
    expect(typeof user.setPassword).toBe("function");
    expect(typeof user.authenticate).toBe("function");
  });
});
