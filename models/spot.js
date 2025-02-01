const mongoose = require("mongoose");
const Review = require("./review");
const { string, required } = require("joi");
const { coordinates } = require("@maptiler/client");
const Schema = mongoose.Schema;

// https://res.cloudinary.com/dazi1cb6m/image/upload/c_thumb,w_200,g_face/v1722705209/Randomdots/ou0aw6kbd4c8jsa2iwzu.jpg

const ImageSchema = new Schema({
  url: String,
  filename: String,
});

ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200,h_200");
});

const opts = { toJSON: { virtuals: true } };

const SpotSchema = new Schema(
  {
    title: String,
    images: [ImageSchema],
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    price: Number,
    description: String,
    location: String,
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  opts
);

SpotSchema.virtual("properties.popUpMarkup").get(function () {
  return `
  <strong><a href="/Spots/${this._id}">${this.title}</a><strong>
  <p>${this.description.substring(0, 20)}...</p>`;
});

SpotSchema.post("findOneAndDelete", async (doc) => {
  if (doc) {
    await Review.deleteMany({
      _id: {
        $in: doc.reviews,
      },
    });
  }
});

module.exports = mongoose.model("Spot", SpotSchema);
