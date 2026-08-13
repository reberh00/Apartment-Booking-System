require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const { APARTMENT_PHOTO_DIR } = require("../src/middleware/upload");
const prisma = new PrismaClient();

const IDS = {
  apartments: {
    apt1: "10000000-0000-0000-0000-000000000001",
    apt2: "10000000-0000-0000-0000-000000000002",
    apt3: "10000000-0000-0000-0000-000000000003",
    apt4: "10000000-0000-0000-0000-000000000004",
    apt5: "10000000-0000-0000-0000-000000000005",
    apt6: "10000000-0000-0000-0000-000000000006",
    apt7: "10000000-0000-0000-0000-000000000007",
    apt8: "10000000-0000-0000-0000-000000000008",
    apt9: "10000000-0000-0000-0000-000000000009",
    apt10: "10000000-0000-0000-0000-000000000010",
    apt11: "10000000-0000-0000-0000-000000000011",
  },
  blocks: {
    b1: "30000000-0000-0000-0000-000000000001",
    b2: "30000000-0000-0000-0000-000000000002",
  },
  reservations: {
    r1: "40000000-0000-0000-0000-000000000001",
    r2: "40000000-0000-0000-0000-000000000002",
    r3: "40000000-0000-0000-0000-000000000003",
    r4: "40000000-0000-0000-0000-000000000004",
    r5: "40000000-0000-0000-0000-000000000005",
    r6: "40000000-0000-0000-0000-000000000006",
    r7: "40000000-0000-0000-0000-000000000007",
    r8: "40000000-0000-0000-0000-000000000008",
    r9: "40000000-0000-0000-0000-000000000009",
    r10: "40000000-0000-0000-0000-000000000010",
    r11: "40000000-0000-0000-0000-000000000011",
    r12: "40000000-0000-0000-0000-000000000012",
    r13: "40000000-0000-0000-0000-000000000013",
    r14: "40000000-0000-0000-0000-000000000014",
    r15: "40000000-0000-0000-0000-000000000015",
    r16: "40000000-0000-0000-0000-000000000016",
    r17: "40000000-0000-0000-0000-000000000017",
    r18: "40000000-0000-0000-0000-000000000018",
    r19: "40000000-0000-0000-0000-000000000019",
    r20: "40000000-0000-0000-0000-000000000020",
    r21: "40000000-0000-0000-0000-000000000021",
    r22: "40000000-0000-0000-0000-000000000022",
    r23: "40000000-0000-0000-0000-000000000023",
    r24: "40000000-0000-0000-0000-000000000024",
    r25: "40000000-0000-0000-0000-000000000025",
    r26: "40000000-0000-0000-0000-000000000026",
    r27: "40000000-0000-0000-0000-000000000027",
    r28: "40000000-0000-0000-0000-000000000028",
    r29: "40000000-0000-0000-0000-000000000029",
    r30: "40000000-0000-0000-0000-000000000030",
    r31: "40000000-0000-0000-0000-000000000031",
    r32: "40000000-0000-0000-0000-000000000032",
    r33: "40000000-0000-0000-0000-000000000033",
    r34: "40000000-0000-0000-0000-000000000034",
    r35: "40000000-0000-0000-0000-000000000035",
    r36: "40000000-0000-0000-0000-000000000036",
    r37: "40000000-0000-0000-0000-000000000037",
    r38: "40000000-0000-0000-0000-000000000038",
    r39: "40000000-0000-0000-0000-000000000039",
    r40: "40000000-0000-0000-0000-000000000040",
    r41: "40000000-0000-0000-0000-000000000041",
    r42: "40000000-0000-0000-0000-000000000042",
    r43: "40000000-0000-0000-0000-000000000043",
    r44: "40000000-0000-0000-0000-000000000044",
    r45: "40000000-0000-0000-0000-000000000045",
    r46: "40000000-0000-0000-0000-000000000046",
    r47: "40000000-0000-0000-0000-000000000047",
    r48: "40000000-0000-0000-0000-000000000048",
    r49: "40000000-0000-0000-0000-000000000049",
    r50: "40000000-0000-0000-0000-000000000050",
    r51: "40000000-0000-0000-0000-000000000051",
    r52: "40000000-0000-0000-0000-000000000052",
    r53: "40000000-0000-0000-0000-000000000053",
    r54: "40000000-0000-0000-0000-000000000054",
    r55: "40000000-0000-0000-0000-000000000055",
    r56: "40000000-0000-0000-0000-000000000056",
  },
  reviews: {
    rev1: "50000000-0000-0000-0000-000000000001",
    rev2: "50000000-0000-0000-0000-000000000002",
    rev3: "50000000-0000-0000-0000-000000000003",
    rev4: "50000000-0000-0000-0000-000000000004",
    rev5: "50000000-0000-0000-0000-000000000005",
    rev6: "50000000-0000-0000-0000-000000000006",
    rev7: "50000000-0000-0000-0000-000000000007",
    rev8: "50000000-0000-0000-0000-000000000008",
    rev9: "50000000-0000-0000-0000-000000000009",
    rev10: "50000000-0000-0000-0000-000000000010",
    rev11: "50000000-0000-0000-0000-000000000011",
    rev12: "50000000-0000-0000-0000-000000000012",
    rev13: "50000000-0000-0000-0000-000000000013",
    rev14: "50000000-0000-0000-0000-000000000014",
    rev15: "50000000-0000-0000-0000-000000000015",
    rev16: "50000000-0000-0000-0000-000000000016",
    rev17: "50000000-0000-0000-0000-000000000017",
    rev18: "50000000-0000-0000-0000-000000000018",
    rev19: "50000000-0000-0000-0000-000000000019",
    rev20: "50000000-0000-0000-0000-000000000020",
    rev21: "50000000-0000-0000-0000-000000000021",
    rev22: "50000000-0000-0000-0000-000000000022",
    rev23: "50000000-0000-0000-0000-000000000023",
    rev24: "50000000-0000-0000-0000-000000000024",
    rev25: "50000000-0000-0000-0000-000000000025",
    rev26: "50000000-0000-0000-0000-000000000026",
    rev27: "50000000-0000-0000-0000-000000000027",
    rev28: "50000000-0000-0000-0000-000000000028",
    rev29: "50000000-0000-0000-0000-000000000029",
    rev30: "50000000-0000-0000-0000-000000000030",
    rev31: "50000000-0000-0000-0000-000000000031",
    rev32: "50000000-0000-0000-0000-000000000032",
    rev33: "50000000-0000-0000-0000-000000000033",
    rev34: "50000000-0000-0000-0000-000000000034",
    rev35: "50000000-0000-0000-0000-000000000035",
    rev36: "50000000-0000-0000-0000-000000000036",
    rev37: "50000000-0000-0000-0000-000000000037",
    rev38: "50000000-0000-0000-0000-000000000038",
    rev39: "50000000-0000-0000-0000-000000000039",
    rev40: "50000000-0000-0000-0000-000000000040",
    rev41: "50000000-0000-0000-0000-000000000041",
    rev42: "50000000-0000-0000-0000-000000000042",
    rev43: "50000000-0000-0000-0000-000000000043",
    rev44: "50000000-0000-0000-0000-000000000044",
    rev45: "50000000-0000-0000-0000-000000000045",
    rev46: "50000000-0000-0000-0000-000000000046",
    rev47: "50000000-0000-0000-0000-000000000047",
    rev48: "50000000-0000-0000-0000-000000000048",
    rev49: "50000000-0000-0000-0000-000000000049",
    rev50: "50000000-0000-0000-0000-000000000050",
    rev51: "50000000-0000-0000-0000-000000000051",
    rev52: "50000000-0000-0000-0000-000000000052",
    rev53: "50000000-0000-0000-0000-000000000053",
    rev54: "50000000-0000-0000-0000-000000000054",
    rev55: "50000000-0000-0000-0000-000000000055",
  },
  photos: {
    apt1p1: "80000000-0000-0000-0000-000000000001",
    apt1p2: "80000000-0000-0000-0000-000000000002",
    apt1p3: "80000000-0000-0000-0000-000000000003",
    apt2p1: "80000000-0000-0000-0000-000000000004",
    apt2p2: "80000000-0000-0000-0000-000000000005",
    apt2p3: "80000000-0000-0000-0000-000000000006",
    apt3p1: "80000000-0000-0000-0000-000000000007",
    apt3p2: "80000000-0000-0000-0000-000000000008",
    apt3p3: "80000000-0000-0000-0000-000000000009",
    apt4p1: "80000000-0000-0000-0000-000000000010",
    apt4p2: "80000000-0000-0000-0000-000000000011",
    apt4p3: "80000000-0000-0000-0000-000000000012",
    apt5p1: "80000000-0000-0000-0000-000000000013",
    apt5p2: "80000000-0000-0000-0000-000000000014",
    apt5p3: "80000000-0000-0000-0000-000000000015",
    apt6p1: "80000000-0000-0000-0000-000000000016",
    apt6p2: "80000000-0000-0000-0000-000000000017",
    apt6p3: "80000000-0000-0000-0000-000000000018",
    apt7p1: "80000000-0000-0000-0000-000000000019",
    apt7p2: "80000000-0000-0000-0000-000000000020",
    apt7p3: "80000000-0000-0000-0000-000000000021",
    apt8p1: "80000000-0000-0000-0000-000000000022",
    apt8p2: "80000000-0000-0000-0000-000000000023",
    apt8p3: "80000000-0000-0000-0000-000000000024",
    apt9p1: "80000000-0000-0000-0000-000000000025",
    apt9p2: "80000000-0000-0000-0000-000000000026",
    apt9p3: "80000000-0000-0000-0000-000000000027",
    apt10p1: "80000000-0000-0000-0000-000000000028",
    apt10p2: "80000000-0000-0000-0000-000000000029",
    apt10p3: "80000000-0000-0000-0000-000000000030",
    apt11p1: "80000000-0000-0000-0000-000000000031",
    apt11p2: "80000000-0000-0000-0000-000000000032",
    apt11p3: "80000000-0000-0000-0000-000000000033",
  },
  messages: {
    m1: "60000000-0000-0000-0000-000000000001",
    m2: "60000000-0000-0000-0000-000000000002",
  },
  notifications: {
    n1: "70000000-0000-0000-0000-000000000001",
    n2: "70000000-0000-0000-0000-000000000002",
    n3: "70000000-0000-0000-0000-000000000003",
  },
};

function addDays(days) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d;
}

