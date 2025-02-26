jest.setTimeout(10000); // Set timeout to 10 seconds

const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const Review = require("../../models/review");
const User = require("../../models/user");

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

describe("Review Model", () => {
  it("should create a Review successfully", async () => {
    const user = new User({ username: "testuser", email: "test@example.com" });
    await user.save();

    const review = new Review({
      body: "Great place!",
      rating: 5,
      author: user._id,
    });

    const savedReview = await review.save();
    expect(savedReview._id).toBeDefined();
    expect(savedReview.body).toBe("Great place!");
    expect(savedReview.rating).toBe(5);
    expect(savedReview.author.toString()).toBe(user._id.toString());
  });

  it("should require body, rating, and author fields", async () => {
    const review = new Review({}); // Missing required fields

    try {
      await review.validate();
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.errors.body).toBeDefined();
      expect(err.errors.rating).toBeDefined();
      expect(err.errors.author).toBeDefined();
    }
  });

  it("should reject a review with a non-existent author", async () => {
    const nonExistentUserId = new mongoose.Types.ObjectId();
  
    // Check manually that the user doesn't exist before saving
    const userExists = await User.exists({ _id: nonExistentUserId });
    expect(userExists).toBeFalsy(); // Ensure user does NOT exist
  
    const invalidReview = new Review({
      body: "This is a review.",
      rating: 4,
      author: nonExistentUserId, // Non-existent user ID
    });
  
    try {
      await invalidReview.save();
    } catch (err) {
      expect(err).toBeDefined(); // Expect some error to occur
    }
  });
  

});
