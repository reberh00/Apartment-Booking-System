const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../app");
const prisma = require("../utils/prisma");

describe("Auth Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user and return token", async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: "user-1",
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
        role: "GUEST",
      });

      const response = await request(app)
        .post("/api/auth/register")
        .send({
          email: "test@example.com",
          password: "password123",
          firstName: "Test",
          lastName: "User",
          role: "GUEST",
        });

      expect(response.status).toBe(201);
      expect(response.body.user).toEqual({
        id: "user-1",
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
        role: "GUEST",
      });
      expect(response.body.token).toBeDefined();
    });

    it("should return 409 if email already exists", async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: "user-1",
        email: "test@example.com",
      });

      const response = await request(app)
        .post("/api/auth/register")
        .send({
          email: "test@example.com",
          password: "password123",
          firstName: "Test",
          lastName: "User",
          role: "GUEST",
        });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe("Email je već u upotrebi");
    });

    it("should return 400 for invalid email", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          email: "invalid-email",
          password: "password123",
          firstName: "Test",
          lastName: "User",
        });

      expect(response.status).toBe(400);
    });

    it("should return 400 for short password", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          email: "test@example.com",
          password: "short",
          firstName: "Test",
          lastName: "User",
        });

      expect(response.status).toBe(400);
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login with valid credentials", async () => {
      const bcrypt = require("bcryptjs");
      const passwordHash = await bcrypt.hash("password123", 12);

      prisma.user.findUnique.mockResolvedValue({
        id: "user-1",
        email: "test@example.com",
        passwordHash,
        firstName: "Test",
        lastName: "User",
        role: "GUEST",
      });

      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "test@example.com",
          password: "password123",
        });

      expect(response.status).toBe(200);
      expect(response.body.user.email).toBe("test@example.com");
      expect(response.body.token).toBeDefined();
    });

    it("should return 401 for non-existent user", async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "unknown@example.com",
          password: "password123",
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Pogrešan email ili lozinka");
    });

    it("should return 401 for wrong password", async () => {
      const bcrypt = require("bcryptjs");
      const passwordHash = await bcrypt.hash("correctpassword", 12);

      prisma.user.findUnique.mockResolvedValue({
        id: "user-1",
        email: "test@example.com",
        passwordHash,
        firstName: "Test",
        lastName: "User",
        role: "GUEST",
      });

      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "test@example.com",
          password: "wrongpassword",
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Pogrešan email ili lozinka");
    });
  });

  describe("GET /api/auth/me", () => {
    it("should return current user when authenticated", async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: "user-1",
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
        role: "GUEST",
        avatarUrl: null,
        phone: null,
        createdAt: "2024-01-01T00:00:00.000Z",
      });

      const token = jwt.sign({ userId: "user-1" }, process.env.JWT_SECRET);

      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.email).toBe("test@example.com");
    });

    it("should return 401 without token", async () => {
      const response = await request(app).get("/api/auth/me");

      expect(response.status).toBe(401);
    });
  });
});
