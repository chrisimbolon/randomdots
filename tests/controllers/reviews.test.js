const { createReview, deleteReview } = require("../../controllers/reviews");
const Spot = require("../../models/spot");
const Review = require("../../models/review");

jest.mock("../../models/spot"); // Mock Mongoose Spot model
jest.mock("../../models/review"); // Mock Mongoose Review model

describe("Reviews Controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      params: { id: "123", reviewId: "456" },
      body: { review: { text: "Great place!", rating: 5 } },
      user: { _id: "user123" },
      flash: jest.fn(),
    };
    res = {
      redirect: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create a new review", async () => {
    const spot = { _id: "123", reviews: [], save: jest.fn() };
    Spot.findById.mockResolvedValue(spot);

    const review = { _id: "456", save: jest.fn() };
    Review.mockImplementation(() => review);

    await createReview(req, res, next);

    expect(Spot.findById).toHaveBeenCalledWith("123");
    expect(review.author).toBe("user123");
    expect(spot.reviews).toContain(review);
    expect(review.save).toHaveBeenCalled();
    expect(spot.save).toHaveBeenCalled();
    expect(req.flash).toHaveBeenCalledWith("success", "Review created! We appreciate your contribution");
    expect(res.redirect).toHaveBeenCalledWith("/spots/123");
  });

  it("should delete a review", async () => {
    Spot.findByIdAndUpdate.mockResolvedValue({});
    Review.findByIdAndDelete.mockResolvedValue({});

    await deleteReview(req, res, next);

    expect(Spot.findByIdAndUpdate).toHaveBeenCalledWith("123", { $pull: { reviews: "456" } });
    expect(Review.findByIdAndDelete).toHaveBeenCalledWith("456");
    expect(req.flash).toHaveBeenCalledWith("success", "Review deleted! Thank you for keeping our community updated.!");
    expect(res.redirect).toHaveBeenCalledWith("/spots/123");
  });
});
