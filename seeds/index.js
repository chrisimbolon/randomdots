const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Campground = require("../models/campground");

mongoose.connect("mongodb://127.0.0.1:27017/random-camp");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "KONEKSI KE DATABASE ERROR"));
db.once("open", () => {
  console.log("Database terkoneksi");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      author: "66aa961c8e27a08f26b02761",
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      description:
        "A delivery robot looks at the world and decides in which direction it wants.",
      price,
      images: [
        {
          url: "https://res.cloudinary.com/dazi1cb6m/image/upload/v1722691970/Randomdots/jvpqou5sz8feca16f3pn.jpg",
          filename: "Randomdots/jvpqou5sz8feca16f3pn",
        },
        {
          url: "https://res.cloudinary.com/dazi1cb6m/image/upload/v1722691959/Randomdots/omlolw0cmbtms4t3muu8.jpg",
          filename: "Randomdots/omlolw0cmbtms4t3muu8",
        },
      ],
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
