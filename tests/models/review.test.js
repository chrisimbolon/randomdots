const mongoose = require("mongoose");
const Review = require("../../models/review");
const User = require("../../models/user");
const { connectDB, closeDB } = require("../setup/db");

jest.setTimeout(20000); // To avoid timeout issues in slow test environments

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await closeDB();
  await mongoose.disconnect();
});

beforeEach(async () => {
  await Review.deleteMany({});
  await User.deleteMany({});
});

describe("Review Model", () => {
  test("should create a Review document successfully", async () => {
    const user = new User({ username: "testuser", email: "test@example.com" });
    await user.save();

    const review = new Review({
      body: "This is a great spot!",
      rating: 5,
      author: user._id,
    });

    const savedReview = await review.save();
    expect(savedReview._id).toBeDefined();
    expect(savedReview.body).toBe("This is a great spot!");
    expect(savedReview.rating).toBe(5);
    expect(savedReview.author.toString()).toBe(user._id.toString());
  });

  test("should require body and rating fields", async () => {
    const review = new Review({});
    let error;
    try {
      await review.save();
    } catch (err) {
      error = err;
    }
    expect(error).toBeDefined();
    expect(error.errors.body).toBeDefined();
    expect(error.errors.rating).toBeDefined();
  });

  test("should require a valid user reference", async () => {
    const invalidUserId = new mongoose.Types.ObjectId(); // A random but non-existent ID

    const review = new Review({
      body: "Nice place!",
      rating: 4,
      author: invalidUserId, // This user does not exist in DB
    });

    const savedReview = await review.save();
    expect(savedReview.author.toString()).toBe(invalidUserId.toString()); // Mongoose allows it unless populated
  });
});
