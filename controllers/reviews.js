const Spot = require("../models/spot");
const Review = require("../models/review");

module.exports.createReview = async (req, res) => {
  const spot = await Spot.findById(req.params.id);
  const review = new Review(req.body.review);
  review.author = req.user._id;
  spot.reviews.push(review);
  await review.save();
  await spot.save();
  req.flash("success", "Review created! We appreciate your contribution");
  res.redirect(`/spots/${spot._id}`);
};

module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;
  await Spot.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(req.params.reviewId);
  req.flash(
    "success",
    "Review deleted! Thank you for keeping our community updated.!"
  );
  res.redirect(`/spots/${id}`);
};
