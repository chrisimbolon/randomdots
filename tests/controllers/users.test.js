const { register, login, logout } = require("../../controllers/users");


const User = require("../../models/user");

jest.mock("../../models/user"); // Mock User model

describe("User Controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: { username: "testuser", email: "test@example.com", password: "password123" },
      flash: jest.fn(),
      login: jest.fn((user, callback) => callback()), // Mock successful login
      session: { returnTo: "/dashboard" },
    };
    res = {
      redirect: jest.fn(),
      locals: {},
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should register a user successfully", async () => {
    const mockUser = { _id: "123", username: "testuser", email: "test@example.com" };
    User.register.mockResolvedValue(mockUser); // Mock User.register()

    await register(req, res, next);

    expect(User.register).toHaveBeenCalledWith(expect.any(User), "password123");
    expect(req.login).toHaveBeenCalledWith(mockUser, expect.any(Function));
    expect(req.flash).toHaveBeenCalledWith(
      "success",
      "Welcome to Randomdots testuser!, You're now part of our community"
    );
    expect(res.redirect).toHaveBeenCalledWith("/spots");
  });

  it("should handle registration error", async () => {
    User.register.mockRejectedValue(new Error("User already exists"));

    await register(req, res, next);

    expect(req.flash).toHaveBeenCalledWith("error", "User already exists");
    expect(res.redirect).toHaveBeenCalledWith("register");
  });

  it("should log in a user", () => {
    req.body.username = "testuser";

    login(req, res);

    expect(req.flash).toHaveBeenCalledWith(
      "success",
      "hello testuser, you've successfully logged in"
    );
    expect(res.redirect).toHaveBeenCalledWith("/spots");

  });

  it("should log out a user", () => {
    req.logout = jest.fn((callback) => callback()); // Mock logout

    logout(req, res, next);

    expect(req.flash).toHaveBeenCalledWith("success", "Bye !");
    expect(res.redirect).toHaveBeenCalledWith("/spots");
  });

  it("should handle logout error", () => {
    const logoutError = new Error("Logout failed");
    req.logout = jest.fn((callback) => callback(logoutError));

    logout(req, res, next);

    expect(next).toHaveBeenCalledWith(logoutError);
  });
});
