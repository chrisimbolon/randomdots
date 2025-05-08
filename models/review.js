const { ref } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  body: { type: String, required: true }, // Enforcing required field
  rating: { type: Number, required: true }, // Enforcing required field
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true, //  Enforcing author reference
  },
});

module.exports = mongoose.model("Review", reviewSchema);
