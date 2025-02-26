
jest.setTimeout(10000); // Set timeout to 10 seconds

const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const Spot = require("../../models/spot");
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

describe("Spot Model", () => {
  it("should create a Spot successfully", async () => {
    const user = new User({ username: "testuser", email: "test@example.com" });
    await user.save();

    const spot = new Spot({
      title: "Beautiful Beach",
      images: [
        {
          url: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
          filename: "sample",
        },
      ],
      geometry: {
        type: "Point",
        coordinates: [34.0522, -118.2437],
      },
      price: 100,
      description: "A relaxing beach with golden sands.",
      location: "California, USA",
      author: user._id,

    });

    const savedSpot = await spot.save();
    expect(savedSpot._id).toBeDefined();

    expect(savedSpot.title).toBe("Beautiful Beach");
    expect(savedSpot.geometry.type).toBe("Point");
    expect(savedSpot.geometry.coordinates).toEqual([34.0522, -118.2437]);
    expect(savedSpot.author.toString()).toBe(user._id.toString());
  });

  it("should require title and location fields", async () => {
    const spot = new Spot({
      geometry: {
        type: "Point",
        coordinates: [34.0522, -118.2437],
      },
      price: 50,
      description: "A test spot.",
    });
  
    try {
      await spot.validate(); // Run validation manually
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.errors.title).toBeDefined();
      expect(err.errors.location).toBeDefined();
    }
  });
  

  it("should enforce valid geometry type", async () => {
    const user = new User({ username: "testuser2", email: "test2@example.com" });
    await user.save();

    const invalidSpot = new Spot({
      title: "Invalid Geometry Spot",
      geometry: {
        type: "InvalidType",
        coordinates: [10, 20],
      },
      price: 20,
      location: "Somewhere",
      author: user._id,
    });

    await expect(invalidSpot.save()).rejects.toThrow();
  });
});

