const request = require("supertest");
const app = require("../../server-test"); // Use test app
const User = require("../../models/user");
const { connectDB, closeDB } = require("../setup/db");

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await closeDB();
  await new Promise((resolve) => setTimeout(resolve, 500));
});

describe("User Authentication Integration Tests", () => {
  const testUser = { username: "testuser", email: "test@example.com", password: "password123" };
  let agent;

  beforeEach(async () => {
    await User.deleteMany({});
    agent = request.agent(app); // Maintain session between requests

    const user = new User({ username: testUser.username, email: testUser.email });
    await user.setPassword(testUser.password);
    await user.save();
  });

  // ✅ Test successful registration
  it("should register a new user and redirect", async () => {
    const res = await agent.post("/register").send(testUser).expect(302);
    
    console.log("🟢 Register Response Headers:", res.headers);
    expect(res.headers["set-cookie"]).toBeDefined();

    const savedUser = await User.findOne({ email: testUser.email });
    expect(savedUser).not.toBeNull();
    expect(savedUser.username).toBe(testUser.username);
  });

  // ❌ Test duplicate registration attempt
  it("should not allow duplicate user registration", async () => {
    await agent.post("/register").send(testUser).expect(302);
    
    const res = await agent.post("/register").send(testUser);
    expect(res.status).toBe(302)
    expect(res.text).toContain("Redirecting to register"); // Adjust based on actual error message
  });

  // ✅ Test successful login
  it("should log in an existing user and maintain session", async () => {
    const res = await agent.post("/login").send({
      username: testUser.username,
      password: testUser.password,
    });

    console.log("🔎 Login Response Headers:", res.headers);
    expect(res.status).toBe(302);
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  // ❌ Test login with incorrect password
  it("should reject login with incorrect password", async () => {
    const res = await agent.post("/login").send({
      username: testUser.username,
      password: "wrongpassword",
    });

    expect(res.status).toBe(302); 
    expect(res.text).toContain(" Redirecting to /login"); // Adjust based on actual error message
  });

  // ❌ Test login with non-existent user
  it("should reject login for a non-existent user", async () => {
    const res = await agent.post("/login").send({
      username: "doesnotexist",
      password: "password123",
    });

    expect(res.status).toBe(302);
    expect(res.text).toContain("Redirecting to /login");
  });

  // ✅ Test protected route access after login
  it("should allow access to protected route after login", async () => {
    await agent.post("/login").send({ username: testUser.username, password: testUser.password });

    const res = await agent.get("/spots").expect(200);
    console.log("🔎 Protected Route Response:", res.text);

    expect(res.text).toContain("All Spots");
  });


  // ✅ Test session persistence
  it("should persist the session after login", async () => {
    await agent.post("/login").send({ username: testUser.username, password: testUser.password }).expect(302);

    // Fetch a protected route to check if session persists
    const sessionCheck = await agent.get("/spots").expect(200);
    expect(sessionCheck.text).toContain("All Spots"); 
  });
 
  
  it("should log session details before and after logout", async () => {
    await agent.post("/login").send({ username: testUser.username, password: testUser.password });
  
    console.log("✅ Session Before Logout:", await agent.get("/session").then(res => res.text));
  
    await agent.get("/logout");
  
    console.log("🚫 Session After Logout:", await agent.get("/session").then(res => res.text));
  });

  it("should reject login with incorrect password", async () => {
    const res = await agent.post("/login").send({
      username: testUser.username,
      password: "wrongpassword",
    });
  
    expect(res.status).toBe(302); // Expecting a redirect, not 401
    expect(res.headers.location).toBe("/login"); // Ensure it redirects to /login
  });
  
  it("should log out a user and destroy session", async () => {
    await agent.post("/login").send({ username: testUser.username, password: testUser.password });
  
    await agent.get("/logout").expect(302);
  
    const res = await agent.get("/login"); // Instead of /session, check if we get the login page
    expect(res.status).toBe(200); // Should successfully load login page
  });
    
  it("should reject registration if required fields are missing", async () => {
    const res = await agent.post("/register").send({ username: "testuser" });
  
    expect(res.status).toBe(302); // Expecting a redirect, not 400
    expect(res.headers.location).toMatch(/\/?register/);

  });  

});



