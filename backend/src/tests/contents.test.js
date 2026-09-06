const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../app");
const prisma = require("../utils/prisma");

describe("Content Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/contents", () => {
    function ownerToken() {
      prisma.user.findUnique.mockResolvedValue({
        id: "owner-1",
        email: "owner@example.com",
        role: "OWNER",
        firstName: "Ivan",
        lastName: "Horvat",
      });
      return jwt.sign({ userId: "owner-1" }, process.env.JWT_SECRET);
    }

    it("should create a content when no duplicate exists", async () => {
      const token = ownerToken();
      prisma.content.findFirst.mockResolvedValue(null);
      prisma.content.create.mockResolvedValue({
        id: "content-1",
        name: "PS5",
        nameNormalized: "ps5",
        icon: "star",
        apartmentId: null,
      });

      const response = await request(app)
        .post("/api/contents")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "PS5" });

      expect(response.status).toBe(201);
      expect(prisma.content.create).toHaveBeenCalledWith({
        data: {
          name: "PS5",
          nameNormalized: "ps5",
          icon: "star",
          apartmentId: null,
        },
      });
    });

    it("should reject a duplicate that only differs by case", async () => {
      const token = ownerToken();
      prisma.content.findFirst.mockResolvedValue({
        id: "content-1",
        name: "PS5",
        nameNormalized: "ps5",
        apartmentId: null,
      });

      const response = await request(app)
        .post("/api/contents")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "ps5" });

      expect(response.status).toBe(400);
      expect(prisma.content.create).not.toHaveBeenCalled();
      // The duplicate check itself must compare on the normalized name,
      // not the raw (case-sensitive) one.
      expect(prisma.content.findFirst).toHaveBeenCalledWith({
        where: { nameNormalized: "ps5", apartmentId: null },
      });
    });

    it("should reject a duplicate that only differs by surrounding whitespace", async () => {
      const token = ownerToken();
      prisma.content.findFirst.mockResolvedValue({
        id: "content-1",
        name: "WiFi",
        nameNormalized: "wifi",
        apartmentId: null,
      });

      const response = await request(app)
        .post("/api/contents")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "  WiFi  " });

      expect(response.status).toBe(400);
      expect(prisma.content.create).not.toHaveBeenCalled();
    });

    it("should scope duplicate detection per apartment", async () => {
      const token = ownerToken();
      prisma.content.findFirst.mockResolvedValue(null);
      prisma.content.create.mockResolvedValue({
        id: "content-2",
        name: "Sauna",
        nameNormalized: "sauna",
        icon: "star",
        apartmentId: "apt-1",
      });

      const response = await request(app)
        .post("/api/contents")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Sauna", apartmentId: "11111111-1111-1111-1111-111111111111" });

      expect(response.status).toBe(201);
      expect(prisma.content.findFirst).toHaveBeenCalledWith({
        where: {
          nameNormalized: "sauna",
          apartmentId: "11111111-1111-1111-1111-111111111111",
        },
      });
    });
  });
});
