const { spotSchema, reviewSchema } = require("./schemas.js");
const ExpressError = require("./utils/ExpresError");
const Spot = require("./models/spot.js");
const Review = require("./models/review");

module.exports.isLoggedIn = (req, res, next) => {
  console.log("request user is:", req.user);
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash("error", "you must signed in");
    return res.redirect("/login");
  }
  next();
};

module.exports.storeReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo;
  }
  next();
};

module.exports.validateSpot = (req, res, next) => {
  const { error } = spotSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const spot = await Spot.findById(id);
  if (!spot.author.equals(req.user.id)) {
    req.flash("error", "you don't have permission to do that");
    return res.redirect(`/spots/${id}`);
  }
  next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "you don't have permission to do that");
    return res.redirect(`/spots/${id}`);
  }
  next();
};

module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};
