const middleware = require("../../middleware");
const Spot = require("../../models/spot");
const Review = require("../../models/review");
const ExpressError = require("../../utils/ExpresError");

jest.mock("../../models/spot");
jest.mock("../../models/review");

describe("Middleware Tests", () => {
  let req, res, next;

  beforeEach(() => {
    req = { 
      params: {}, 
      body: {}, 
      user: { _id: "user123" }, 
      isAuthenticated: jest.fn(),
      session: {}, 
      flash: jest.fn() // ✅ Move flash here
    };
    res = { 
        redirect: jest.fn(), 
        locals: {},
        flash: jest.fn() // ✅ Add flash mock here
      };
      
    next = jest.fn();
  });
  
  describe("isLoggedIn", () => {
    it("should redirect if user is not authenticated", () => {
      req.isAuthenticated.mockReturnValue(false);
      middleware.isLoggedIn(req, res, next);
      expect(res.redirect).toHaveBeenCalledWith("/login");
      expect(req.flash).toHaveBeenCalledWith("error", "you must signed in");

    });

    it("should call next if user is authenticated", () => {
      req.isAuthenticated.mockReturnValue(true);
      middleware.isLoggedIn(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe("isAuthor", () => {
    it("should redirect if user is not the author", async () => {
      Spot.findById.mockResolvedValue({ author: { equals: () => false } });
      req.params.id = "spot123";
      await middleware.isAuthor(req, res, next);
      expect(res.redirect).toHaveBeenCalledWith("/spots/spot123");
      expect(req.flash).toHaveBeenCalledWith("error", "you don't have permission to do that");
    });

    it("should call next if user is the author", async () => {
      Spot.findById.mockResolvedValue({ author: { equals: () => true } });
      await middleware.isAuthor(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe("isReviewAuthor", () => {
    it("should redirect if user is not the review author", async () => {
      Review.findById.mockResolvedValue({ author: { equals: () => false } });
      req.params = { id: "spot123", reviewId: "review456" };
      await middleware.isReviewAuthor(req, res, next);
      expect(res.redirect).toHaveBeenCalledWith("/spots/spot123");
      expect(req.flash).toHaveBeenCalledWith("error", "you don't have permission to do that");
    });

    it("should call next if user is the review author", async () => {
      Review.findById.mockResolvedValue({ author: { equals: () => true } });
      await middleware.isReviewAuthor(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe("validateSpot", () => {
    it("should throw an error if validation fails", () => {
      req.body = {};
      expect(() => middleware.validateSpot(req, res, next)).toThrow(ExpressError);
    });
  });

  describe("validateReview", () => {
    it("should throw an error if review validation fails", () => {
      req.body = {};
      expect(() => middleware.validateReview(req, res, next)).toThrow(ExpressError);
    });
  });
});
