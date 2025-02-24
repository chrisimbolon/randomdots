const mongoose = require("mongoose");
const Spot = require("../../models/spot"); 
const Review = require("../../models/review");
const User = require("../../models/user");
const { connectDB, closeDB } = require("../setup/db");

jest.setTimeout(20000); // Increase timeout to 10s

beforeAll(async () => {
  await connectDB();
}, 10000);

afterAll(async () => {
    await closeDB();
    await mongoose.disconnect();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Give it a sec to fully disconnect
  });
  

beforeEach(async () => {
  await Spot.deleteMany({});
  await Review.deleteMany({});
  await User.deleteMany({});
});

describe("Spot Model", () => {
  test("should create a Spot document successfully", async () => {
    const spot = new Spot({
      title: "Test Spot",
      images: [{ url: "https://example.com/image.jpg", filename: "testimg" }],
      geometry: { type: "Point", coordinates: [40.7128, -74.006] }, // Added geometry field
      price: 100,
      description: "A test spot for testing.",
      location: "New York",
    });

    const savedSpot = await spot.save();
    expect(savedSpot._id).toBeDefined();
    expect(savedSpot.title).toBe("Test Spot");
  });

  test("should return correct thumbnail URL", () => {
    const spot = new Spot({
      images: [{ url: "https://res.cloudinary.com/demo/upload/test.jpg" }],
    });

    expect(spot.images[0].thumbnail).toBe(
      "https://res.cloudinary.com/demo/upload/w_200,h_200/test.jpg"
    );
  });

  test("should generate popUpMarkup correctly", () => {
    const spot = new Spot({
      _id: new mongoose.Types.ObjectId(),
      title: "Test Spot",
      description: "This is a test description for a test spot.",
    });

    expect(spot.properties.popUpMarkup).toContain("Test Spot");
    expect(spot.properties.popUpMarkup).toContain("This is a test descr..."); // Updated expected string
  });

  test("should reference an author (User)", async () => {
    const user = new User({ username: "testuser", email: "test@example.com" });
    await user.save();

    const spot = new Spot({
      title: "User Test Spot",
      author: user._id,
      geometry: { type: "Point", coordinates: [0, 0] } // Added geometry field
    });

    const savedSpot = await spot.save();
    expect(savedSpot.author.toString()).toBe(user._id.toString());
  });

  test("should delete associated reviews when spot is deleted", async () => {
    const user = new User({ username: "testuser", email: "test@example.com" });
    await user.save();
  
    const spot = new Spot({ 
      title: "Spot with Review", 
      geometry: { type: "Point", coordinates: [0, 0] }, // Added geometry field
      author: user._id,  // Ensure Spot has an author
    });
    await spot.save();
  
    // ✅ Fix: Create valid reviews with required fields
    const review1 = new Review({ 
      body: "Great place!", 
      rating: 5, 
      author: user._id, 
      spot: spot._id 
    });
    const review2 = new Review({ 
      body: "Awesome!", 
      rating: 4, 
      author: user._id, 
      spot: spot._id 
    });
  
    await review1.save();
    await review2.save();
  
    // ✅ Fix: Properly push reviews into the spot's reviews array
    spot.reviews.push(review1._id, review2._id);
    await spot.save();
  
    // Delete the spot
    await Spot.findOneAndDelete({ _id: spot._id });
  
    // ✅ Fix: Fetch reviews again from DB and check if they're deleted
    const remainingReviews = await Review.find({ _id: { $in: [review1._id, review2._id] } });
    expect(remainingReviews.length).toBe(0);
  });
  
});