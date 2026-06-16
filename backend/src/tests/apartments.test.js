const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../app");
const prisma = require("../utils/prisma");

describe("Apartment Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/apartments", () => {
    it("should return list of apartments", async () => {
      prisma.apartment.findMany.mockResolvedValue([
        {
          id: "apt-1",
          title: "Beach House",
          city: "Split",
          pricePerNight: 120,
          ownerId: "owner-1",
          owner: { id: "owner-1", firstName: "Ivan", lastName: "Horvat" },
          photos: [],
          reviews: [{ rating: 4 }],
          contents: [],
        },
      ]);
      prisma.apartment.count.mockResolvedValue(1);

      const response = await request(app).get("/api/apartments");

      expect(response.status).toBe(200);
      expect(response.body.apartments).toHaveLength(1);
      expect(response.body.apartments[0].title).toBe("Beach House");
    });

    it("should filter apartments by city", async () => {
      prisma.apartment.findMany.mockResolvedValue([]);
      prisma.apartment.count.mockResolvedValue(0);

      const response = await request(app).get("/api/apartments?city=Zagreb");

      expect(response.status).toBe(200);
      expect(response.body.apartments).toHaveLength(0);
    });
  });

  describe("GET /api/apartments/:id", () => {
    it("should return apartment details", async () => {
      prisma.apartment.findUnique.mockResolvedValue({
        id: "apt-1",
        title: "Beach House",
        description: "Nice apartment",
        city: "Split",
        country: "Croatia",
        address: "Beach Road 1",
        pricePerNight: 120,
        maxGuests: 4,
        minNights: 2,
        cancellationPolicy: "MODERATE",
        owner: {
          id: "owner-1",
          firstName: "Ivan",
          lastName: "Horvat",
        },
        contents: [],
        photos: [],
        reviews: [],
        avgRating: 4.5,
        reviewCount: 2,
      });
      prisma.reservation.findMany.mockResolvedValue([]);
      prisma.availabilityBlock.findMany.mockResolvedValue([]);

      const response = await request(app).get("/api/apartments/apt-1");

      expect(response.status).toBe(200);
      expect(response.body.id).toBe("apt-1");
      expect(response.body.title).toBe("Beach House");
    });

    it("should return 404 for non-existent apartment", async () => {
      prisma.apartment.findUnique.mockResolvedValue(null);

      const response = await request(app).get("/api/apartments/non-existent");

      expect(response.status).toBe(404);
    });
  });

  describe("POST /api/apartments", () => {
    it("should create apartment for authenticated owner", async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: "owner-1",
        email: "owner@example.com",
        role: "OWNER",
        firstName: "Ivan",
        lastName: "Horvat",
      });
      prisma.user.findMany.mockResolvedValue([]);
      prisma.apartment.create.mockResolvedValue({
        id: "apt-1",
        title: "New Apartment",
        city: "Zagreb",
        pricePerNight: 100,
        maxGuests: 3,
        minNights: 1,
        ownerId: "owner-1",
        contents: [],
      });
      prisma.notification.createMany.mockResolvedValue({ count: 0 });

      const token = jwt.sign({ userId: "owner-1" }, process.env.JWT_SECRET);

      const response = await request(app)
        .post("/api/apartments")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "New Apartment",
          description: "A very nice place to stay with amazing views",
          city: "Zagreb",
          country: "Croatia",
          address: "Main Street 1",
          pricePerNight: 100,
          maxGuests: 3,
          minNights: 1,
          cancellationPolicy: "FLEXIBLE",
          latitude: 45.8,
          longitude: 15.9,
        });

      expect(response.status).toBe(201);
      expect(response.body.title).toBe("New Apartment");
    });

    it("should return 401 without authentication", async () => {
      const response = await request(app).post("/api/apartments").send({
        title: "New Apartment",
        city: "Zagreb",
        pricePerNight: 100,
        maxGuests: 3,
        minNights: 1,
      });

      expect(response.status).toBe(401);
    });
  });
});