function createRng(seed) {
  let s = seed >>> 0;
  return function () {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function randInt(rng, min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function pad12(n) {
  return String(n).padStart(12, "0");
}

async function main() {
  console.log("Seeding baze podataka...");

  const adminPassword = await bcrypt.hash("admin123456", 12);
  const demoPassword = await bcrypt.hash("password123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@apartmani.hr" },
    update: {
      firstName: "Admin",
      lastName: "Apartmani",
      role: "ADMIN",
      passwordHash: adminPassword,
    },
    create: {
      email: "admin@apartmani.hr",
      passwordHash: adminPassword,
      firstName: "Admin",
      lastName: "Apartmani",
      role: "ADMIN",
      phone: "+385910000001",
    },
  });

  const owner1 = await prisma.user.upsert({
    where: { email: "iva.vlasnik@apartmani.hr" },
    update: {
      firstName: "Iva",
      lastName: "Vlasnik",
      role: "OWNER",
      passwordHash: demoPassword,
      phone: "+385910000002",
    },
    create: {
      email: "iva.vlasnik@apartmani.hr",
      passwordHash: demoPassword,
      firstName: "Iva",
      lastName: "Vlasnik",
      role: "OWNER",
      phone: "+385910000002",
    },
  });

  const owner2 = await prisma.user.upsert({
    where: { email: "marko.iznajmljivac@apartmani.hr" },
    update: {
      firstName: "Marko",
      lastName: "Iznajmljivač",
      role: "OWNER",
      passwordHash: demoPassword,
      phone: "+385910000003",
    },
    create: {
      email: "marko.iznajmljivac@apartmani.hr",
      passwordHash: demoPassword,
      firstName: "Marko",
      lastName: "Iznajmljivač",
      role: "OWNER",
      phone: "+385910000003",
    },
  });

  const owner3 = await prisma.user.upsert({
    where: { email: "julia.vlasnik@apartmani.hr" },
    update: {
      firstName: "Julia",
      lastName: "Vlasnik",
      role: "OWNER",
      passwordHash: demoPassword,
      phone: "+421900000001",
    },
    create: {
      email: "julia.vlasnik@apartmani.hr",
      passwordHash: demoPassword,
      firstName: "Julia",
      lastName: "Vlasnik",
      role: "OWNER",
      phone: "+421900000001",
    },
  });

  const guest1 = await prisma.user.upsert({
    where: { email: "ana.gost@apartmani.hr" },
    update: {
      firstName: "Ana",
      lastName: "Gost",
      role: "GUEST",
      passwordHash: demoPassword,
      phone: "+385910000004",
    },
    create: {
      email: "ana.gost@apartmani.hr",
      passwordHash: demoPassword,
      firstName: "Ana",
      lastName: "Gost",
      role: "GUEST",
      phone: "+385910000004",
    },
  });

  const guest2 = await prisma.user.upsert({
    where: { email: "ivan.putnik@apartmani.hr" },
    update: {
      firstName: "Ivan",
      lastName: "Putnik",
      role: "GUEST",
      passwordHash: demoPassword,
      phone: "+385910000005",
    },
    create: {
      email: "ivan.putnik@apartmani.hr",
      passwordHash: demoPassword,
      firstName: "Ivan",
      lastName: "Putnik",
      role: "GUEST",
      phone: "+385910000005",
    },
  });

  const guest3 = await prisma.user.upsert({
    where: { email: "petar.turist@apartmani.hr" },
    update: {
      firstName: "Petar",
      lastName: "Turist",
      role: "GUEST",
      passwordHash: demoPassword,
      phone: "+385910000006",
    },
    create: {
      email: "petar.turist@apartmani.hr",
      passwordHash: demoPassword,
      firstName: "Petar",
      lastName: "Turist",
      role: "GUEST",
      phone: "+385910000006",
    },
  });

  const guest4 = await prisma.user.upsert({
    where: { email: "maria.povremeni@apartmani.hr" },
    update: {
      firstName: "Maria",
      lastName: "Povremeni",
      role: "GUEST",
      passwordHash: demoPassword,
      phone: "+385910000007",
    },
    create: {
      email: "maria.povremeni@apartmani.hr",
      passwordHash: demoPassword,
      firstName: "Maria",
      lastName: "Povremeni",
      role: "GUEST",
      phone: "+385910000007",
    },
  });

  const guest5 = await prisma.user.upsert({
    where: { email: "tomas.izlet@apartmani.hr" },
    update: {
      firstName: "Tomas",
      lastName: "Izlet",
      role: "GUEST",
      passwordHash: demoPassword,
      phone: "+385910000008",
    },
    create: {
      email: "tomas.izlet@apartmani.hr",
      passwordHash: demoPassword,
      firstName: "Tomas",
      lastName: "Izlet",
      role: "GUEST",
      phone: "+385910000008",
    },
  });

  const owner4 = await prisma.user.upsert({
    where: { email: "petar.domac@apartmani.hr" },
    update: {
      firstName: "Petar",
      lastName: "Domać",
      role: "OWNER",
      passwordHash: demoPassword,
      phone: "+385910000009",
    },
    create: {
      email: "petar.domac@apartmani.hr",
      passwordHash: demoPassword,
      firstName: "Petar",
      lastName: "Domać",
      role: "OWNER",
      phone: "+385910000009",
    },
  });

  const owner5 = await prisma.user.upsert({
    where: { email: "elena.vlasnica@apartmani.hr" },
    update: {
      firstName: "Elena",
      lastName: "Vlasnica",
      role: "OWNER",
      passwordHash: demoPassword,
      phone: "+385910000010",
    },
    create: {
      email: "elena.vlasnica@apartmani.hr",
      passwordHash: demoPassword,
      firstName: "Elena",
      lastName: "Vlasnica",
      role: "OWNER",
      phone: "+385910000010",
    },
  });

  const contents = [
    { name: "WiFi", icon: "wifi" },
    { name: "Parking", icon: "parking" },
    { name: "Klima uređaj", icon: "air-condition" },
    { name: "Bazen", icon: "pool" },
    { name: "Plaža u blizini", icon: "beach" },
    { name: "Kuhinja", icon: "kitchen" },
    { name: "Perilica rublja", icon: "washer" },
    { name: "TV", icon: "tv" },
    { name: "Balkon/Terasa", icon: "balcony" },
    { name: "Roštilj", icon: "bbq" },
    { name: "Ljubimci OK", icon: "pets" },
    { name: "Bicikli", icon: "bike" },
  ];

  for (const content of contents) {
    const existing = await prisma.content.findFirst({
      where: { name: content.name, apartmentId: null },
    });
    if (!existing) {
      await prisma.content.create({ data: content });
    }
  }

  const contentMap = Object.fromEntries(
    (await prisma.content.findMany()).map((content) => [
      content.name,
      content.id,
    ]),
  );

  const apartments = [
    {
      id: IDS.apartments.apt1,
      ownerId: owner1.id,
      title: "Sunset Apartment Split",
      description:
        "Prostran apartman s pogledom na more, blizu centra i rive. Idealan za obitelji i duže boravke.",
      city: "Split",
      country: "Hrvatska",
      address: "Ulica Kralja Zvonimira 12",
      latitude: 43.508133,
      longitude: 16.440193,
      pricePerNight: 95,
      maxGuests: 4,
      minNights: 2,
      cancellationPolicy: "MODERATE",
      status: "APPROVED",
    },
    {
      id: IDS.apartments.apt2,
      ownerId: owner2.id,
      title: "Old Town Studio Dubrovnik",
      description:
        "Moderan studio unutar zidina starog grada. Idealan za parove i city-break putovanja.",
      city: "Dubrovnik",
      country: "Hrvatska",
      address: "Prijeko 24",
      latitude: 42.640663,
      longitude: 18.109453,
      pricePerNight: 120,
      maxGuests: 2,
      minNights: 3,
      cancellationPolicy: "STRICT",
      status: "APPROVED",
    },
    {
      id: IDS.apartments.apt3,
      ownerId: owner1.id,
      title: "Zagreb Business Flat",
      description:
        "Funkcionalan apartman u blizini poslovne zone i javnog prijevoza. Pogodno za poslovne goste.",
      city: "Zagreb",
      country: "Hrvatska",
      address: "Savska cesta 100",
      latitude: 45.804375,
      longitude: 15.971052,
      pricePerNight: 80,
      maxGuests: 3,
      minNights: 1,
      cancellationPolicy: "FLEXIBLE",
      status: "PENDING",
    },
    {
      id: IDS.apartments.apt4,
      ownerId: owner3.id,
      title: "Ostrava Magic House",
      description:
        "Čarobni kuća u srcu Ostrave s prekrasnim vrtom i modernim uređajima. Savršena za obiteljski odmor.",
      city: "Ostrava",
      country: "Slovačka",
      address: "Hlavná 42",
      latitude: 49.8343,
      longitude: 18.2825,
      pricePerNight: 85,
      maxGuests: 6,
      minNights: 2,
      cancellationPolicy: "MODERATE",
      status: "APPROVED",
    },
    {
      id: IDS.apartments.apt5,
      ownerId: owner2.id,
      title: "Rijeka Sea View",
      description:
        "Apartman s prekrasnim pogledom na Kvarnerski zaljev. Blizu plaže i restorana.",
      city: "Rijeka",
      country: "Hrvatska",
      address: "Korzo 15",
      latitude: 45.3275,
      longitude: 14.4424,
      pricePerNight: 75,
      maxGuests: 4,
      minNights: 2,
      cancellationPolicy: "FLEXIBLE",
      status: "APPROVED",
    },
    {
      id: IDS.apartments.apt6,
      ownerId: owner3.id,
      title: "Zadar Early Bird",
      description:
        "Lijep apartman u srcu Zadra, blizu rive i svih znamenitosti. Savršen za rano buđenje i istraživanje grada.",
      city: "Zadar",
      country: "Hrvatska",
      address: "Špire Šimunića 5",
      latitude: 44.1194,
      longitude: 15.2314,
      pricePerNight: 85,
      maxGuests: 4,
      minNights: 2,
      cancellationPolicy: "FLEXIBLE",
      status: "APPROVED",
    },
    {
      id: IDS.apartments.apt7,
      ownerId: owner1.id,
      title: "Osijek Riverside",
      description:
        "Apartman s pogledom na Dravu, mirna lokacija ali blizu centra. Idealan za opuštanje.",
      city: "Osijek",
      country: "Hrvatska",
      address: "Trg Sv. Trojstva 8",
      latitude: 45.5511,
      longitude: 18.6939,
      pricePerNight: 70,
      maxGuests: 4,
      minNights: 2,
      cancellationPolicy: "MODERATE",
      status: "APPROVED",
    },
    {
      id: IDS.apartments.apt8,
      ownerId: owner4.id,
      title: "Pula Roman View",
      description:
        "Apartman s pogledom na rimski amfiteatar, u srcu Pule. Istorija i moderni komfor u jednom.",
      city: "Pula",
      country: "Hrvatska",
      address: "Flavijevska 12",
      latitude: 44.8666,
      longitude: 13.8496,
      pricePerNight: 88,
      maxGuests: 3,
      minNights: 2,
      cancellationPolicy: "MODERATE",
      status: "APPROVED",
    },
    {
      id: IDS.apartments.apt9,
      ownerId: owner4.id,
      title: "Šibenik Coastal Retreat",
      description:
        "Obalni apartman u Šibeniku, blizu Krke katedrale. Savršen za ljubitelje mora i kulture.",
      city: "Šibenik",
      country: "Hrvatska",
      address: "Obala pape Ivana Pavla II 15",
      latitude: 43.7344,
      longitude: 15.8946,
      pricePerNight: 82,
      maxGuests: 5,
      minNights: 3,
      cancellationPolicy: "STRICT",
      status: "APPROVED",
    },
    {
      id: IDS.apartments.apt10,
      ownerId: owner5.id,
      title: "Varaždin Castle Stay",
      description:
        "Apartman u blizini starog grada Varaždina, s pogledom na dvorac. Romantična i mirna lokacija.",
      city: "Varaždin",
      country: "Hrvatska",
      address: "Franjevački trg 3",
      latitude: 46.3123,
      longitude: 16.3382,
      pricePerNight: 75,
      maxGuests: 3,
      minNights: 1,
      cancellationPolicy: "FLEXIBLE",
      status: "APPROVED",
    },
    {
      id: IDS.apartments.apt11,
      ownerId: owner5.id,
      title: "Karlovac Wellness",
      description:
        "Apartman u Karlovcu, blizu parkova i rekreacijskih zona. Opuštajuće okruženje za duži boravak.",
      city: "Karlovac",
      country: "Hrvatska",
      address: "Ban Jelačić 22",
      latitude: 45.4929,
      longitude: 15.5553,
      pricePerNight: 68,
      maxGuests: 4,
      minNights: 2,
      cancellationPolicy: "MODERATE",
      status: "APPROVED",
    },
  ];

  for (const apartment of apartments) {
    await prisma.apartment.upsert({
      where: { id: apartment.id },
      update: apartment,
      create: apartment,
    });
  }

  const apartmentContents = [
    [IDS.apartments.apt1, "WiFi"],
    [IDS.apartments.apt1, "Parking"],
    [IDS.apartments.apt1, "Klima uređaj"],
    [IDS.apartments.apt1, "Kuhinja"],
    [IDS.apartments.apt1, "Balkon/Terasa"],
    [IDS.apartments.apt2, "WiFi"],
    [IDS.apartments.apt2, "Klima uređaj"],
    [IDS.apartments.apt2, "TV"],
    [IDS.apartments.apt2, "Plaža u blizini"],
    [IDS.apartments.apt3, "WiFi"],
    [IDS.apartments.apt3, "Parking"],
    [IDS.apartments.apt3, "Perilica rublja"],
    [IDS.apartments.apt3, "TV"],
    [IDS.apartments.apt4, "WiFi"],
    [IDS.apartments.apt4, "Parking"],
    [IDS.apartments.apt4, "Klima uređaj"],
    [IDS.apartments.apt4, "Kuhinja"],
    [IDS.apartments.apt4, "Bazen"],
    [IDS.apartments.apt4, "Roštilj"],
    [IDS.apartments.apt5, "WiFi"],
    [IDS.apartments.apt5, "Klima uređaj"],
    [IDS.apartments.apt5, "Kuhinja"],
    [IDS.apartments.apt5, "Balkon/Terasa"],
    [IDS.apartments.apt5, "Plaža u blizini"],
    [IDS.apartments.apt6, "WiFi"],
    [IDS.apartments.apt6, "Klima uređaj"],
    [IDS.apartments.apt6, "TV"],
    [IDS.apartments.apt6, "Kuhinja"],
    [IDS.apartments.apt6, "Perilica rublja"],
    [IDS.apartments.apt7, "WiFi"],
    [IDS.apartments.apt7, "Parking"],
    [IDS.apartments.apt7, "Klima uređaj"],
    [IDS.apartments.apt7, "Kuhinja"],
    [IDS.apartments.apt7, "Balkon/Terasa"],
    [IDS.apartments.apt8, "WiFi"],
    [IDS.apartments.apt8, "Klima uređaj"],
    [IDS.apartments.apt8, "TV"],
    [IDS.apartments.apt8, "Kuhinja"],
    [IDS.apartments.apt8, "Balkon/Terasa"],
    [IDS.apartments.apt9, "WiFi"],
    [IDS.apartments.apt9, "Parking"],
    [IDS.apartments.apt9, "Klima uređaj"],
    [IDS.apartments.apt9, "Kuhinja"],
    [IDS.apartments.apt9, "Plaža u blizini"],
    [IDS.apartments.apt9, "Roštilj"],
    [IDS.apartments.apt10, "WiFi"],
    [IDS.apartments.apt10, "Parking"],
    [IDS.apartments.apt10, "Klima uređaj"],
    [IDS.apartments.apt10, "Kuhinja"],
    [IDS.apartments.apt10, "TV"],
    [IDS.apartments.apt11, "WiFi"],
    [IDS.apartments.apt11, "Parking"],
    [IDS.apartments.apt11, "Klima uređaj"],
    [IDS.apartments.apt11, "Kuhinja"],
    [IDS.apartments.apt11, "Perilica rublja"],
    [IDS.apartments.apt11, "Bicikli"],
  ];

  for (const [apartmentId, contentName] of apartmentContents) {
    const contentId = contentMap[contentName];
    if (!contentId) continue;

    await prisma.apartmentContent.upsert({
      where: { apartmentId_contentId: { apartmentId, contentId } },
      update: {},
      create: { apartmentId, contentId },
    });
  }

  const photoDefinitions = [
    {
      id: IDS.photos.apt1p1,
      apartmentId: IDS.apartments.apt1,
      file: "seed-apt1-1.jpeg",
      displayOrder: 0,
    },
    {
      id: IDS.photos.apt1p2,
      apartmentId: IDS.apartments.apt1,
      file: "seed-apt1-2.jfif",
      displayOrder: 1,
    },
    {
      id: IDS.photos.apt1p3,
      apartmentId: IDS.apartments.apt1,
      file: "seed-apt1-3.jfif",
      displayOrder: 2,
    },
    {
      id: IDS.photos.apt2p1,
      apartmentId: IDS.apartments.apt2,
      file: "seed-apt2-1.webpg",
      displayOrder: 0,
    },
    {
      id: IDS.photos.apt2p2,
      apartmentId: IDS.apartments.apt2,
      file: "seed-apt2-2.jfif",
      displayOrder: 1,
    },
    {
      id: IDS.photos.apt2p3,
      apartmentId: IDS.apartments.apt2,
      file: "seed-apt1-1.jpeg",
      displayOrder: 2,
    },
    {
      id: IDS.photos.apt3p1,
      apartmentId: IDS.apartments.apt3,
      file: "seed-apt3-1.webpg",
      displayOrder: 0,
    },
    {
      id: IDS.photos.apt3p2,
      apartmentId: IDS.apartments.apt3,
      file: "seed-apt1-2.jfif",
      displayOrder: 1,
    },
    {
      id: IDS.photos.apt3p3,
      apartmentId: IDS.apartments.apt3,
      file: "seed-apt2-1.webpg",
      displayOrder: 2,
    },
    {
      id: IDS.photos.apt4p1,
      apartmentId: IDS.apartments.apt4,
      file: "seed-apt1-3.jfif",
      displayOrder: 0,
    },
    {
      id: IDS.photos.apt4p2,
      apartmentId: IDS.apartments.apt4,
      file: "seed-apt2-2.jfif",
      displayOrder: 1,
    },
    {
      id: IDS.photos.apt4p3,
      apartmentId: IDS.apartments.apt4,
      file: "seed-apt3-1.webpg",
      displayOrder: 2,
    },
    {
      id: IDS.photos.apt5p1,
      apartmentId: IDS.apartments.apt5,
      file: "seed-apt1-1.jpeg",
      displayOrder: 0,
    },
    {
      id: IDS.photos.apt5p2,
      apartmentId: IDS.apartments.apt5,
      file: "seed-apt2-1.webpg",
      displayOrder: 1,
    },
    {
      id: IDS.photos.apt5p3,
      apartmentId: IDS.apartments.apt5,
      file: "seed-apt1-2.jfif",
      displayOrder: 2,
    },
    {
      id: IDS.photos.apt6p1,
      apartmentId: IDS.apartments.apt6,
      file: "seed-apt3-1.webpg",
      displayOrder: 0,
    },
    {
      id: IDS.photos.apt6p2,
      apartmentId: IDS.apartments.apt6,
      file: "seed-apt1-3.jfif",
      displayOrder: 1,
    },
    {
      id: IDS.photos.apt6p3,
      apartmentId: IDS.apartments.apt6,
      file: "seed-apt2-2.jfif",
      displayOrder: 2,
    },
    {
      id: IDS.photos.apt7p1,
      apartmentId: IDS.apartments.apt7,
      file: "seed-apt1-1.jpeg",
      displayOrder: 0,
    },
    {
      id: IDS.photos.apt7p2,
      apartmentId: IDS.apartments.apt7,
      file: "seed-apt2-1.webpg",
      displayOrder: 1,
    },
    {
      id: IDS.photos.apt7p3,
      apartmentId: IDS.apartments.apt7,
      file: "seed-apt3-1.webpg",
      displayOrder: 2,
    },
    {
      id: IDS.photos.apt8p1,
      apartmentId: IDS.apartments.apt8,
      file: "seed-apt1-2.jfif",
      displayOrder: 0,
    },
    {
      id: IDS.photos.apt8p2,
      apartmentId: IDS.apartments.apt8,
      file: "seed-apt2-2.jfif",
      displayOrder: 1,
    },
    {
      id: IDS.photos.apt8p3,
      apartmentId: IDS.apartments.apt8,
      file: "seed-apt1-3.jfif",
      displayOrder: 2,
    },
    {
      id: IDS.photos.apt9p1,
      apartmentId: IDS.apartments.apt9,
      file: "seed-apt3-1.webpg",
      displayOrder: 0,
    },
    {
      id: IDS.photos.apt9p2,
      apartmentId: IDS.apartments.apt9,
      file: "seed-apt1-1.jpeg",
      displayOrder: 1,
    },
    {
      id: IDS.photos.apt9p3,
      apartmentId: IDS.apartments.apt9,
      file: "seed-apt2-1.webpg",
      displayOrder: 2,
    },
    {
      id: IDS.photos.apt10p1,
      apartmentId: IDS.apartments.apt10,
      file: "seed-apt1-2.jfif",
      displayOrder: 0,
    },
    {
      id: IDS.photos.apt10p2,
      apartmentId: IDS.apartments.apt10,
      file: "seed-apt3-1.webpg",
      displayOrder: 1,
    },
    {
      id: IDS.photos.apt10p3,
      apartmentId: IDS.apartments.apt10,
      file: "seed-apt2-2.jfif",
      displayOrder: 2,
    },
    {
      id: IDS.photos.apt11p1,
      apartmentId: IDS.apartments.apt11,
      file: "seed-apt1-3.jfif",
      displayOrder: 0,
    },
    {
      id: IDS.photos.apt11p2,
      apartmentId: IDS.apartments.apt11,
      file: "seed-apt1-1.jpeg",
      displayOrder: 1,
    },
    {
      id: IDS.photos.apt11p3,
      apartmentId: IDS.apartments.apt11,
      file: "seed-apt2-1.webpg",
      displayOrder: 2,
    },
  ];

  for (const definition of photoDefinitions) {
    const url = `/uploads/apartments/${definition.file}`;
    const photo = {
      id: definition.id,
      apartmentId: definition.apartmentId,
      url,
      displayOrder: definition.displayOrder,
    };

    await prisma.apartmentPhoto.upsert({
      where: { id: photo.id },
      update: photo,
      create: photo,
    });
  }

  const blocks = [
    {
      id: IDS.blocks.b1,
      apartmentId: IDS.apartments.apt1,
      startDate: addDays(10),
      endDate: addDays(12),
      reason: "Servis klima uređaja",
    },
    {
      id: IDS.blocks.b2,
      apartmentId: IDS.apartments.apt2,
      startDate: addDays(25),
      endDate: addDays(28),
      reason: "Privatno korištenje apartmana",
    },
  ];

  for (const block of blocks) {
    await prisma.availabilityBlock.upsert({
      where: { id: block.id },
      update: block,
      create: block,
    });
  }

  const reservations = [
    // Apartment 1 - 5 completed past reservations
    {
      id: IDS.reservations.r1,
      apartmentId: IDS.apartments.apt1,
      guestId: guest1.id,
      checkIn: addDays(-60),
      checkOut: addDays(-55),
      numGuests: 2,
      totalPrice: 475,
      status: "COMPLETED",
    },
    {
      id: IDS.reservations.r2,
      apartmentId: IDS.apartments.apt1,
      guestId: guest2.id,
      checkIn: addDays(-45),
      checkOut: addDays(-40),
      numGuests: 3,
      totalPrice: 475,
      status: "COMPLETED",
    },
    {
      id: IDS.reservations.r3,
      apartmentId: IDS.apartments.apt1,
      guestId: guest3.id,
      checkIn: addDays(-30),
      checkOut: addDays(-25),
      numGuests: 4,
      totalPrice: 475,
      status: "COMPLETED",
    },
    {
      id: IDS.reservations.r4,
      apartmentId: IDS.apartments.apt1,
      guestId: guest4.id,
      checkIn: addDays(-20),
      checkOut: addDays(-16),
      numGuests: 2,
      totalPrice: 380,
      status: "COMPLETED",
    },
    {
      id: IDS.reservations.r5,
      apartmentId: IDS.apartments.apt1,
      guestId: guest5.id,
      checkIn: addDays(-10),
      checkOut: addDays(-5),
      numGuests: 3,
      totalPrice: 475,
      status: "COMPLETED",
    },
    // Apartment 2 - 5 completed past reservations
    {
      id: IDS.reservations.r6,
      apartmentId: IDS.apartments.apt2,
      guestId: guest1.id,
      checkIn: addDays(-55),
      checkOut: addDays(-50),
      numGuests: 2,
      totalPrice: 600,
      status: "COMPLETED",
    },
    {
      id: IDS.reservations.r7,
      apartmentId: IDS.apartments.apt2,
      guestId: guest2.id,
      checkIn: addDays(-40),
      checkOut: addDays(-35),
      numGuests: 2,
      totalPrice: 600,
      status: "COMPLETED",
    },
    {
      id: IDS.reservations.r8,
      apartmentId: IDS.apartments.apt2,
      guestId: guest3.id,
      checkIn: addDays(-25),
      checkOut: addDays(-20),
      numGuests: 2,
      totalPrice: 600,
      status: "COMPLETED",
    },
    {
      id: IDS.reservations.r9,
      apartmentId: IDS.apartments.apt2,
      guestId: guest4.id,
      checkIn: addDays(-15),
      checkOut: addDays(-10),
      numGuests: 2,
      totalPrice: 600,
      status: "COMPLETED",
    },
    {
      id: IDS.reservations.r10,
      apartmentId: IDS.apartments.apt2,
      guestId: guest5.id,
      checkIn: addDays(-8),
      checkOut: addDays(-5),
      numGuests: 2,
      totalPrice: 360,
      status: "COMPLETED",
    },
    // Apartment 3 - 5 completed past reservations
    {
      id: IDS.reservations.r11,
      apartmentId: IDS.apartments.apt3,
      guestId: guest1.id,
      checkIn: addDays(-50),
      checkOut: addDays(-45),
      numGuests: 2,
      totalPrice: 400,
      status: "COMPLETED",
    },
    {
      id: IDS.reservations.r12,
      apartmentId: IDS.apartments.apt3,
      guestId: guest2.id,
      checkIn: addDays(-35),
      checkOut: addDays(-30),
      numGuests: 3,
      totalPrice: 400,
      status: "COMPLETED",
    },
    {
      id: IDS.reservations.r13,
      apartmentId: IDS.apartments.apt3,
      guestId: guest3.id,
      checkIn: addDays(-20),
      checkOut: addDays(-15),
      numGuests: 2,
      totalPrice: 400,
      status: "COMPLETED",
    },
    {
      id: IDS.reservations.r14,
      apartmentId: IDS.apartments.apt3,
      guestId: guest4.id,
      checkIn: addDays(-12),
      checkOut: addDays(-8),
      numGuests: 3,
      totalPrice: 320,
      status: "COMPLETED",
    },
    {
      id: IDS.reservations.r15,
      apartmentId: IDS.apartments.apt3,
      guestId: guest5.id,
      checkIn: addDays(-5),
      checkOut: addDays(-2),
      numGuests: 2,
      totalPrice: 240,
      status: "COMPLETED",
    },
    // Apartment 4 (Ostrava Magic House) - 5 completed past reservations
    {
      id: IDS.reservations.r16,
      apartmentId: IDS.apartments.apt4,
      guestId: guest1.id,
      checkIn: addDays(-45),
      checkOut: addDays(-40),
      numGuests: 4,
      totalPrice: 425,
      status: "COMPLETED",
    },
    {
      id: IDS.reservations.r17,
      apartmentId: IDS.apartments.apt4,
      guestId: guest2.id,
      checkIn: addDays(-30),
      checkOut: addDays(-25),
      numGuests: 6,
      totalPrice: 425,
      status: "COMPLETED",
    },
    {
      id: IDS.reservations.r18,
      apartmentId: IDS.apartments.apt4,
      guestId: guest3.id,
      checkIn: addDays(-20),
      checkOut: addDays(-15),
      numGuests: 5,
      totalPrice: 425,
      status: "COMPLETED",
    },
    {
      id: IDS.reservations.r19,
      apartmentId: IDS.apartments.apt4,
      guestId: guest4.id,
      checkIn: addDays(-10),
      checkOut: addDays(-5),
      numGuests: 4,
      totalPrice: 425,
      status: "COMPLETED",
    },
    {
      id: IDS.reservations.r20,
      apartmentId: IDS.apartments.apt4,
      guestId: guest5.id,
      checkIn: addDays(-3),
      checkOut: addDays(0),
      numGuests: 6,
      totalPrice: 510,
      status: "COMPLETED",
    },
    // Apartment 5 - 5 completed past reservations
    {
      id: IDS.reservations.r21,
      apartmentId: IDS.apartments.apt5,
      guestId: guest1.id,
      checkIn: addDays(-40),
      checkOut: addDays(-35),
      numGuests: 3,
      totalPrice: 375,
      status: "COMPLETED",
    },
    {
      id: IDS.reservations.r22,
      apartmentId: IDS.apartments.apt5,
      guestId: guest2.id,
      checkIn: addDays(-25),
      checkOut: addDays(-20),
      numGuests: 4,
      totalPrice: 375,
      status: "COMPLETED",
    },
    {
      id: IDS.reservations.r23,
      apartmentId: IDS.apartments.apt5,
      guestId: guest3.id,
      checkIn: addDays(-18),
      checkOut: addDays(-13),
      numGuests: 2,
      totalPrice: 375,
      status: "COMPLETED",
    },
    {
      id: IDS.reservations.r24,
      apartmentId: IDS.apartments.apt5,
      guestId: guest4.id,
      checkIn: addDays(-9),
      checkOut: addDays(-5),
      numGuests: 3,
      totalPrice: 300,
      status: "COMPLETED",
    },
    {
      id: IDS.reservations.r25,
      apartmentId: IDS.apartments.apt5,
      guestId: guest5.id,
      checkIn: addDays(-4),
      checkOut: addDays(-1),
      numGuests: 4,
      totalPrice: 300,
      status: "COMPLETED",
    },
    // Apartment 6 (Zadar Early Bird) - 5 completed past reservations
    {
      id: IDS.reservations.r26,
      apartmentId: IDS.apartments.apt6,
      guestId: guest1.id,
      checkIn: addDays(-35),
      checkOut: addDays(-30),
      numGuests: 2,
      totalPrice: 425,
      status: "COMPLETED",
    },
    {
      id: IDS.reservations.r27,
      apartmentId: IDS.apartments.apt6,
      guestId: guest2.id,
      checkIn: addDays(-22),
      checkOut: addDays(-17),
      numGuests: 3,
      totalPrice: 425,
      status: "COMPLETED",
    },
    {
      id: IDS.reservations.r28,
      apartmentId: IDS.apartments.apt6,
      guestId: guest3.id,
      checkIn: addDays(-15),
      checkOut: addDays(-10),
      numGuests: 2,
      totalPrice: 425,
      status: "COMPLETED",
    },
    {
      id: IDS.reservations.r29,
      apartmentId: IDS.apartments.apt6,
      guestId: guest4.id,
      checkIn: addDays(-7),
      checkOut: addDays(-3),
      numGuests: 3,
      totalPrice: 340,
      status: "COMPLETED",
    },
    {
      id: IDS.reservations.r30,
      apartmentId: IDS.apartments.apt6,
      guestId: guest5.id,
      checkIn: addDays(-2),
      checkOut: addDays(0),
      numGuests: 2,
      totalPrice: 170,
      status: "COMPLETED",
    },
    // Apartment 7 (Osijek Riverside) - 5 completed past reservations
    {
      id: IDS.reservations.r31,
      apartmentId: IDS.apartments.apt7,
      guestId: guest1.id,
      checkIn: addDays(-38),
      checkOut: addDays(-33),
      numGuests: 3,
      totalPrice: 350,
      status: "COMPLETED",
    },
    {
      id: IDS.reservations.r32,
      apartmentId: IDS.apartments.apt7,
      guestId: guest2.id,
      checkIn: addDays(-28),
      checkOut: addDays(-23),
      numGuests: 4,
      totalPrice: 350,
      status: "COMPLETED",
    },
    {
      id: IDS.reservations.r33,
      apartmentId: IDS.apartments.apt7,
      guestId: guest3.id,
      checkIn: addDays(-18),
      checkOut: addDays(-13),
      numGuests: 2,
      totalPrice: 350,
      status: "COMPLETED",
    },
    {
      id: IDS.reservations.r34,
      apartmentId: IDS.apartments.apt7,
      guestId: guest4.id,
      checkIn: addDays(-10),
      checkOut: addDays(-6),
      numGuests: 3,
      totalPrice: 280,
      status: "COMPLETED",
    },
    {
      id: IDS.reservations.r35,
      apartmentId: IDS.apartments.apt7,
      guestId: guest5.id,
      checkIn: addDays(-3),
      checkOut: addDays(0),
      numGuests: 4,
      totalPrice: 280,
      status: "COMPLETED",
    },
    // Apartment 8 (Pula Roman View) - 5 completed past reservations
    {
      id: IDS.reservations.r36,
      apartmentId: IDS.apartments.apt8,
      guestId: guest1.id,
      checkIn: addDays(-42),
      checkOut: addDays(-37),
      numGuests: 2,
      totalPrice: 440,
      status: "COMPLETED",
    },
    {
      id: IDS.reservations.r37,
      apartmentId: IDS.apartments.apt8,
      guestId: guest2.id,
      checkIn: addDays(-32),
      checkOut: addDays(-27),
      numGuests: 3,
      totalPrice: 440,
      status: "COMPLETED",
    },
    {
      id: IDS.reservations.r38,
      apartmentId: IDS.apartments.apt8,
      guestId: guest3.id,
      checkIn: addDays(-22),
      checkOut: addDays(-17),
      numGuests: 2,
      totalPrice: 440,
      status: "COMPLETED",
    },
    {
      id: IDS.reservations.r39,
      apartmentId: IDS.apartments.apt8,
      guestId: guest4.id,
      checkIn: addDays(-12),
      checkOut: addDays(-8),
      numGuests: 3,
      totalPrice: 352,
      status: "COMPLETED",
    },
    {
      id: IDS.reservations.r40,
      apartmentId: IDS.apartments.apt8,
      guestId: guest5.id,
      checkIn: addDays(-4),
      checkOut: addDays(0),
      numGuests: 2,
      totalPrice: 176,
      status: "COMPLETED",
    },
    // Apartment 9 (Šibenik Coastal Retreat) - 5 completed past reservations
    {
      id: IDS.reservations.r41,
      apartmentId: IDS.apartments.apt9,
      guestId: guest1.id,
      checkIn: addDays(-44),
      checkOut: addDays(-39),
      numGuests: 4,
      totalPrice: 410,
      status: "COMPLETED",
    },
    {
      id: IDS.reservations.r42,
      apartmentId: IDS.apartments.apt9,
      guestId: guest2.id,
      checkIn: addDays(-34),
      checkOut: addDays(-29),
      numGuests: 5,
      totalPrice: 410,
      status: "COMPLETED",
    },
    {
      id: IDS.reservations.r43,
      apartmentId: IDS.apartments.apt9,
      guestId: guest3.id,
      checkIn: addDays(-24),
      checkOut: addDays(-19),
      numGuests: 3,
      totalPrice: 410,
      status: "COMPLETED",
    },
    {
      id: IDS.reservations.r44,
      apartmentId: IDS.apartments.apt9,
      guestId: guest4.id,
      checkIn: addDays(-14),
      checkOut: addDays(-10),
      numGuests: 4,
      totalPrice: 328,
      status: "COMPLETED",
    },
    {
      id: IDS.reservations.r45,
      apartmentId: IDS.apartments.apt9,
      guestId: guest5.id,
      checkIn: addDays(-5),
      checkOut: addDays(0),
      numGuests: 5,
      totalPrice: 410,
      status: "COMPLETED",
    },
    // Apartment 10 (Varaždin Castle Stay) - 5 completed past reservations
    {
      id: IDS.reservations.r46,
      apartmentId: IDS.apartments.apt10,
      guestId: guest1.id,
      checkIn: addDays(-36),
      checkOut: addDays(-31),
      numGuests: 2,
      totalPrice: 375,
      status: "COMPLETED",
    },
    {
      id: IDS.reservations.r47,
      apartmentId: IDS.apartments.apt10,
      guestId: guest2.id,
      checkIn: addDays(-26),
      checkOut: addDays(-21),
      numGuests: 3,
      totalPrice: 375,
      status: "COMPLETED",
    },
    {
      id: IDS.reservations.r48,
      apartmentId: IDS.apartments.apt10,
      guestId: guest3.id,
      checkIn: addDays(-16),
      checkOut: addDays(-11),
      numGuests: 2,
      totalPrice: 375,
      status: "COMPLETED",
    },
    {
      id: IDS.reservations.r49,
      apartmentId: IDS.apartments.apt10,
      guestId: guest4.id,
      checkIn: addDays(-8),
      checkOut: addDays(-4),
      numGuests: 3,
      totalPrice: 300,
      status: "COMPLETED",
    },
    {
      id: IDS.reservations.r50,
      apartmentId: IDS.apartments.apt10,
      guestId: guest5.id,
      checkIn: addDays(-2),
      checkOut: addDays(0),
      numGuests: 2,
      totalPrice: 150,
      status: "COMPLETED",
    },
    // Apartment 11 (Karlovac Wellness) - 5 completed past reservations
    {
      id: IDS.reservations.r51,
      apartmentId: IDS.apartments.apt11,
      guestId: guest1.id,
      checkIn: addDays(-40),
      checkOut: addDays(-35),
      numGuests: 3,
      totalPrice: 340,
      status: "COMPLETED",
    },
    {
      id: IDS.reservations.r52,
      apartmentId: IDS.apartments.apt11,
      guestId: guest2.id,
      checkIn: addDays(-30),
      checkOut: addDays(-25),
      numGuests: 4,
      totalPrice: 340,
      status: "COMPLETED",
    },
    {
      id: IDS.reservations.r53,
      apartmentId: IDS.apartments.apt11,
      guestId: guest3.id,
      checkIn: addDays(-20),
      checkOut: addDays(-15),
      numGuests: 2,
      totalPrice: 340,
      status: "COMPLETED",
    },
    {
      id: IDS.reservations.r54,
      apartmentId: IDS.apartments.apt11,
      guestId: guest4.id,
      checkIn: addDays(-10),
      checkOut: addDays(-6),
      numGuests: 3,
      totalPrice: 272,
      status: "COMPLETED",
    },
    {
      id: IDS.reservations.r55,
      apartmentId: IDS.apartments.apt11,
      guestId: guest5.id,
      checkIn: addDays(-3),
      checkOut: addDays(0),
      numGuests: 4,
      totalPrice: 272,
      status: "COMPLETED",
    },
    // Demo reservation: COMPLETED but no review (for demo)
    {
      id: IDS.reservations.r56,
      apartmentId: IDS.apartments.apt1,
      guestId: guest1.id,
      checkIn: addDays(-7),
      checkOut: addDays(-4),
      numGuests: 2,
      totalPrice: 285,
      status: "COMPLETED",
    },
  ];

  for (const reservation of reservations) {
    await prisma.reservation.upsert({
      where: { id: reservation.id },
      update: reservation,
      create: reservation,
    });
  }

  // Generirane dodatne rezervacije: nasumičan broj po apartmanu,
  // s nasumičnim datumima do ~5 godina unatrag. Deterministički
  // (seeded RNG + fiksni ID-ovi) kako bi seed ostao idempotentan.
  const priceByApartment = Object.fromEntries(
    apartments.map((a) => [a.id, a.pricePerNight]),
  );
  const maxGuestsByApartment = Object.fromEntries(
    apartments.map((a) => [a.id, a.maxGuests]),
  );
  const generatedGuestIds = [
    guest1.id,
    guest2.id,
    guest3.id,
    guest4.id,
    guest5.id,
  ];
  const reservationRng = createRng(987654321);
  let genCounter = 0;
  const generatedReservations = [];

  // Prozor rezerviran za ručno definirane rezervacije (travanj–srpanj 2026).
  // Generirane rezervacije koje upadnu u taj prozor pomičemo godinu dana
  // unatrag umjesto da ih izbacujemo, kako bi ukupan broj rezervacija
  // ostao nepromijenjen, a kurirani prozor bez dvostrukih rezervacija.
  const CURATED_WINDOW_START = new Date(Date.UTC(2026, 3, 1));
  const CURATED_WINDOW_END = new Date(Date.UTC(2026, 7, 1));

  for (const apartment of apartments) {
    const count = randInt(reservationRng, 8, 25);
    for (let i = 0; i < count; i++) {
      let startDaysAgo = randInt(reservationRng, 30, 1825);
      const nights = randInt(reservationRng, 2, 7);
      const pricePerNight = priceByApartment[apartment.id] || 80;
      const maxGuests = maxGuestsByApartment[apartment.id] || 4;

      if (
        addDays(-startDaysAgo) < CURATED_WINDOW_END &&
        addDays(-startDaysAgo + nights) > CURATED_WINDOW_START
      ) {
        startDaysAgo += 365;
      }

      genCounter += 1;
      generatedReservations.push({
        id: `41000000-0000-0000-0000-${pad12(genCounter)}`,
        apartmentId: apartment.id,
        guestId:
          generatedGuestIds[
            randInt(reservationRng, 0, generatedGuestIds.length - 1)
          ],
        checkIn: addDays(-startDaysAgo),
        checkOut: addDays(-startDaysAgo + nights),
        numGuests: randInt(reservationRng, 1, maxGuests),
        totalPrice: nights * pricePerNight,
        status: "COMPLETED",
      });
    }
  }

  for (const reservation of generatedReservations) {
    await prisma.reservation.upsert({
      where: { id: reservation.id },
      update: reservation,
      create: reservation,
    });
  }

  console.log(
    `Generirano dodatnih rezervacija: ${generatedReservations.length}`,
  );

  const reviewComments = [
    // Apartment 1 - 5-star heavy (excellent apartment)
    {
      rating: 5,
      comment: "Odlično! Sve je bilo savršeno.",
      ownerReply: "Hvala vam! Drago mi je da ste uživali.",
    },
    {
      rating: 5,
      comment: "Fantastično iskustvo, preporučujem!",
      ownerReply: "Hvala na preporuci!",
    },
    {
      rating: 5,
      comment: "Najbolji apartman u kojem sam bio.",
      ownerReply: "Vrlo laskavo, hvala!",
    },
    {
      rating: 5,
      comment: "Savršeno za obiteljski odmor.",
      ownerReply: "Hvala, čekamo vas ponovno!",
    },
    {
      rating: 4,
      comment: "Lijep apartman, blizu centra.",
      ownerReply: "Hvala na recenziji, dobrodošli ponovno!",
    },
    // Apartment 2 - mixed ratings (some issues)
    {
      rating: 5,
      comment: "Prekrasan pogled, čisto i uredno.",
      ownerReply: "Hvala na lijepim riječima!",
    },
    {
      rating: 4,
      comment: "Dobra lokacija, mirno okruženje.",
      ownerReply: "Hvala vam na recenziji.",
    },
    {
      rating: 3,
      comment: "Apartman je ok, ali WiFi je bio spor.",
      ownerReply: "Ispričavamo se na WiFi problemu, ćemo ga popraviti.",
    },
    {
      rating: 4,
      comment: "Sve je bilo u redu, preporučujem.",
      ownerReply: "Hvala na preporuci!",
    },
    {
      rating: 5,
      comment: "Vlasnik je vrlo ljubazan.",
      ownerReply: "Uvijek na usluzi!",
    },
    // Apartment 3 - mixed with one 1-star (problematic)
    {
      rating: 4,
      comment: "Dobro opremljen, sve što treba.",
      ownerReply: "Drago mi je da ste imali sve što vam treba.",
    },
    {
      rating: 5,
      comment: "Čisto, moderno i udobno.",
      ownerReply: "Hvala vam!",
    },
    {
      rating: 3,
      comment: "Klima je bila malo bučna.",
      ownerReply: "Ispričavamo se, provjerit ćemo klimu.",
    },
    {
      rating: 4,
      comment: "Lijepo mjesto, mirno i sigurno.",
      ownerReply: "Hvala na recenziji.",
    },
    {
      rating: 1,
      comment: "Apartman nije bio čist pri dolasku, razočaran sam.",
      ownerReply:
        "Ispričavamo se duboko, ovo nije standard. Kontaktirajte nas za refundaciju.",
    },
    // Apartment 4 - 5-star heavy (excellent)
    {
      rating: 5,
      comment: "Savršeno za parove.",
      ownerReply: "Hvala, veselimo se vašem povratku!",
    },
    {
      rating: 5,
      comment: "Čarobno mjesto, vraćamo se!",
      ownerReply: "Ne možemo dočekati!",
    },
    {
      rating: 5,
      comment: "Prekrasan vrt, djeca su oduševljena.",
      ownerReply: "Drago nam je da su djeca uživala!",
    },
    {
      rating: 5,
      comment: "Sve je bilo točno kao opisano.",
      ownerReply: "Hvala na povjerenju!",
    },
    {
      rating: 4,
      comment: "Sve je bilo super, hvala.",
      ownerReply: "Hvala vam na boravku!",
    },
    // Apartment 5 - mixed ratings
    {
      rating: 4,
      comment: "Dobar WiFi, parking je blizu.",
      ownerReply: "Hvala na povratnim informacijama.",
    },
    {
      rating: 5,
      comment: "Blizu plaže, vrlo pogodno.",
      ownerReply: "Lokacija je jedan od naših aduta!",
    },
    {
      rating: 3,
      comment: "Parking je malo teško pronaći.",
      ownerReply: "Radimo na poboljšanju parkinga.",
    },
    {
      rating: 4,
      comment: "Čisto i uredno, preporučujem.",
      ownerReply: "Hvala na preporuci!",
    },
    {
      rating: 5,
      comment: "Vlasnik je vrlo pristupačan.",
      ownerReply: "Uvijek rado pomognem!",
    },
    // Apartment 6 - 4-star heavy (good but not perfect)
    {
      rating: 4,
      comment: "Dobar klima uređaj, hvala.",
      ownerReply: "Klima je važna ljeti!",
    },
    {
      rating: 4,
      comment: "Dobar odnos cijene i kvalitete.",
      ownerReply: "Pokušavamo biti konkurentni!",
    },
    {
      rating: 5,
      comment: "Savršena lokacija za istraživanje.",
      ownerReply: "Hvala, centar je blizu!",
    },
    {
      rating: 4,
      comment: "Prekrasan interijer, moderan.",
      ownerReply: "Hvala na lijepim riječima!",
    },
    {
      rating: 4,
      comment: "Sve je bilo u redu, hvala.",
      ownerReply: "Hvala vam na boravku!",
    },
    // Apartment 7 - mixed with one 2-star
    {
      rating: 5,
      comment: "Vraćamo se svakako!",
      ownerReply: "Veselimo se!",
    },
    {
      rating: 4,
      comment: "Dobar parking, sigurno.",
      ownerReply: "Sigurnost je prioritet!",
    },
    {
      rating: 3,
      comment: "Kuhinja je malo stara.",
      ownerReply: "Planiramo renoviranje kuhinje.",
    },
    {
      rating: 4,
      comment: "Mirno okruženje, opuštajuće.",
      ownerReply: "Mir je ono što nudimo!",
    },
    {
      rating: 2,
      comment: "Buka iz ulice je bila veliki problem.",
      ownerReply: "Ispričavamo se, nudimo ušne za buduće goste.",
    },
    // Apartment 8 - 5-star heavy
    {
      rating: 5,
      comment: "Prekrasan pogled na rijeku.",
      ownerReply: "Pogled na Dravu je zaista poseban!",
    },
    {
      rating: 5,
      comment: "Vlasnik je vrlo ljubazan.",
      ownerReply: "Hvala, uvijek na usluzi!",
    },
    {
      rating: 5,
      comment: "Savršeno za opuštanje.",
      ownerReply: "Opuštanje je prioritet!",
    },
    {
      rating: 4,
      comment: "Dobra kuhinja, sve potrebno.",
      ownerReply: "Kuhinja je važna za duži boravak!",
    },
    {
      rating: 5,
      comment: "Prekrasan balkon, uživali smo.",
      ownerReply: "Balkon je omiljeno mjesto naših gostiju!",
    },
    // Apartment 9 - mixed ratings
    {
      rating: 4,
      comment: "Dobra komunikacija, hvala.",
      ownerReply: "Komunikacija je ključ!",
    },
    {
      rating: 3,
      comment: "Perilica je radila sporo.",
      ownerReply: "Ispričavamo se, servisirat ćemo perilicu.",
    },
    {
      rating: 4,
      comment: "Sve je bilo super, preporučujem.",
      ownerReply: "Hvala na preporuci!",
    },
    {
      rating: 5,
      comment: "Pogled na amfiteatar je nevjerojatan!",
      ownerReply: "Pogled je jedinstven, hvala!",
    },
    {
      rating: 4,
      comment: "Istorija i moderni komfor.",
      ownerReply: "Kombinacija koja funkcionira!",
    },
    // Apartment 10 - 3-4 star heavy (average)
    {
      rating: 4,
      comment: "Vlasnik je vrlo informativan.",
      ownerReply: "Rado dijelim lokalne informacije!",
    },
    {
      rating: 3,
      comment: "Apartman je malo mali za 4 osobe.",
      ownerReply: "Napomenuli smo kapacitet, hvala na povratnim informacijama.",
    },
    {
      rating: 4,
      comment: "Dobra lokacija, blizu svega.",
      ownerReply: "Sve je blizu!",
    },
    {
      rating: 3,
      comment: "TV je bio stari i mali.",
      ownerReply: "Planiramo zamjenu TV-a.",
    },
    {
      rating: 4,
      comment: "Prekrasan pogled na more.",
      ownerReply: "Morski pogled je neprocjenjiv!",
    },
    // Apartment 11 - mixed with one 1-star
    {
      rating: 4,
      comment: "Katedrala je blizu, čudesno.",
      ownerReply: "Lokacija je povijesna!",
    },
    {
      rating: 5,
      comment: "Roštilj je super, koristili smo.",
      ownerReply: "Roštilj je omiljen!",
    },
    {
      rating: 2,
      comment: "Vlasnik je bio neprijatan na komunikaciji.",
      ownerReply:
        "Ispričavamo se ako ste imali takvo iskustvo, radimo na poboljšanju komunikacije.",
    },
    {
      rating: 4,
      comment: "Plaža je blizu, pogodno.",
      ownerReply: "Plaža je na dohvat ruke!",
    },
    {
      rating: 1,
      comment: "Nema tople vode u kupaonici, neprihvatljivo.",
      ownerReply:
        "Ovo je ozbiljan problem, odmah ćemo ga riješiti. Kontaktirajte nas za refundaciju.",
    },
  ];

  const reviews = [];
  const reservationIds = Object.values(IDS.reservations);
  const reviewIds = Object.values(IDS.reviews);
  const apartmentIds = Object.values(IDS.apartments);
  const guestIds = [guest1.id, guest2.id, guest3.id, guest4.id, guest5.id];
  const ownerIds = [owner1.id, owner2.id, owner3.id, owner4.id, owner5.id];

  for (let i = 0; i < 55; i++) {
    const reservationId = reservationIds[i];
    const reviewId = reviewIds[i];
    const apartmentId = apartmentIds[Math.floor(i / 5)];
    const guestId = guestIds[i % 5];
    const reviewData = reviewComments[i];

    reviews.push({
      id: reviewId,
      reservationId,
      apartmentId,
      guestId,
      rating: reviewData.rating,
      comment: reviewData.comment,
      ownerReply: reviewData.ownerReply,
    });
  }

  for (const review of reviews) {
    await prisma.review.upsert({
      where: { id: review.id },
      update: review,
      create: review,
    });
  }

  // ---------------------------------------------------------------
  // Zadar Early Bird (apt6): 15 dodatnih COMPLETED rezervacija u
  // razdoblju travanj–srpanj 2026, svaka sa svojom recenzijom.
  // Ograničenja apartmana: max 4 gosta, min 2 noćenja.
  // ---------------------------------------------------------------
  const ZADAR_PRICE_PER_NIGHT = 85;

  function utcDate(year, month, day) {
    return new Date(Date.UTC(year, month - 1, day));
  }

  const zadarStays = [
    {
      seq: 1,
      guestId: guest1.id,
      checkIn: [2026, 4, 2],
      checkOut: [2026, 4, 5],
      numGuests: 2,
      rating: 5,
      comment:
        "Apartman izgleda točno kao na fotografijama. Riva i Pozdrav suncu su pet minuta hoda, a ulica je ujutro potpuno mirna. Krevet udoban, kuhinja odlično opremljena.",
      ownerReply:
        "Hvala vam na lijepim riječima! Drago mi je da ste iskoristili mirna jutra za šetnju do rive. Dobrodošli ponovno u Zadar!",
    },
    {
      seq: 2,
      guestId: guest2.id,
      checkIn: [2026, 4, 7],
      checkOut: [2026, 4, 9],
      numGuests: 1,
      rating: 4,
      comment:
        "Kratak poslovni boravak, sve je prošlo glatko. WiFi je stabilan, radni kutak koristan. Zamjerio bih jedino slabije osvjetljenje u dnevnom boravku navečer.",
      ownerReply:
        "Hvala na korisnoj primjedbi! Nabavili smo dodatnu podnu lampu pa je sada i večernje čitanje ugodnije.",
    },
    {
      seq: 3,
      guestId: guest3.id,
      checkIn: [2026, 4, 11],
      checkOut: [2026, 4, 17],
      numGuests: 4,
      rating: 5,
      comment:
        "Šest noćenja u četvero i nijedna zamjerka. Perilica rublja nam je bila spas nakon izleta na Kornate, a vlasnica nam je preporučila konobu koju sami sigurno ne bismo našli.",
      ownerReply:
        "Hvala vam! Rado dijelim svoje omiljene adrese s gostima. Veselim se vašem povratku.",
    },
    {
      seq: 4,
      guestId: guest4.id,
      checkIn: [2026, 4, 20],
      checkOut: [2026, 4, 24],
      numGuests: 3,
      rating: 3,
      comment:
        "Lokacija je izvrsna i apartman je čist, ali crkvena zvona i jutarnja dostava znaju probuditi. Za lakše spavače možda nije idealno.",
      ownerReply:
        "Hvala na iskrenoj recenziji. Stari grad je živ i rano ujutro, pa smo u apartman stavili set čepića za uši, a razmatramo i zvučnu izolaciju prozora.",
    },
    {
      seq: 5,
      guestId: guest5.id,
      checkIn: [2026, 4, 27],
      checkOut: [2026, 4, 30],
      numGuests: 2,
      rating: 5,
      comment:
        "Sve je funkcioniralo besprijekorno. Klima radi tiho, apartman je bio spreman prije dogovorenog termina, a parking smo bez problema našli u blizini.",
      ownerReply:
        "Hvala vam! Trudim se da apartman bude spreman ranije kad god je moguće. Dobrodošli opet!",
    },
    {
      seq: 6,
      guestId: guest1.id,
      checkIn: [2026, 5, 3],
      checkOut: [2026, 5, 10],
      numGuests: 4,
      rating: 4,
      comment:
        "Cijeli tjedan s obitelji i apartman je izdržao sve. Kuhinja ima sve potrebno za kuhanje, djeca su uživala. Jedna zvjezdica manje jer je televizor stvarno malen za dnevni boravak.",
      ownerReply:
        "Hvala na detaljnoj recenziji! Zamjena televizora je na popisu za ovu jesen.",
    },
    {
      seq: 7,
      guestId: guest2.id,
      checkIn: [2026, 5, 12],
      checkOut: [2026, 5, 14],
      numGuests: 2,
      rating: 5,
      comment:
        "Dvije noći na proputovanju, savršeno. Komunikacija prije dolaska bila je brza i jasna, ključevi u sefu, ulazak bez čekanja.",
      ownerReply:
        "Hvala! Uvijek se trudim da check-in prođe bez stresa, pogotovo kod kratkih boravaka.",
    },
    {
      seq: 8,
      guestId: guest3.id,
      checkIn: [2026, 5, 18],
      checkOut: [2026, 5, 23],
      numGuests: 3,
      rating: 1,
      comment:
        "Apartman pri dolasku nije bio očišćen — posuđe u sudoperu i stare plahte na krevetu. Čekali smo pola dana da se to riješi, a od pet noćenja prva je bila potpuno izgubljena.",
      ownerReply:
        "Duboko se ispričavam, ovo nije standard koji držim i preuzimam punu odgovornost. Promijenila sam servis za čišćenje i uvela provjeru prije svakog dolaska. Povrat za prvu noć je odobren.",
    },
    {
      seq: 9,
      guestId: guest4.id,
      checkIn: [2026, 5, 26],
      checkOut: [2026, 5, 30],
      numGuests: 4,
      rating: 4,
      comment:
        "Vrlo dobar odnos cijene i kvalitete za sam centar Zadra. Apartman je svijetao i prozračan. Vodi u tušu treba minuta da se zagrije, ali to je sitnica.",
      ownerReply:
        "Hvala vam na recenziji! Servisirali smo bojler pa topla voda sada stiže znatno brže.",
    },
    {
      seq: 10,
      guestId: guest5.id,
      checkIn: [2026, 6, 2],
      checkOut: [2026, 6, 5],
      numGuests: 1,
      rating: 5,
      comment:
        "Solo boravak i baš onako kako ime apartmana obećava — rano ustajanje, kava na balkonu i grad još prazan. Čistoća besprijekorna, plahte i ručnici kao novi.",
      ownerReply:
        "Hvala vam od srca! Čistoća mi je najvažnija stavka. Sretan put i vidimo se!",
    },
    {
      seq: 11,
      guestId: guest1.id,
      checkIn: [2026, 6, 9],
      checkOut: [2026, 6, 15],
      numGuests: 4,
      rating: 4,
      comment:
        "Odlična baza za istraživanje — sve znamenitosti pješice, trajektna luka blizu. Apartman miran unatoč centru. Malo nam je nedostajalo prostora za odlaganje kofera za četvero.",
      ownerReply:
        "Hvala na prijedlogu! Dodali smo ormar u hodniku kako bi kofere bilo gdje spremiti.",
    },
    {
      seq: 12,
      guestId: guest2.id,
      checkIn: [2026, 6, 18],
      checkOut: [2026, 6, 20],
      numGuests: 3,
      rating: 2,
      comment:
        "Klima uređaj je prestao raditi prve večeri, a lipanj je već bio vruć. Servis je došao tek sutradan popodne pa nam je od dvije noći jedna bila neupotrebljiva.",
      ownerReply:
        "Iskreno se ispričavam zbog kvara i zbog čekanja na servis. Klima je u međuvremenu zamijenjena novim uređajem, a povrat za tu noć sam vam odobrila. Hvala na strpljenju.",
    },
    {
      seq: 13,
      guestId: guest3.id,
      checkIn: [2026, 6, 23],
      checkOut: [2026, 6, 28],
      numGuests: 2,
      rating: 5,
      comment:
        "Pet noćenja i ne bismo mijenjali ništa. Novi klima uređaj hladi izvrsno, a vlasnica se javila tijekom boravka da provjeri treba li nam nešto.",
      ownerReply:
        "Puno hvala! Drago mi je da je novi uređaj opravdao očekivanja. Vrata su vam uvijek otvorena.",
    },
    {
      seq: 14,
      guestId: guest4.id,
      checkIn: [2026, 7, 1],
      checkOut: [2026, 7, 8],
      numGuests: 4,
      rating: 4,
      comment:
        "Tjedan dana usred sezone, sve pohvale za lokaciju i opremljenost. Jedino su ljetne večeri bučne zbog terasa ispod prozora, s djecom je to znalo smetati.",
      ownerReply:
        "Hvala na iskrenosti. Ljetne večeri u starom gradu su živahne pa to jasno napominjem u opisu; obiteljima s djecom rado dodijelim sobu u stražnjem, mirnijem dijelu.",
    },
    {
      seq: 15,
      guestId: guest5.id,
      checkIn: [2026, 7, 12],
      checkOut: [2026, 7, 16],
      numGuests: 3,
      rating: 5,
      comment:
        "Ljetni boravak iz snova. Apartman hladan i uredan, upute za dolazak automobilom jasne, a preporuke za plaže pun pogodak.",
      ownerReply:
        "Hvala vam! Upute smo nedavno dopunili fotografijama prilaza pa mi je drago da su pomogle. Dođite nam opet!",
    },
  ];

  const zadarReservations = [];
  const zadarReviews = [];

  for (const stay of zadarStays) {
    const checkIn = utcDate(...stay.checkIn);
    const checkOut = utcDate(...stay.checkOut);
    const nights = Math.round((checkOut - checkIn) / (24 * 60 * 60 * 1000));
    const reservationId = `42000000-0000-0000-0000-${pad12(stay.seq)}`;
    const reviewCreatedAt = new Date(checkOut);
    reviewCreatedAt.setUTCDate(reviewCreatedAt.getUTCDate() + 1);

    zadarReservations.push({
      id: reservationId,
      apartmentId: IDS.apartments.apt6,
      guestId: stay.guestId,
      checkIn,
      checkOut,
      numGuests: stay.numGuests,
      totalPrice: nights * ZADAR_PRICE_PER_NIGHT,
      status: "COMPLETED",
    });

    zadarReviews.push({
      id: `52000000-0000-0000-0000-${pad12(stay.seq)}`,
      reservationId,
      apartmentId: IDS.apartments.apt6,
      guestId: stay.guestId,
      rating: stay.rating,
      comment: stay.comment,
      ownerReply: stay.ownerReply,
      createdAt: reviewCreatedAt,
    });
  }

  for (const reservation of zadarReservations) {
    await prisma.reservation.upsert({
      where: { id: reservation.id },
      update: reservation,
      create: reservation,
    });
  }

  for (const review of zadarReviews) {
    await prisma.review.upsert({
      where: { id: review.id },
      update: review,
      create: review,
    });
  }

  console.log(
    `Zadar Early Bird (travanj–srpanj 2026): ${zadarReservations.length} rezervacija i ${zadarReviews.length} recenzija.`,
  );

  // ---------------------------------------------------------------
  // Ostali apartmani: po 15 dodatnih COMPLETED rezervacija u razdoblju
  // travanj–srpanj 2026, svaka sa svojom recenzijom gosta i odgovorom
  // vlasnika. Poštuju se ograničenja svakog apartmana (maxGuests,
  // minNights), a datumi unutar apartmana se ne preklapaju.
  // ---------------------------------------------------------------
  const curatedGroups = [
    {
      // Sunset Apartment Split - max 4 gosta, min 2 noćenja, 95 EUR/noć
      apartmentId: IDS.apartments.apt1,
      idOffset: 100,
      stays: [
        {
          guestId: guest1.id,
          checkIn: [2026, 4, 1],
          checkOut: [2026, 4, 4],
          numGuests: 2,
          rating: 5,
          comment:
            "Apartman je prostran i svijetao, a pogled na more s terase bio je vrhunac boravka. Do rive i Dioklecijanove palače stigli smo pješice za desetak minuta.",
          ownerReply:
            "Hvala vam! Terasa je i meni najdraži dio apartmana, dobrodošli ponovno.",
        },
        {
          guestId: guest2.id,
          checkIn: [2026, 4, 6],
          checkOut: [2026, 4, 9],
          numGuests: 4,
          rating: 5,
          comment:
            "Bili smo četvero i nikome nije bilo tijesno. Kuhinja je opremljena bolje nego kod kuće, a parking ispred zgrade je u Splitu ogroman plus.",
          ownerReply:
            "Hvala na recenziji! Parking je u Splitu zlata vrijedan, drago mi je da ste ga iskoristili.",
        },
        {
          guestId: guest3.id,
          checkIn: [2026, 4, 11],
          checkOut: [2026, 4, 16],
          numGuests: 3,
          rating: 4,
          comment:
            "Pet noćenja i sve pohvale za čistoću i komunikaciju. Jedina zamjerka je što se zvuk iz stubišta dobro čuje u hodniku.",
          ownerReply:
            "Hvala na povratnoj informaciji, ugradili smo brtvu na ulazna vrata pa je sada znatno tiše.",
        },
        {
          guestId: guest4.id,
          checkIn: [2026, 4, 18],
          checkOut: [2026, 4, 20],
          numGuests: 2,
          rating: 5,
          comment:
            "Kratak vikend, ali savršen. Check-in brz, apartman besprijekorno čist, a Bačvice su na par minuta hoda.",
          ownerReply: "Hvala vam! Vikend-gosti su uvijek dobrodošli.",
        },
        {
          guestId: guest5.id,
          checkIn: [2026, 4, 23],
          checkOut: [2026, 4, 28],
          numGuests: 4,
          rating: 5,
          comment:
            "Obiteljski odmor kakav smo željeli - dovoljno prostora, klima u svakoj sobi i pekara odmah iza ugla.",
          ownerReply: "Hvala! Drago mi je da su i najmlađi uživali.",
        },
        {
          guestId: guest1.id,
          checkIn: [2026, 4, 30],
          checkOut: [2026, 5, 4],
          numGuests: 2,
          rating: 4,
          comment:
            "Vrlo ugodan boravak, apartman odgovara opisu. Wi-Fi je povremeno znao zapeti kad smo oboje radili online.",
          ownerReply:
            "Hvala na primjedbi, prešli smo na brži paket i postavili novi router.",
        },
        {
          guestId: guest2.id,
          checkIn: [2026, 5, 7],
          checkOut: [2026, 5, 13],
          numGuests: 4,
          rating: 5,
          comment:
            "Tjedan dana u Splitu i apartman je bio idealna baza. Vlasnica nam je ostavila kartu grada i preporuke za izlete.",
          ownerReply: "Hvala vam! Rado pomognem oko planiranja izleta.",
        },
        {
          guestId: guest3.id,
          checkIn: [2026, 5, 15],
          checkOut: [2026, 5, 17],
          numGuests: 1,
          rating: 3,
          comment:
            "Lokacija i oprema su dobri, ali susjedno gradilište kreće s radom u sedam ujutro. Za kratak odmor mi to nije odgovaralo.",
          ownerReply:
            "Ispričavam se zbog buke, radovi su bili izvan moje kontrole i u međuvremenu su završeni.",
        },
        {
          guestId: guest4.id,
          checkIn: [2026, 5, 20],
          checkOut: [2026, 5, 25],
          numGuests: 3,
          rating: 5,
          comment:
            "Sve je bilo točno kako je opisano, bez ijednog iznenađenja. Terasa ujutro, more popodne - ne treba više.",
          ownerReply: "Hvala na lijepim riječima, veselim se vašem povratku!",
        },
        {
          guestId: guest5.id,
          checkIn: [2026, 5, 28],
          checkOut: [2026, 5, 31],
          numGuests: 2,
          rating: 4,
          comment:
            "Ugodan i čist apartman s odličnom lokacijom. Krevet bi mogao biti nešto mekši, ali to je stvar ukusa.",
          ownerReply: "Hvala na iskrenosti, dodali smo mekši nadmadrac.",
        },
        {
          guestId: guest1.id,
          checkIn: [2026, 6, 3],
          checkOut: [2026, 6, 9],
          numGuests: 4,
          rating: 5,
          comment:
            "Šest noćenja s prijateljima i sve je funkcioniralo. Perilica, klima, roštilj na terasi - ništa nije nedostajalo.",
          ownerReply:
            "Hvala vam! Društvo na terasi je ono zbog čega ovo radim.",
        },
        {
          guestId: guest2.id,
          checkIn: [2026, 6, 12],
          checkOut: [2026, 6, 14],
          numGuests: 2,
          rating: 2,
          comment:
            "Pri dolasku klima u spavaćoj sobi nije radila, a lipanjske noći su bile pretople za spavanje. Riješeno je tek zadnji dan.",
          ownerReply:
            "Iskreno se ispričavam zbog kvara i sporog servisa. Uređaj je zamijenjen, a dio iznosa vam je vraćen.",
        },
        {
          guestId: guest3.id,
          checkIn: [2026, 6, 17],
          checkOut: [2026, 6, 22],
          numGuests: 3,
          rating: 5,
          comment:
            "Novi klima uređaj radi savršeno, apartman je bio hladan i ugodan cijeli tjedan. Preporuka svima.",
          ownerReply:
            "Hvala! Drago mi je da se ulaganje u novi uređaj isplatilo.",
        },
        {
          guestId: guest4.id,
          checkIn: [2026, 6, 25],
          checkOut: [2026, 6, 30],
          numGuests: 4,
          rating: 4,
          comment:
            "Odličan smještaj za obitelj, blizu svega. U sezoni je gužva na plaži, ali to nije do apartmana.",
          ownerReply:
            "Hvala na recenziji! Za mirnije kupanje rado preporučim uvale malo dalje od centra.",
        },
        {
          guestId: guest5.id,
          checkIn: [2026, 7, 3],
          checkOut: [2026, 7, 10],
          numGuests: 4,
          rating: 4,
          comment:
            "Tjedan dana usred sezone, apartman je bio čist i dobro opremljen. Parkirno mjesto je uski manevar za veći auto.",
          ownerReply:
            "Hvala na napomeni, označili smo mjesto jasnije i dodali upute za parkiranje.",
        },
      ],
    },
    {
      // Old Town Studio Dubrovnik - max 2 gosta, min 3 noćenja, 120 EUR/noć
      apartmentId: IDS.apartments.apt2,
      idOffset: 200,
      stays: [
        {
          guestId: guest1.id,
          checkIn: [2026, 4, 2],
          checkOut: [2026, 4, 6],
          numGuests: 2,
          rating: 5,
          comment:
            "Studio je malen ali pametno riješen, a lokacija unutar zidina je neponovljiva. Ujutro smo Stradunom prošetali bez ijednog turista.",
          ownerReply: "Hvala vam! Rana jutra u starom gradu su najljepša.",
        },
        {
          guestId: guest2.id,
          checkIn: [2026, 4, 9],
          checkOut: [2026, 4, 13],
          numGuests: 2,
          rating: 4,
          comment:
            "Čisto, moderno i točno kako je opisano. Do studija vodi dosta stepenica, što treba znati ako nosite velike kofere.",
          ownerReply:
            "Hvala na recenziji, stepenice su cijena života unutar zidina pa sam ih naveo i u opisu.",
        },
        {
          guestId: guest3.id,
          checkIn: [2026, 4, 16],
          checkOut: [2026, 4, 20],
          numGuests: 1,
          rating: 5,
          comment:
            "Savršeno za solo putovanje. Tiho, čisto, a sve znamenitosti su na par minuta hoda.",
          ownerReply: "Hvala! Drago mi je da ste uživali u miru.",
        },
        {
          guestId: guest4.id,
          checkIn: [2026, 4, 23],
          checkOut: [2026, 4, 27],
          numGuests: 2,
          rating: 3,
          comment:
            "Studio je uredan, ali za četiri noćenja nam je nedostajalo prostora za odlaganje stvari. Kupaonica je vrlo skučena.",
          ownerReply:
            "Hvala na iskrenoj recenziji, dodao sam vješalice i policu, no kvadratura starog grada je nažalost ograničenje.",
        },
        {
          guestId: guest5.id,
          checkIn: [2026, 4, 30],
          checkOut: [2026, 5, 5],
          numGuests: 2,
          rating: 5,
          comment:
            "Prekrasan boravak. Vlasnik je izašao u susret oko ranijeg dolaska i ostavio nam vino dobrodošlice.",
          ownerReply: "Hvala vam! Sitnice čine razliku.",
        },
        {
          guestId: guest1.id,
          checkIn: [2026, 5, 8],
          checkOut: [2026, 5, 11],
          numGuests: 2,
          rating: 4,
          comment:
            "Odlična lokacija i vrlo ljubazan domaćin. Klima je malo bučnija nego što smo navikli.",
          ownerReply:
            "Hvala na primjedbi, servis je podesio uređaj pa sada radi tiše.",
        },
        {
          guestId: guest2.id,
          checkIn: [2026, 5, 14],
          checkOut: [2026, 5, 19],
          numGuests: 2,
          rating: 5,
          comment:
            "Pet noćenja i nijedan problem. Studio je čist, krevet udoban, a pogled na krovove starog grada je bonus.",
          ownerReply: "Hvala vam na lijepim riječima!",
        },
        {
          guestId: guest3.id,
          checkIn: [2026, 5, 22],
          checkOut: [2026, 5, 26],
          numGuests: 1,
          rating: 4,
          comment:
            "Sve korektno, komunikacija brza. Wi-Fi je unutar debelih kamenih zidova povremeno slabiji.",
          ownerReply: "Hvala, postavio sam pojačivač signala u hodniku.",
        },
        {
          guestId: guest4.id,
          checkIn: [2026, 5, 29],
          checkOut: [2026, 6, 2],
          numGuests: 2,
          rating: 3,
          comment:
            "Lokacija je fantastična, ali buka s ulice traje do kasno u noć. Za mirniji san ovo nije pravi izbor.",
          ownerReply:
            "Hvala na iskrenosti. Stari grad je živ do kasno pa gostima ostavljam čepiće za uši i preporučujem zatvaranje škura.",
        },
        {
          guestId: guest5.id,
          checkIn: [2026, 6, 5],
          checkOut: [2026, 6, 9],
          numGuests: 2,
          rating: 5,
          comment:
            "Ne bismo mijenjali ništa. Čisto, ugodno i doslovno u srcu grada.",
          ownerReply: "Hvala! Vrata su vam uvijek otvorena.",
        },
        {
          guestId: guest1.id,
          checkIn: [2026, 6, 12],
          checkOut: [2026, 6, 17],
          numGuests: 2,
          rating: 4,
          comment:
            "Vrlo dobar studio za par. Ljeti bi dobro došla još jedna klima u kuhinjskom dijelu.",
          ownerReply:
            "Hvala na prijedlogu, razmatram dodatni uređaj za sljedeću sezonu.",
        },
        {
          guestId: guest2.id,
          checkIn: [2026, 6, 20],
          checkOut: [2026, 6, 23],
          numGuests: 2,
          rating: 2,
          comment:
            "Nestalo je tople vode drugi dan i trebalo je više od dana da se popravi. U ovoj kategoriji cijene to ne bih očekivao.",
          ownerReply:
            "Ispričavam se, bojler je bio u kvaru i odmah je zamijenjen. Odobrio sam vam povrat dijela iznosa.",
        },
        {
          guestId: guest3.id,
          checkIn: [2026, 6, 26],
          checkOut: [2026, 6, 30],
          numGuests: 2,
          rating: 5,
          comment:
            "Sve je radilo besprijekorno, nova topla voda i klima. Domaćin je stvarno pristupačan.",
          ownerReply: "Hvala vam! Drago mi je da je sve bilo u redu.",
        },
        {
          guestId: guest4.id,
          checkIn: [2026, 7, 3],
          checkOut: [2026, 7, 9],
          numGuests: 2,
          rating: 4,
          comment:
            "Šest noćenja u sezoni. Studio je čist i dobro održavan, ali grad je u srpnju prepun kruzera.",
          ownerReply:
            "Hvala na recenziji, gostima uvijek javim kada su kruzeri u luci pa mogu planirati razgledavanje.",
        },
        {
          guestId: guest5.id,
          checkIn: [2026, 7, 12],
          checkOut: [2026, 7, 16],
          numGuests: 2,
          rating: 3,
          comment:
            "Solidno, ali za ovu cijenu očekivali smo nešto više prostora i noviju kuhinjsku opremu.",
          ownerReply:
            "Hvala na povratnoj informaciji, obnovu kuhinjskog dijela planiram izvan sezone.",
        },
      ],
    },
    {
      // Zagreb Business Flat - max 3 gosta, min 1 noćenje, 80 EUR/noć
      apartmentId: IDS.apartments.apt3,
      idOffset: 300,
      stays: [
        {
          guestId: guest1.id,
          checkIn: [2026, 4, 1],
          checkOut: [2026, 4, 3],
          numGuests: 1,
          rating: 4,
          comment:
            "Za poslovni boravak sasvim dovoljno - dobar radni stol, brz internet i tramvaj ispred zgrade.",
          ownerReply:
            "Hvala vam! Trudim se da apartman bude praktičan za poslovne goste.",
        },
        {
          guestId: guest2.id,
          checkIn: [2026, 4, 5],
          checkOut: [2026, 4, 6],
          numGuests: 1,
          rating: 5,
          comment:
            "Jedna noć između sastanaka i sve je bilo idealno: samostalan ulazak, tišina i čistoća.",
          ownerReply:
            "Hvala! Samostalan check-in je baš namijenjen ovakvim boravcima.",
        },
        {
          guestId: guest3.id,
          checkIn: [2026, 4, 8],
          checkOut: [2026, 4, 12],
          numGuests: 2,
          rating: 4,
          comment:
            "Praktičan i uredan stan, blizu poslovne zone. Nedostaje malo više posuđa za pripremu obroka.",
          ownerReply: "Hvala na primjedbi, dopunila sam kuhinjski inventar.",
        },
        {
          guestId: guest4.id,
          checkIn: [2026, 4, 14],
          checkOut: [2026, 4, 15],
          numGuests: 1,
          rating: 3,
          comment:
            "Sve je funkcionalno, ali stan je prilično neutralan i bez atmosfere. Za jednu noć posve dovoljno.",
          ownerReply:
            "Hvala na iskrenoj recenziji, dodala sam nekoliko detalja da prostor bude topliji.",
        },
        {
          guestId: guest5.id,
          checkIn: [2026, 4, 17],
          checkOut: [2026, 4, 21],
          numGuests: 3,
          rating: 5,
          comment:
            "Bili smo troje na poslovnom putu i svima je bilo udobno. Parking u dvorištu je velika prednost.",
          ownerReply: "Hvala vam! Parking je u ovom dijelu grada rijetkost.",
        },
        {
          guestId: guest1.id,
          checkIn: [2026, 4, 23],
          checkOut: [2026, 4, 25],
          numGuests: 2,
          rating: 4,
          comment:
            "Dobar omjer cijene i kvalitete, čisto i tiho. Perilica rublja nam je bila korisna.",
          ownerReply: "Hvala na recenziji, dobrodošli ponovno!",
        },
        {
          guestId: guest2.id,
          checkIn: [2026, 4, 28],
          checkOut: [2026, 4, 30],
          numGuests: 1,
          rating: 3,
          comment:
            "Lokacija je praktična, ali pogled je na prometnu cestu i buka se čuje već ujutro. Radni dio je u redu.",
          ownerReply:
            "Hvala, postavila sam deblje zavjese koje dosta prigušuju buku.",
        },
        {
          guestId: guest3.id,
          checkIn: [2026, 5, 4],
          checkOut: [2026, 5, 8],
          numGuests: 2,
          rating: 5,
          comment:
            "Četiri noći i sve besprijekorno. Komunikacija s vlasnicom brza i jasna, stan točno kao na slikama.",
          ownerReply: "Hvala vam na povjerenju!",
        },
        {
          guestId: guest4.id,
          checkIn: [2026, 5, 11],
          checkOut: [2026, 5, 12],
          numGuests: 1,
          rating: 4,
          comment:
            "Brz check-in, čisto i mirno. Idealno za kratak poslovni boravak.",
          ownerReply: "Hvala! Vidimo se sljedeći put.",
        },
        {
          guestId: guest5.id,
          checkIn: [2026, 5, 15],
          checkOut: [2026, 5, 19],
          numGuests: 3,
          rating: 3,
          comment:
            "Za tri osobe je stan malo tijesan, pogotovo kupaonica ujutro. Ostalo je korektno.",
          ownerReply:
            "Hvala na povratnoj informaciji, kapacitet od tri osobe je stvarno maksimum.",
        },
        {
          guestId: guest1.id,
          checkIn: [2026, 5, 22],
          checkOut: [2026, 5, 24],
          numGuests: 2,
          rating: 1,
          comment:
            "Pri dolasku je stan bio prljav, a jedan radijator nije radio. Nitko se nije javljao na poruke do večeri.",
          ownerReply:
            "Duboko se ispričavam, ovo nije standard koji držim. Promijenila sam servis za čišćenje, radijator je popravljen, a povrat vam je odobren.",
        },
        {
          guestId: guest2.id,
          checkIn: [2026, 5, 27],
          checkOut: [2026, 5, 31],
          numGuests: 2,
          rating: 4,
          comment:
            "Nakon lošijih recenzija bili smo skeptični, ali stan je bio čist i sve je radilo.",
          ownerReply:
            "Hvala vam što ste dali priliku, poboljšanja su bila nužna.",
        },
        {
          guestId: guest3.id,
          checkIn: [2026, 6, 4],
          checkOut: [2026, 6, 7],
          numGuests: 3,
          rating: 5,
          comment:
            "Odlična baza za poslovni boravak u Zagrebu. Sve blizu, sve radi, domaćica vrlo susretljiva.",
          ownerReply: "Hvala vam! Drago mi je da je sve prošlo glatko.",
        },
        {
          guestId: guest4.id,
          checkIn: [2026, 6, 10],
          checkOut: [2026, 6, 11],
          numGuests: 1,
          rating: 3,
          comment:
            "Korektno za jednu noć, ali klima je bučna pa sam je noću gasio.",
          ownerReply: "Hvala na primjedbi, naručen je servis klime.",
        },
        {
          guestId: guest5.id,
          checkIn: [2026, 6, 16],
          checkOut: [2026, 6, 20],
          numGuests: 2,
          rating: 2,
          comment:
            "Stan je čist, ali dizalo nije radilo cijeli tjedan, a stan je na četvrtom katu. S prtljagom je to pravi problem.",
          ownerReply:
            "Ispričavam se, kvar dizala je bio na zgradi i izvan mog utjecaja, ali sam vas trebala ranije obavijestiti.",
        },
      ],
    },
    {
      // Ostrava Magic House - max 6 gostiju, min 2 noćenja, 85 EUR/noć
      apartmentId: IDS.apartments.apt4,
      idOffset: 400,
      stays: [
        {
          guestId: guest1.id,
          checkIn: [2026, 4, 3],
          checkOut: [2026, 4, 7],
          numGuests: 4,
          rating: 5,
          comment:
            "Kuća je uživo još ljepša, a vrt je bio omiljeno mjesto djece. Sve je čisto i domaćinski uređeno.",
          ownerReply:
            "Hvala vam! Vrt je moj ponos, drago mi je da su ga djeca iskoristila.",
        },
        {
          guestId: guest2.id,
          checkIn: [2026, 4, 9],
          checkOut: [2026, 4, 12],
          numGuests: 6,
          rating: 5,
          comment:
            "Bili smo šestero i svima je bilo prostrano. Roštilj i velik stol u vrtu su savršeni za druženje.",
          ownerReply: "Hvala! Veće društvo je ovdje uvijek dobrodošlo.",
        },
        {
          guestId: guest3.id,
          checkIn: [2026, 4, 15],
          checkOut: [2026, 4, 20],
          numGuests: 5,
          rating: 5,
          comment:
            "Pet noćenja, dvije obitelji i nijedna zamjerka. Bazen je bio spreman i čist već u travnju.",
          ownerReply:
            "Hvala vam, bazen otvaramo rano u sezoni baš zbog ovakvih boravaka!",
        },
        {
          guestId: guest4.id,
          checkIn: [2026, 4, 22],
          checkOut: [2026, 4, 24],
          numGuests: 2,
          rating: 4,
          comment:
            "Za dvoje je kuća gotovo prevelika, ali smo uživali u miru i vrtu. Grijanje bi noću moglo biti jače.",
          ownerReply:
            "Hvala na primjedbi, dodala sam dodatne grijalice i deblje pokrivače.",
        },
        {
          guestId: guest5.id,
          checkIn: [2026, 4, 27],
          checkOut: [2026, 5, 2],
          numGuests: 6,
          rating: 5,
          comment:
            "Savršen obiteljski odmor. Kuhinja je ogromna, djeca su imala prostora, a vlasnica je bila na raspolaganju za svako pitanje.",
          ownerReply: "Hvala vam od srca, veselim se vašem povratku!",
        },
        {
          guestId: guest1.id,
          checkIn: [2026, 5, 5],
          checkOut: [2026, 5, 9],
          numGuests: 4,
          rating: 5,
          comment:
            "Sve je bilo točno kako je opisano, čak i bolje. Preporučujemo svima koji putuju s djecom.",
          ownerReply: "Hvala na preporuci!",
        },
        {
          guestId: guest2.id,
          checkIn: [2026, 5, 12],
          checkOut: [2026, 5, 14],
          numGuests: 3,
          rating: 3,
          comment:
            "Kuća je lijepa, ali susjedova kosilica i radovi u ulici su nam pokvarili mir. Unutra je sve bilo u redu.",
          ownerReply:
            "Hvala na iskrenosti, radovi u ulici su u međuvremenu završeni.",
        },
        {
          guestId: guest3.id,
          checkIn: [2026, 5, 17],
          checkOut: [2026, 5, 23],
          numGuests: 6,
          rating: 5,
          comment:
            "Tjedan dana, šestero ljudi, nula problema. Bazen, roštilj i vrt su iskorišteni do kraja.",
          ownerReply: "Hvala vam! Baš tako kuća i treba izgledati kad je puna.",
        },
        {
          guestId: guest4.id,
          checkIn: [2026, 5, 26],
          checkOut: [2026, 5, 30],
          numGuests: 5,
          rating: 4,
          comment:
            "Vrlo ugodan boravak. Jedina zamjerka je što je jedna kupaonica za petero ujutro znala biti usko grlo.",
          ownerReply:
            "Hvala na povratnoj informaciji, u planu je uređenje druge kupaonice.",
        },
        {
          guestId: guest5.id,
          checkIn: [2026, 6, 2],
          checkOut: [2026, 6, 5],
          numGuests: 2,
          rating: 5,
          comment:
            "Mirno, zeleno i čisto. Idealno za bijeg iz grada na nekoliko dana.",
          ownerReply: "Hvala vam! Mir je ovdje najveći luksuz.",
        },
        {
          guestId: guest1.id,
          checkIn: [2026, 6, 8],
          checkOut: [2026, 6, 14],
          numGuests: 6,
          rating: 5,
          comment:
            "Nezaboravan tjedan. Djeca nisu izlazila iz bazena, a mi smo uživali u vrtu i tišini.",
          ownerReply: "Hvala, drago mi je da su svi našli svoje mjesto!",
        },
        {
          guestId: guest2.id,
          checkIn: [2026, 6, 17],
          checkOut: [2026, 6, 19],
          numGuests: 4,
          rating: 3,
          comment:
            "Kuća je odlična, ali bazen je prvi dan bio mutan i trebalo ga je čistiti. Nakon toga je sve bilo u redu.",
          ownerReply:
            "Ispričavam se zbog toga, promijenila sam raspored održavanja tako da se bazen čisti prije svakog dolaska.",
        },
        {
          guestId: guest3.id,
          checkIn: [2026, 6, 22],
          checkOut: [2026, 6, 27],
          numGuests: 5,
          rating: 5,
          comment:
            "Bazen besprijekoran, kuća čista, domaćica susretljiva. Nemamo nijednu primjedbu.",
          ownerReply:
            "Hvala vam! Drago mi je da je novi raspored održavanja urodio plodom.",
        },
        {
          guestId: guest4.id,
          checkIn: [2026, 6, 30],
          checkOut: [2026, 7, 5],
          numGuests: 6,
          rating: 4,
          comment:
            "Sjajno mjesto za veliku družinu. Klima postoji samo u dijelu prostorija, što se ljeti osjeti.",
          ownerReply:
            "Hvala na primjedbi, dogradnja klime u gornjim sobama je planirana za jesen.",
        },
        {
          guestId: guest5.id,
          checkIn: [2026, 7, 8],
          checkOut: [2026, 7, 15],
          numGuests: 6,
          rating: 4,
          comment:
            "Tjedan dana u punom sastavu i sve je funkcioniralo. Vrt i bazen su glavna zvijezda, interijer je nešto skromniji.",
          ownerReply: "Hvala na recenziji, postupno osvježavam i unutrašnjost.",
        },
      ],
    },
    {
      // Rijeka Sea View - max 4 gosta, min 2 noćenja, 75 EUR/noć
      apartmentId: IDS.apartments.apt5,
      idOffset: 500,
      stays: [
        {
          guestId: guest1.id,
          checkIn: [2026, 4, 2],
          checkOut: [2026, 4, 5],
          numGuests: 2,
          rating: 5,
          comment:
            "Pogled na Kvarner s balkona je upravo onakav kakav se vidi na slikama. Korzo je pet minuta hoda.",
          ownerReply: "Hvala vam! Balkon je najveći adut ovog apartmana.",
        },
        {
          guestId: guest2.id,
          checkIn: [2026, 4, 7],
          checkOut: [2026, 4, 11],
          numGuests: 4,
          rating: 4,
          comment:
            "Prostrano za četvero, čisto i uredno. Parking je malo dalje nego što smo očekivali.",
          ownerReply:
            "Hvala na recenziji, u uputama sam sada precizno označio najbliže parkiralište.",
        },
        {
          guestId: guest3.id,
          checkIn: [2026, 4, 13],
          checkOut: [2026, 4, 15],
          numGuests: 2,
          rating: 5,
          comment:
            "Kratak vikend i savršena lokacija. Ujutro kava na balkonu uz pogled na more - ništa bolje.",
          ownerReply: "Hvala! Baš zbog toga volim ovaj apartman.",
        },
        {
          guestId: guest4.id,
          checkIn: [2026, 4, 18],
          checkOut: [2026, 4, 23],
          numGuests: 3,
          rating: 4,
          comment:
            "Pet noćenja i sve pohvale. Kuhinja bi mogla imati nešto noviju pećnicu, inače nemamo zamjerki.",
          ownerReply: "Hvala na primjedbi, nova pećnica je već naručena.",
        },
        {
          guestId: guest5.id,
          checkIn: [2026, 4, 25],
          checkOut: [2026, 4, 28],
          numGuests: 4,
          rating: 5,
          comment:
            "Obitelj je bila oduševljena. Blizu svega, čisto, a domaćin brzo odgovara na poruke.",
          ownerReply: "Hvala vam! Uvijek sam dostupan gostima.",
        },
        {
          guestId: guest1.id,
          checkIn: [2026, 5, 1],
          checkOut: [2026, 5, 7],
          numGuests: 4,
          rating: 4,
          comment:
            "Tjedan dana u Rijeci, apartman je bio odlična baza za izlete po Kvarneru. Stepenice do ulaza su strme.",
          ownerReply: "Hvala na napomeni, dodao sam rukohvat na stubištu.",
        },
        {
          guestId: guest2.id,
          checkIn: [2026, 5, 9],
          checkOut: [2026, 5, 11],
          numGuests: 1,
          rating: 3,
          comment:
            "Lokacija i pogled su odlični, ali buka s Korza vikendom traje do jutra. Meni koji rano ustajem to je smetalo.",
          ownerReply:
            "Hvala na iskrenosti, centar je vikendom živ pa gostima ostavljam čepiće za uši.",
        },
        {
          guestId: guest3.id,
          checkIn: [2026, 5, 14],
          checkOut: [2026, 5, 18],
          numGuests: 3,
          rating: 5,
          comment:
            "Sve je bilo besprijekorno - čistoća, oprema, komunikacija. Preporuka.",
          ownerReply: "Hvala na preporuci!",
        },
        {
          guestId: guest4.id,
          checkIn: [2026, 5, 21],
          checkOut: [2026, 5, 24],
          numGuests: 2,
          rating: 4,
          comment:
            "Ugodan apartman s odličnim pogledom. Tuš ima slab pritisak vode ujutro.",
          ownerReply:
            "Hvala, ugradio sam novu tuš ružu pa je pritisak sada bolji.",
        },
        {
          guestId: guest5.id,
          checkIn: [2026, 5, 27],
          checkOut: [2026, 6, 1],
          numGuests: 4,
          rating: 5,
          comment:
            "Pet noćenja s obitelji i sve je funkcioniralo. Plaža i trajektna luka su blizu, što nam je jako odgovaralo.",
          ownerReply:
            "Hvala vam! Lokacija je zaista praktična za izlete na otoke.",
        },
        {
          guestId: guest1.id,
          checkIn: [2026, 6, 4],
          checkOut: [2026, 6, 6],
          numGuests: 2,
          rating: 1,
          comment:
            "Apartman pri dolasku nije bio spreman - prethodni gosti su tek odlazili, a čišćenje je počelo dok smo čekali na ulici s koferima.",
          ownerReply:
            "Iskreno se ispričavam, riječ je o mojoj grešci u rasporedu. Uveo sam veći razmak između dolazaka i vratio vam iznos prve noći.",
        },
        {
          guestId: guest2.id,
          checkIn: [2026, 6, 9],
          checkOut: [2026, 6, 15],
          numGuests: 4,
          rating: 4,
          comment:
            "Nakon loše recenzije prije nas bili smo oprezni, ali sve je bilo spremno na vrijeme i čisto.",
          ownerReply:
            "Hvala vam što ste dali priliku, naučio sam iz te greške.",
        },
        {
          guestId: guest3.id,
          checkIn: [2026, 6, 18],
          checkOut: [2026, 6, 21],
          numGuests: 3,
          rating: 5,
          comment:
            "Prekrasan pogled, čist apartman i vrlo ljubazan domaćin. Vraćamo se sigurno.",
          ownerReply: "Hvala, veselim se vašem povratku!",
        },
        {
          guestId: guest4.id,
          checkIn: [2026, 6, 24],
          checkOut: [2026, 6, 29],
          numGuests: 4,
          rating: 4,
          comment:
            "Vrlo dobar smještaj za obitelj. Klima u dnevnom boravku slabije hladi nego ona u sobi.",
          ownerReply: "Hvala na primjedbi, servis je dopunio plin u uređaju.",
        },
        {
          guestId: guest5.id,
          checkIn: [2026, 7, 2],
          checkOut: [2026, 7, 8],
          numGuests: 4,
          rating: 3,
          comment:
            "Pogled je i dalje najbolji dio. Ljeti je apartman popodne vruć jer sunce udara ravno u balkon, a rolete ne zatvaraju dobro.",
          ownerReply:
            "Hvala na konkretnoj primjedbi, zamjena roleta i nadstrešnica za balkon su u planu prije sljedeće sezone.",
        },
      ],
    },
    {
      // Osijek Riverside - max 4 gosta, min 2 noćenja, 70 EUR/noć
      apartmentId: IDS.apartments.apt7,
      idOffset: 700,
      stays: [
        {
          guestId: guest1.id,
          checkIn: [2026, 4, 1],
          checkOut: [2026, 4, 4],
          numGuests: 2,
          rating: 5,
          comment:
            "Pogled na Dravu i šetnica ispred zgrade su nas osvojili. Apartman je čist i tih.",
          ownerReply: "Hvala vam! Šetnica uz Dravu je najljepši dio Osijeka.",
        },
        {
          guestId: guest2.id,
          checkIn: [2026, 4, 6],
          checkOut: [2026, 4, 10],
          numGuests: 4,
          rating: 4,
          comment:
            "Prostrano za četvero i blizu Tvrđe. Besplatan parking je veliki plus.",
          ownerReply: "Hvala na recenziji, dobrodošli ponovno!",
        },
        {
          guestId: guest3.id,
          checkIn: [2026, 4, 13],
          checkOut: [2026, 4, 15],
          numGuests: 2,
          rating: 3,
          comment:
            "Apartman je uredan, ali namještaj je vidno star i kuhinja bi trebala obnovu.",
          ownerReply:
            "Hvala na iskrenosti, obnova kuhinje je planirana za jesen.",
        },
        {
          guestId: guest4.id,
          checkIn: [2026, 4, 17],
          checkOut: [2026, 4, 22],
          numGuests: 3,
          rating: 5,
          comment:
            "Pet mirnih noćenja uz rijeku. Domaćica nam je posudila bicikle i preporučila rute uz Dravu.",
          ownerReply: "Hvala! Bicikli su gostima uvijek na raspolaganju.",
        },
        {
          guestId: guest5.id,
          checkIn: [2026, 4, 24],
          checkOut: [2026, 4, 27],
          numGuests: 4,
          rating: 4,
          comment:
            "Dobar omjer cijene i kvalitete, mirna lokacija. Wi-Fi je slabiji u spavaćoj sobi.",
          ownerReply: "Hvala, postavila sam pojačivač signala.",
        },
        {
          guestId: guest1.id,
          checkIn: [2026, 4, 30],
          checkOut: [2026, 5, 6],
          numGuests: 4,
          rating: 5,
          comment:
            "Tjedan dana odmora uz rijeku, točno ono što nam je trebalo. Sve čisto i funkcionalno.",
          ownerReply: "Hvala vam na lijepim riječima!",
        },
        {
          guestId: guest2.id,
          checkIn: [2026, 5, 8],
          checkOut: [2026, 5, 10],
          numGuests: 1,
          rating: 3,
          comment:
            "Mirno i čisto, ali do centra je ipak dalje nego što sam očekivao pješice.",
          ownerReply:
            "Hvala na povratnoj informaciji, u opis sam dodala točnu udaljenost i vrijeme hoda.",
        },
        {
          guestId: guest3.id,
          checkIn: [2026, 5, 13],
          checkOut: [2026, 5, 17],
          numGuests: 3,
          rating: 4,
          comment:
            "Ugodan boravak i ljubazna domaćica. Balkon je malen za troje, ali pogled to nadoknadi.",
          ownerReply: "Hvala vam! Pogled na Dravu je zaista poseban.",
        },
        {
          guestId: guest4.id,
          checkIn: [2026, 5, 20],
          checkOut: [2026, 5, 23],
          numGuests: 2,
          rating: 1,
          comment:
            "U apartmanu je bilo vlage i osjetio se miris plijesni u kupaonici. Nakon dvije noći smo otišli ranije.",
          ownerReply:
            "Iskreno se ispričavam. Kupaonica je sanirana i ugrađena je ventilacija, a iznos vam je u cijelosti vraćen.",
        },
        {
          guestId: guest5.id,
          checkIn: [2026, 5, 26],
          checkOut: [2026, 5, 31],
          numGuests: 4,
          rating: 4,
          comment:
            "Nakon sanacije kupaonice sve je bilo u redu, bez ikakvih neugodnih mirisa. Apartman je čist i miran.",
          ownerReply:
            "Hvala vam što ste provjerili sami, bilo mi je važno to popraviti.",
        },
        {
          guestId: guest1.id,
          checkIn: [2026, 6, 3],
          checkOut: [2026, 6, 5],
          numGuests: 2,
          rating: 5,
          comment:
            "Kratak i savršen bijeg iz grada. Tišina, rijeka i ljubazna domaćica.",
          ownerReply: "Hvala, vidimo se opet!",
        },
        {
          guestId: guest2.id,
          checkIn: [2026, 6, 8],
          checkOut: [2026, 6, 13],
          numGuests: 4,
          rating: 4,
          comment:
            "Odličan smještaj za obitelj, djeca su uživala na šetnici. Klima radi, ali je pomalo bučna.",
          ownerReply: "Hvala na primjedbi, servis klime je dogovoren.",
        },
        {
          guestId: guest3.id,
          checkIn: [2026, 6, 16],
          checkOut: [2026, 6, 19],
          numGuests: 3,
          rating: 2,
          comment:
            "Buka s ulice i komarci s rijeke navečer su nam pokvarili boravak. Na prozorima nema mreža.",
          ownerReply:
            "Hvala na konkretnoj primjedbi, mreže protiv komaraca su ugrađene na sve prozore.",
        },
        {
          guestId: guest4.id,
          checkIn: [2026, 6, 22],
          checkOut: [2026, 6, 28],
          numGuests: 4,
          rating: 5,
          comment:
            "Nove mreže na prozorima su riješile problem komaraca, spavali smo mirno. Sve pohvale domaćici na brzoj reakciji.",
          ownerReply:
            "Hvala vam! Povratne informacije gostiju su mi najkorisnije.",
        },
        {
          guestId: guest5.id,
          checkIn: [2026, 7, 1],
          checkOut: [2026, 7, 5],
          numGuests: 3,
          rating: 3,
          comment:
            "Lokacija uz Dravu je lijepa, ali ljeti je apartman popodne vruć i jedna klima nije dovoljna za cijeli prostor.",
          ownerReply:
            "Hvala, razmatram ugradnju drugog uređaja u spavaćem dijelu.",
        },
      ],
    },
    {
      // Pula Roman View - max 3 gosta, min 2 noćenja, 88 EUR/noć
      apartmentId: IDS.apartments.apt8,
      idOffset: 800,
      stays: [
        {
          guestId: guest1.id,
          checkIn: [2026, 4, 2],
          checkOut: [2026, 4, 6],
          numGuests: 2,
          rating: 5,
          comment:
            "Pogled na Arenu s prozora je nešto što se ne zaboravlja. Apartman je čist, moderan i tih.",
          ownerReply:
            "Hvala vam! Pogled na amfiteatar je razlog zbog kojeg sam kupio ovaj stan.",
        },
        {
          guestId: guest2.id,
          checkIn: [2026, 4, 8],
          checkOut: [2026, 4, 10],
          numGuests: 3,
          rating: 4,
          comment:
            "Odlična lokacija i uredan prostor. Za troje je nešto tijesno, ali sasvim upotrebljivo.",
          ownerReply:
            "Hvala na recenziji, kapacitet od tri osobe je realno maksimum.",
        },
        {
          guestId: guest3.id,
          checkIn: [2026, 4, 12],
          checkOut: [2026, 4, 17],
          numGuests: 3,
          rating: 5,
          comment:
            "Pet noćenja u srcu Pule. Sve znamenitosti pješice, a domaćin nam je dao odlične savjete za plaže.",
          ownerReply: "Hvala! Rado dijelim svoje omiljene uvale.",
        },
        {
          guestId: guest4.id,
          checkIn: [2026, 4, 20],
          checkOut: [2026, 4, 23],
          numGuests: 2,
          rating: 4,
          comment:
            "Vrlo ugodno, čisto i dobro opremljeno. Stepenice do drugog kata bez dizala su jedini minus.",
          ownerReply:
            "Hvala na napomeni, zgrada je stara i nažalost nema dizala.",
        },
        {
          guestId: guest5.id,
          checkIn: [2026, 4, 26],
          checkOut: [2026, 4, 30],
          numGuests: 3,
          rating: 5,
          comment:
            "Sve je bilo besprijekorno. Domaćin je izašao u susret oko kasnijeg odlaska.",
          ownerReply: "Hvala vam, uvijek se trudim biti fleksibilan.",
        },
        {
          guestId: guest1.id,
          checkIn: [2026, 5, 3],
          checkOut: [2026, 5, 5],
          numGuests: 1,
          rating: 3,
          comment:
            "Lokacija je izvrsna, ali navečer je buka iz kafića ispod prozora prilično jaka.",
          ownerReply:
            "Hvala na iskrenosti, centar je živ pa gostima ostavljam čepiće za uši.",
        },
        {
          guestId: guest2.id,
          checkIn: [2026, 5, 8],
          checkOut: [2026, 5, 13],
          numGuests: 3,
          rating: 5,
          comment:
            "Apartman je svijetao, čist i odlično opremljen. Pogled na Arenu uz jutarnju kavu je poseban doživljaj.",
          ownerReply: "Hvala vam na lijepim riječima!",
        },
        {
          guestId: guest3.id,
          checkIn: [2026, 5, 16],
          checkOut: [2026, 5, 19],
          numGuests: 2,
          rating: 4,
          comment:
            "Sve korektno i točno prema opisu. Kuhinja je mala, ali za par sasvim dovoljna.",
          ownerReply: "Hvala na recenziji, dobrodošli ponovno!",
        },
        {
          guestId: guest4.id,
          checkIn: [2026, 5, 22],
          checkOut: [2026, 5, 27],
          numGuests: 3,
          rating: 5,
          comment:
            "Nemamo nijednu zamjerku. Čisto, mirno unutar stana, a grad je na dohvat ruke.",
          ownerReply: "Hvala vam!",
        },
        {
          guestId: guest5.id,
          checkIn: [2026, 5, 30],
          checkOut: [2026, 6, 2],
          numGuests: 2,
          rating: 4,
          comment:
            "Ugodan boravak i ljubazan domaćin. Tijekom koncerta u Areni je bilo bučno, ali to smo i očekivali.",
          ownerReply:
            "Hvala na razumijevanju, raspored koncerata uvijek javim gostima unaprijed.",
        },
        {
          guestId: guest1.id,
          checkIn: [2026, 6, 5],
          checkOut: [2026, 6, 11],
          numGuests: 3,
          rating: 5,
          comment:
            "Šest noćenja i sve je funkcioniralo. Klima, Wi-Fi, topla voda - bez ijednog problema.",
          ownerReply: "Hvala, drago mi je da je sve radilo kako treba!",
        },
        {
          guestId: guest2.id,
          checkIn: [2026, 6, 14],
          checkOut: [2026, 6, 16],
          numGuests: 2,
          rating: 2,
          comment:
            "Apartman je pri dolasku bio pretopao jer klima nije radila, a serviser je došao tek sutradan.",
          ownerReply:
            "Ispričavam se zbog kvara i čekanja. Uređaj je zamijenjen novim, a dio iznosa vam je vraćen.",
        },
        {
          guestId: guest3.id,
          checkIn: [2026, 6, 19],
          checkOut: [2026, 6, 24],
          numGuests: 3,
          rating: 5,
          comment:
            "Nova klima radi savršeno. Apartman je bio ugodan i hladan unatoč vrućinama.",
          ownerReply: "Hvala vam! Ulaganje u novi uređaj se isplatilo.",
        },
        {
          guestId: guest4.id,
          checkIn: [2026, 6, 27],
          checkOut: [2026, 7, 2],
          numGuests: 3,
          rating: 4,
          comment:
            "Vrlo dobar smještaj u samom centru. Parking je u sezoni pravi izazov.",
          ownerReply:
            "Hvala na primjedbi, gostima sada rezerviram mjesto na obližnjem privatnom parkiralištu.",
        },
        {
          guestId: guest5.id,
          checkIn: [2026, 7, 5],
          checkOut: [2026, 7, 11],
          numGuests: 3,
          rating: 3,
          comment:
            "Lokacija i pogled su odlični, ali u srpnju je gužva ispod prozora do kasno u noć i spavanje je bilo teško.",
          ownerReply:
            "Hvala na iskrenosti. Za ljetne mjesece preporučujem sobu okrenutu prema dvorištu, a razmatram i zvučnu izolaciju prozora.",
        },
      ],
    },
    {
      // Šibenik Coastal Retreat - max 5 gostiju, min 3 noćenja, 82 EUR/noć
      apartmentId: IDS.apartments.apt9,
      idOffset: 900,
      stays: [
        {
          guestId: guest1.id,
          checkIn: [2026, 4, 3],
          checkOut: [2026, 4, 7],
          numGuests: 4,
          rating: 5,
          comment:
            "Apartman je prostran i svijetao, a katedrala je na par minuta hoda. Roštilj na terasi smo iskoristili svaku večer.",
          ownerReply: "Hvala vam! Terasa je omiljeno mjesto naših gostiju.",
        },
        {
          guestId: guest2.id,
          checkIn: [2026, 4, 10],
          checkOut: [2026, 4, 14],
          numGuests: 5,
          rating: 4,
          comment:
            "Bilo nas je petero i prostora je bilo dovoljno. Pristup autom kroz uske ulice zahtijeva strpljenje.",
          ownerReply:
            "Hvala na napomeni, u uputama sam dodao najlakšu rutu do parkirališta.",
        },
        {
          guestId: guest3.id,
          checkIn: [2026, 4, 17],
          checkOut: [2026, 4, 21],
          numGuests: 3,
          rating: 5,
          comment:
            "Sve pohvale za čistoću i opremljenost. Izlet na Krku smo organizirali uz domaćinove savjete.",
          ownerReply: "Hvala! Krka je obavezna stavka za svakog gosta.",
        },
        {
          guestId: guest4.id,
          checkIn: [2026, 4, 24],
          checkOut: [2026, 4, 28],
          numGuests: 5,
          rating: 3,
          comment:
            "Apartman je dobar, ali jedna kupaonica za petero ujutro je bila usko grlo.",
          ownerReply:
            "Hvala na povratnoj informaciji, uređenje druge kupaonice je u planu.",
        },
        {
          guestId: guest5.id,
          checkIn: [2026, 5, 1],
          checkOut: [2026, 5, 6],
          numGuests: 4,
          rating: 5,
          comment:
            "Pet noćenja bez ijedne zamjerke. Blizu mora, blizu centra, čisto i mirno.",
          ownerReply: "Hvala vam na lijepim riječima!",
        },
        {
          guestId: guest1.id,
          checkIn: [2026, 5, 9],
          checkOut: [2026, 5, 13],
          numGuests: 2,
          rating: 4,
          comment:
            "Za dvoje je apartman prostran i ugodan. Klima u dnevnom boravku bi mogla biti jača.",
          ownerReply:
            "Hvala, servis je dopunio plin pa uređaj sada bolje hladi.",
        },
        {
          guestId: guest2.id,
          checkIn: [2026, 5, 16],
          checkOut: [2026, 5, 21],
          numGuests: 5,
          rating: 5,
          comment:
            "Odličan smještaj za veće društvo. Terasa, roštilj i pogled na more su bili vrhunac.",
          ownerReply: "Hvala vam! Drago mi je da ste sve iskoristili.",
        },
        {
          guestId: guest3.id,
          checkIn: [2026, 5, 24],
          checkOut: [2026, 5, 28],
          numGuests: 3,
          rating: 4,
          comment:
            "Vrlo ugodan boravak, domaćin brzo odgovara. Stepenice do apartmana su strme za starije goste.",
          ownerReply: "Hvala na napomeni, to sada jasno stoji u opisu.",
        },
        {
          guestId: guest4.id,
          checkIn: [2026, 5, 31],
          checkOut: [2026, 6, 4],
          numGuests: 5,
          rating: 3,
          comment:
            "Lokacija je odlična, ali namještaj je ponegdje dotrajao i madraci bi trebali zamjenu.",
          ownerReply: "Hvala na iskrenosti, novi madraci su naručeni.",
        },
        {
          guestId: guest5.id,
          checkIn: [2026, 6, 7],
          checkOut: [2026, 6, 12],
          numGuests: 4,
          rating: 5,
          comment:
            "Novi madraci su stvarno udobni, spavali smo odlično. Apartman je čist i dobro opremljen.",
          ownerReply: "Hvala vam! Drago mi je da se ulaganje osjetilo.",
        },
        {
          guestId: guest1.id,
          checkIn: [2026, 6, 15],
          checkOut: [2026, 6, 19],
          numGuests: 3,
          rating: 4,
          comment:
            "Sve korektno i prema opisu. Wi-Fi zna zapeti kad se svi spoje istovremeno.",
          ownerReply: "Hvala, prešao sam na brži paket.",
        },
        {
          guestId: guest2.id,
          checkIn: [2026, 6, 22],
          checkOut: [2026, 6, 26],
          numGuests: 5,
          rating: 1,
          comment:
            "Pri dolasku nije bilo ni tople vode ni klime, a domaćin se javio tek nakon nekoliko poziva. S troje djece to je bio vrlo loš boravak.",
          ownerReply:
            "Duboko se ispričavam, ovo je bio niz propusta za koje preuzimam odgovornost. Bojler i klima su zamijenjeni, uveo sam dežurni broj, a iznos vam je u cijelosti vraćen.",
        },
        {
          guestId: guest3.id,
          checkIn: [2026, 6, 29],
          checkOut: [2026, 7, 4],
          numGuests: 4,
          rating: 5,
          comment:
            "Sve je radilo besprijekorno, a domaćin je bio dostupan cijelo vrijeme. Apartman preporučujemo.",
          ownerReply:
            "Hvala vam na povjerenju nakon svega, trudim se da se propusti ne ponove.",
        },
        {
          guestId: guest4.id,
          checkIn: [2026, 7, 7],
          checkOut: [2026, 7, 12],
          numGuests: 5,
          rating: 4,
          comment:
            "Sjajno mjesto za obitelj, more je blizu i terasa je velika. U sezoni je parkiranje naporno.",
          ownerReply:
            "Hvala na primjedbi, gostima osiguravam mjesto na privatnom parkiralištu.",
        },
        {
          guestId: guest5.id,
          checkIn: [2026, 7, 15],
          checkOut: [2026, 7, 19],
          numGuests: 3,
          rating: 3,
          comment:
            "Apartman je u redu, ali za srpanj bi trebala jača rashladna oprema u spavaćim sobama.",
          ownerReply:
            "Hvala, ugradnja klime u obje spavaće sobe je planirana prije sljedeće sezone.",
        },
      ],
    },
    {
      // Varaždin Castle Stay - max 3 gosta, min 1 noćenje, 75 EUR/noć
      apartmentId: IDS.apartments.apt10,
      idOffset: 1000,
      stays: [
        {
          guestId: guest1.id,
          checkIn: [2026, 4, 1],
          checkOut: [2026, 4, 2],
          numGuests: 1,
          rating: 4,
          comment:
            "Jedna noć na proputovanju, sve praktično i čisto. Dvorac je doslovno iza ugla.",
          ownerReply: "Hvala vam! Lokacija uz dvorac je naš najveći adut.",
        },
        {
          guestId: guest2.id,
          checkIn: [2026, 4, 4],
          checkOut: [2026, 4, 7],
          numGuests: 2,
          rating: 3,
          comment:
            "Lokacija je odlična, ali stan je skromnije opremljen nego što smo očekivali prema slikama.",
          ownerReply: "Hvala na iskrenosti, postupno obnavljamo opremu.",
        },
        {
          guestId: guest3.id,
          checkIn: [2026, 4, 9],
          checkOut: [2026, 4, 11],
          numGuests: 3,
          rating: 4,
          comment:
            "Ugodan i tih smještaj u centru. Za troje je taman, kupaonica je malena.",
          ownerReply: "Hvala na recenziji, dobrodošli ponovno!",
        },
        {
          guestId: guest4.id,
          checkIn: [2026, 4, 14],
          checkOut: [2026, 4, 15],
          numGuests: 2,
          rating: 5,
          comment:
            "Kratak romantičan bijeg i savršeno mjesto za njega. Pogled na dvorac ujutro je nešto posebno.",
          ownerReply: "Hvala vam! Baš zbog tog pogleda volim ovaj stan.",
        },
        {
          guestId: guest5.id,
          checkIn: [2026, 4, 17],
          checkOut: [2026, 4, 21],
          numGuests: 3,
          rating: 3,
          comment:
            "Četiri noćenja i sve korektno. Grijanje je slabo pa nam je prvih dana bilo hladno.",
          ownerReply:
            "Hvala na primjedbi, radijatori su servisirani i dodane su grijalice.",
        },
        {
          guestId: guest1.id,
          checkIn: [2026, 4, 24],
          checkOut: [2026, 4, 26],
          numGuests: 2,
          rating: 4,
          comment:
            "Čisto, mirno i blizu svega. Dobar omjer cijene i kvalitete.",
          ownerReply: "Hvala na lijepoj recenziji!",
        },
        {
          guestId: guest2.id,
          checkIn: [2026, 4, 29],
          checkOut: [2026, 5, 3],
          numGuests: 3,
          rating: 4,
          comment:
            "Ugodan boravak u baroknom centru. Parking je nešto dalje, ali se lako nađe mjesto.",
          ownerReply: "Hvala, u uputama smo označili najbliža parkirališta.",
        },
        {
          guestId: guest3.id,
          checkIn: [2026, 5, 6],
          checkOut: [2026, 5, 7],
          numGuests: 1,
          rating: 3,
          comment:
            "Za jednu noć posve dovoljno, ali madrac je tvrd i krevet škripi.",
          ownerReply:
            "Hvala na povratnoj informaciji, krevet je zamijenjen novim.",
        },
        {
          guestId: guest4.id,
          checkIn: [2026, 5, 10],
          checkOut: [2026, 5, 14],
          numGuests: 2,
          rating: 5,
          comment:
            "Novi krevet je udoban, stan je čist i tih, a domaćica vrlo ljubazna. Sve pohvale.",
          ownerReply: "Hvala vam! Drago mi je da se zamjena isplatila.",
        },
        {
          guestId: guest5.id,
          checkIn: [2026, 5, 17],
          checkOut: [2026, 5, 19],
          numGuests: 3,
          rating: 2,
          comment:
            "Stan je pri dolasku mirisao na dim cigareta iako je označen kao nepušački. To nam je pokvarilo boravak.",
          ownerReply:
            "Ispričavam se, prethodni gost je prekršio pravila. Uveli smo dubinsko čišćenje i naknadu za pušenje, a dio iznosa vam je vraćen.",
        },
        {
          guestId: guest1.id,
          checkIn: [2026, 5, 22],
          checkOut: [2026, 5, 26],
          numGuests: 3,
          rating: 4,
          comment:
            "Nema više neugodnih mirisa, stan je bio svjež i čist. Lokacija je i dalje glavni adut.",
          ownerReply: "Hvala vam što ste dali priliku!",
        },
        {
          guestId: guest2.id,
          checkIn: [2026, 5, 29],
          checkOut: [2026, 5, 31],
          numGuests: 2,
          rating: 3,
          comment:
            "Solidno za kratak boravak, ali zvučna izolacija prema susjedima je slaba.",
          ownerReply: "Hvala na iskrenosti, u planu je ugradnja izolacije.",
        },
        {
          guestId: guest3.id,
          checkIn: [2026, 6, 3],
          checkOut: [2026, 6, 7],
          numGuests: 3,
          rating: 4,
          comment:
            "Ugodan i praktičan smještaj, blizu dvorca i kavana. Kuhinja bi mogla imati više posuđa.",
          ownerReply: "Hvala, kuhinjski inventar je dopunjen.",
        },
        {
          guestId: guest4.id,
          checkIn: [2026, 6, 10],
          checkOut: [2026, 6, 12],
          numGuests: 2,
          rating: 1,
          comment:
            "Ključ nas nije čekao na dogovorenom mjestu, a domaćica se javila tek nakon sat vremena. Stan je uz to bio neočišćen.",
          ownerReply:
            "Duboko se ispričavam zbog oba propusta. Uveli smo sef za ključeve i provjeru čistoće prije svakog dolaska, a iznos vam je u cijelosti vraćen.",
        },
        {
          guestId: guest5.id,
          checkIn: [2026, 6, 16],
          checkOut: [2026, 6, 21],
          numGuests: 3,
          rating: 5,
          comment:
            "Ulazak sa sefom za ključeve je funkcionirao bez problema, a stan je bio besprijekorno čist. Preporučujemo.",
          ownerReply: "Hvala vam! Novi sustav se pokazao kao pravo rješenje.",
        },
      ],
    },
    {
      // Karlovac Wellness - max 4 gosta, min 2 noćenja, 68 EUR/noć
      apartmentId: IDS.apartments.apt11,
      idOffset: 1100,
      stays: [
        {
          guestId: guest1.id,
          checkIn: [2026, 4, 2],
          checkOut: [2026, 4, 5],
          numGuests: 2,
          rating: 5,
          comment:
            "Mirno i zeleno, savršeno za odmor od grada. Bicikli su nam bili odlična dodatna vrijednost.",
          ownerReply: "Hvala vam! Bicikli su gostima uvijek na raspolaganju.",
        },
        {
          guestId: guest2.id,
          checkIn: [2026, 4, 7],
          checkOut: [2026, 4, 12],
          numGuests: 4,
          rating: 4,
          comment:
            "Pet noćenja u četvero, prostrano i čisto. Kuhinja je dobro opremljena za duži boravak.",
          ownerReply: "Hvala na recenziji, dobrodošli ponovno!",
        },
        {
          guestId: guest3.id,
          checkIn: [2026, 4, 14],
          checkOut: [2026, 4, 16],
          numGuests: 2,
          rating: 3,
          comment:
            "Apartman je uredan, ali namještaj je vidno star i kupaonica bi trebala osvježenje.",
          ownerReply: "Hvala na iskrenosti, obnova kupaonice je u planu.",
        },
        {
          guestId: guest4.id,
          checkIn: [2026, 4, 19],
          checkOut: [2026, 4, 23],
          numGuests: 3,
          rating: 5,
          comment:
            "Odlična baza za obilazak Karlovca i okolice. Parkovi su blizu, a Aquatika je bila hit kod djece.",
          ownerReply: "Hvala! Aquatika je stvarno preporuka za obitelji.",
        },
        {
          guestId: guest5.id,
          checkIn: [2026, 4, 26],
          checkOut: [2026, 4, 29],
          numGuests: 4,
          rating: 4,
          comment:
            "Ugodan boravak i dobar omjer cijene i kvalitete. Wi-Fi je slabiji u jednoj sobi.",
          ownerReply: "Hvala, postavili smo pojačivač signala.",
        },
        {
          guestId: guest1.id,
          checkIn: [2026, 5, 2],
          checkOut: [2026, 5, 8],
          numGuests: 4,
          rating: 5,
          comment:
            "Tjedan dana potpunog opuštanja. Tiho, čisto, a perilica rublja nam je bila spas.",
          ownerReply: "Hvala vam na lijepim riječima!",
        },
        {
          guestId: guest2.id,
          checkIn: [2026, 5, 10],
          checkOut: [2026, 5, 12],
          numGuests: 1,
          rating: 3,
          comment:
            "Solidno za kratak boravak, ali do centra je pješice dalje nego što piše u opisu.",
          ownerReply:
            "Hvala na povratnoj informaciji, u opisu smo ispravili udaljenost.",
        },
        {
          guestId: guest3.id,
          checkIn: [2026, 5, 15],
          checkOut: [2026, 5, 19],
          numGuests: 3,
          rating: 4,
          comment:
            "Čisto, mirno i praktično. Domaćica je vrlo susretljiva i brzo odgovara.",
          ownerReply: "Hvala vam!",
        },
        {
          guestId: guest4.id,
          checkIn: [2026, 5, 22],
          checkOut: [2026, 5, 25],
          numGuests: 2,
          rating: 2,
          comment:
            "Nije bilo tople vode prva dva dana, a bojler je popravljen tek treći dan boravka.",
          ownerReply:
            "Ispričavam se zbog kvara i sporog popravka. Bojler je zamijenjen novim, a dio iznosa vam je vraćen.",
        },
        {
          guestId: guest5.id,
          checkIn: [2026, 5, 28],
          checkOut: [2026, 6, 2],
          numGuests: 4,
          rating: 4,
          comment:
            "Novi bojler radi bez problema, tople vode je bilo dovoljno za četvero. Apartman je čist i prostran.",
          ownerReply: "Hvala vam! Drago mi je da je zamjena riješila problem.",
        },
        {
          guestId: guest1.id,
          checkIn: [2026, 6, 5],
          checkOut: [2026, 6, 7],
          numGuests: 2,
          rating: 5,
          comment:
            "Kratak vikend i savršen mir. Zelenilo oko zgrade i tišina su glavni adut.",
          ownerReply: "Hvala, veselimo se vašem povratku!",
        },
        {
          guestId: guest2.id,
          checkIn: [2026, 6, 10],
          checkOut: [2026, 6, 15],
          numGuests: 4,
          rating: 4,
          comment:
            "Vrlo ugodan boravak s obitelji. Klima hladi dobro, ali samo u dnevnom boravku.",
          ownerReply:
            "Hvala na primjedbi, ugradnja uređaja u spavaćoj sobi je dogovorena.",
        },
        {
          guestId: guest3.id,
          checkIn: [2026, 6, 18],
          checkOut: [2026, 6, 21],
          numGuests: 3,
          rating: 1,
          comment:
            "U kuhinji je bilo insekata, a čistoća je bila ispod svake razine. Otišli smo dan ranije.",
          ownerReply:
            "Duboko se ispričavam. Naručili smo dezinsekciju, promijenili servis za čišćenje i vratili vam cijeli iznos.",
        },
        {
          guestId: guest4.id,
          checkIn: [2026, 6, 24],
          checkOut: [2026, 6, 29],
          numGuests: 4,
          rating: 5,
          comment:
            "Nakon loše recenzije bili smo oprezni, ali apartman je bio besprijekorno čist i sve je radilo. Domaćica je očito reagirala.",
          ownerReply:
            "Hvala vam što ste dali priliku, bilo mi je važno sve dovesti u red.",
        },
        {
          guestId: guest5.id,
          checkIn: [2026, 7, 2],
          checkOut: [2026, 7, 7],
          numGuests: 3,
          rating: 3,
          comment:
            "Apartman je čist i miran, ali ljeti je gornja soba pretopla bez klime.",
          ownerReply: "Hvala, klima u gornjoj sobi se ugrađuje ovog mjeseca.",
        },
      ],
    },
  ]; // kraj curatedGroups

  const curatedReservations = [];
  const curatedReviews = [];

  for (const group of curatedGroups) {
    const pricePerNight = priceByApartment[group.apartmentId] || 80;

    group.stays.forEach((stay, index) => {
      const checkIn = utcDate(...stay.checkIn);
      const checkOut = utcDate(...stay.checkOut);
      const nights = Math.round((checkOut - checkIn) / (24 * 60 * 60 * 1000));
      const serial = pad12(group.idOffset + index + 1);
      const reservationId = `42000000-0000-0000-0000-${serial}`;
      const reviewCreatedAt = new Date(checkOut);
      reviewCreatedAt.setUTCDate(reviewCreatedAt.getUTCDate() + 1);

      curatedReservations.push({
        id: reservationId,
        apartmentId: group.apartmentId,
        guestId: stay.guestId,
        checkIn,
        checkOut,
        numGuests: stay.numGuests,
        totalPrice: nights * pricePerNight,
        status: "COMPLETED",
      });

      curatedReviews.push({
        id: `52000000-0000-0000-0000-${serial}`,
        reservationId,
        apartmentId: group.apartmentId,
        guestId: stay.guestId,
        rating: stay.rating,
        comment: stay.comment,
        ownerReply: stay.ownerReply,
        createdAt: reviewCreatedAt,
      });
    });
  }

  for (const reservation of curatedReservations) {
    await prisma.reservation.upsert({
      where: { id: reservation.id },
      update: reservation,
      create: reservation,
    });
  }

  for (const review of curatedReviews) {
    await prisma.review.upsert({
      where: { id: review.id },
      update: review,
      create: review,
    });
  }

  console.log(
    `Ostali apartmani (travanj–srpanj 2026): ${curatedReservations.length} rezervacija i ${curatedReviews.length} recenzija.`,
  );

  const messages = [
    {
      id: IDS.messages.m1,
      reservationId: IDS.reservations.r2,
      senderId: guest2.id,
      content: "Pozdrav! Dolazimo oko 19h, je li moguć kasniji check-in?",
    },
    {
      id: IDS.messages.m2,
      reservationId: IDS.reservations.r2,
      senderId: owner1.id,
      content: "Naravno, kasni check-in je moguć. Vidimo se! ",
    },
  ];

  for (const message of messages) {
    await prisma.message.upsert({
      where: { id: message.id },
      update: message,
      create: message,
    });
  }

  const notifications = [
    {
      id: IDS.notifications.n1,
      userId: owner1.id,
      type: "RESERVATION_NEW",
      content: 'Nova rezervacija za "Sunset Apartment Split".',
      isRead: false,
    },
    {
      id: IDS.notifications.n2,
      userId: guest2.id,
      type: "RESERVATION_CONFIRMED",
      content: "Vaša rezervacija je potvrđena.",
      isRead: false,
    },
    {
      id: IDS.notifications.n3,
      userId: admin.id,
      type: "APARTMENT_REJECTED",
      content: "Primjer administratorske obavijesti za moderaciju.",
      isRead: true,
    },
  ];

  for (const notification of notifications) {
    await prisma.notification.upsert({
      where: { id: notification.id },
      update: notification,
      create: notification,
    });
  }

  console.log("Seed završen.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
