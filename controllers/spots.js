const Spot = require("../models/spot");
const { cloudinary } = require("../cloudinary");
const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

module.exports.index = async (req, res) => {
  const spots = await Spot.find({});
  res.render("spots/index", { spots });
};

module.exports.renderNewForm = (req, res) => {
  res.render("spots/new");
};

module.exports.createSpot = async (req, res, next) => {
  const geoData = await maptilerClient.geocoding.forward(
    req.body.spot.location,
    { limit: 1 }
  );
  const spot = new Spot(req.body.spot);
  spot.geometry = geoData.features[0].geometry;
  spot.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  spot.author = req.user._id;
  await spot.save();
  console.log(spot);
  req.flash("success", "new spot successfully added!");
  res.redirect(`/spots/${spot._id}`);
};

module.exports.showSpot = async (req, res) => {
  const spot = await Spot.findById(req.params.id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("author");
  console.log(spot);
  if (!spot) {
    req.flash("error", "cannot find that location!");
    return res.redirect("/spots");
  }

  res.render("spots/show", { spot });
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const spot = await Spot.findById(id);
  if (!spot) {
    req.flash("error", "Cannot Find the location");
    return res.redirect("/spots");
  }
  res.render("spots/edit", { spot });
};

module.exports.updateSpot = async (req, res) => {
  const { id } = req.params;
  console.log(req.body);
  const spot = await Spot.findByIdAndUpdate(id, {
    ...req.body.spot,
  });
  const geoData = await maptilerClient.geocoding.forward(
    req.body.spot.location,
    { limit: 1 }
  );
  spot.geometry = geoData.features[0].geometry;
  const imgs = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  spot.images.push(...imgs);
  await spot.save();
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await spot.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
    console.log(spot);
  }
  req.flash("success", "spot updated successfully!");
  res.redirect(`/spots/${spot._id}`);
};

module.exports.deleteSpot = async (req, res) => {
  const { id } = req.params;
  const deletedCamp = await Spot.findByIdAndDelete(id);
  req.flash("success", "spot removed successfully!");
  res.redirect("/spots");
};
