const app = require("./app"); // Import your Express app but don't start the server
const session = require("express-session");
const passport = require("passport");

app.use(session({ secret: "test-secret", resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

module.exports = app; // Export app for tests without running app.listen()

