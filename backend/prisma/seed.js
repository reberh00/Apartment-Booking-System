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

  for (const apartment of apartments) {
    const count = randInt(reservationRng, 8, 25);
    for (let i = 0; i < count; i++) {
      const startDaysAgo = randInt(reservationRng, 30, 1825);
      const nights = randInt(reservationRng, 2, 7);
      const pricePerNight = priceByApartment[apartment.id] || 80;
      const maxGuests = maxGuestsByApartment[apartment.id] || 4;
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
