require('dotenv').config();
console.log("MONGO_URI:", process.env.MONGO_URI); // Debug log

// console.log(process.env.SECRET);
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const ExpressError = require("./utils/ExpresError");
const methodOverride = require("method-override");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const userRoutes = require("./routes/users");
const spotRoutes = require("./routes/spots");
const reviewRoutes = require("./routes/reviews");

// mongoose.connect("mongodb://127.0.0.1:27017/randomDots");

// const db = mongoose.connection;
// db.on("error", console.error.bind(console, "DB Connection Error!"));
// db.once("open", () => {
//   console.log("Database Connected");
// });

const MONGO_URI = process.env.MONGO_URI || "mongodb://randomdots-mongo:27017/randomdots";
// console.log("🔍 Checking MONGO_URI:", process.env.MONGO_URI);


if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI is missing! Make sure it's set in your environment variables.");
  process.exit(1);
}


mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected successfully!"))
  .catch((err) => {
    console.error("❌ DB Connection Error:", err);
    process.exit(1); // Exit if DB connection fails
  });

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  mongoSanitize({
    replaceWith: "_",
  })
);

const sessionConfig = {
  secret: "cobacobarahasia",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
  "https://cdn.maptiler.com/",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net",
  "https://cdn.maptiler.com/",
];
const connectSrcUrls = ["https://api.maptiler.com/"];

const fontSrcUrls = [
  "https://cdn.jsdelivr.net",  // Allow Font Awesome from jsDelivr
  "https://fonts.gstatic.com", // Allow Google Fonts
];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      childSrc: ["blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/dazi1cb6m/",
        "https://api.maptiler.com/",
        "https://cdn.jsdelivr.net",
        "https://fonts.gstatic.com",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  console.log(req.query);
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.get("/fakeuser", async (req, res) => {
  const user = User({ email: "pauk@gmail.com", username: "pauk" });
  const newUser = await User.register(user, "batam");
  res.send(newUser);
});

app.use("/", userRoutes);
app.use("/spots", spotRoutes);
app.use("/spots/:id/reviews", reviewRoutes);

app.get("/", (req, res) => {
  res.render("home");
});

app.all("*", (req, res, next) => {
  next(new ExpressError("PAGE NOT FOUND!", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Uppsie, somthing not right!";
  res.status(statusCode).render("error", { err });
});

// app.listen(3000, () => {
//   console.log("port 3000 is working");
// });

if (process.env.NODE_ENV !== "test") {
  app.listen(3000, () => {
    console.log("port 3000 is working");
  });
}

module.exports = app;
