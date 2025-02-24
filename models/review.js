const { ref } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// const reviewSchema = new Schema({
//   body: String,
//   rating: Number,
//   author: {
//     type: Schema.Types.ObjectId,
//     ref: "User",
//   },
// });

const reviewSchema = new Schema({
  body: { type: String, required: true }, // ✅ Enforce required field
  rating: { type: Number, required: true }, // ✅ Enforce required field
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true, // ✅ Enforce author reference
  },
});

module.exports = mongoose.model("Review", reviewSchema);
