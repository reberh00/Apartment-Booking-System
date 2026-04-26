require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const IDS = {
  apartments: {
    apt1: '10000000-0000-0000-0000-000000000001',
    apt2: '10000000-0000-0000-0000-000000000002',
    apt3: '10000000-0000-0000-0000-000000000003',
  },
  blocks: {
    b1: '30000000-0000-0000-0000-000000000001',
    b2: '30000000-0000-0000-0000-000000000002',
  },
  reservations: {
    r1: '40000000-0000-0000-0000-000000000001',
    r2: '40000000-0000-0000-0000-000000000002',
    r3: '40000000-0000-0000-0000-000000000003',
    r4: '40000000-0000-0000-0000-000000000004',
  },
  reviews: {
    rev1: '50000000-0000-0000-0000-000000000001',
  },
  messages: {
    m1: '60000000-0000-0000-0000-000000000001',
    m2: '60000000-0000-0000-0000-000000000002',
  },
  notifications: {
    n1: '70000000-0000-0000-0000-000000000001',
    n2: '70000000-0000-0000-0000-000000000002',
    n3: '70000000-0000-0000-0000-000000000003',
  },
};

function addDays(days) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d;
}

async function main() {
  console.log('Seeding baze podataka...');

  const adminPassword = await bcrypt.hash('admin123456', 12);
  const demoPassword = await bcrypt.hash('password123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@apartmani.hr' },
    update: {
      firstName: 'Admin',
      lastName: 'Apartmani',
      role: 'ADMIN',
      passwordHash: adminPassword,
    },
    create: {
      email: 'admin@apartmani.hr',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'Apartmani',
      role: 'ADMIN',
      phone: '+385910000001',
    },
  });

  const owner1 = await prisma.user.upsert({
    where: { email: 'iva.vlasnik@apartmani.hr' },
    update: {
      firstName: 'Iva',
      lastName: 'Vlasnik',
      role: 'OWNER',
      passwordHash: demoPassword,
      phone: '+385910000002',
    },
    create: {
      email: 'iva.vlasnik@apartmani.hr',
      passwordHash: demoPassword,
      firstName: 'Iva',
      lastName: 'Vlasnik',
      role: 'OWNER',
      phone: '+385910000002',
    },
  });

  const owner2 = await prisma.user.upsert({
    where: { email: 'marko.iznajmljivac@apartmani.hr' },
    update: {
      firstName: 'Marko',
      lastName: 'Iznajmljivač',
      role: 'OWNER',
      passwordHash: demoPassword,
      phone: '+385910000003',
    },
    create: {
      email: 'marko.iznajmljivac@apartmani.hr',
      passwordHash: demoPassword,
      firstName: 'Marko',
      lastName: 'Iznajmljivač',
      role: 'OWNER',
      phone: '+385910000003',
    },
  });

  const guest1 = await prisma.user.upsert({
    where: { email: 'ana.gost@apartmani.hr' },
    update: {
      firstName: 'Ana',
      lastName: 'Gost',
      role: 'GUEST',
      passwordHash: demoPassword,
      phone: '+385910000004',
    },
    create: {
      email: 'ana.gost@apartmani.hr',
      passwordHash: demoPassword,
      firstName: 'Ana',
      lastName: 'Gost',
      role: 'GUEST',
      phone: '+385910000004',
    },
  });

  const guest2 = await prisma.user.upsert({
    where: { email: 'ivan.putnik@apartmani.hr' },
    update: {
      firstName: 'Ivan',
      lastName: 'Putnik',
      role: 'GUEST',
      passwordHash: demoPassword,
      phone: '+385910000005',
    },
    create: {
      email: 'ivan.putnik@apartmani.hr',
      passwordHash: demoPassword,
      firstName: 'Ivan',
      lastName: 'Putnik',
      role: 'GUEST',
      phone: '+385910000005',
    },
  });

  const contents = [
    { name: 'WiFi', icon: 'wifi' },
    { name: 'Parking', icon: 'parking' },
    { name: 'Klima uređaj', icon: 'air-condition' },
    { name: 'Bazen', icon: 'pool' },
    { name: 'Plaža u blizini', icon: 'beach' },
    { name: 'Kuhinja', icon: 'kitchen' },
    { name: 'Perilica rublja', icon: 'washer' },
    { name: 'TV', icon: 'tv' },
    { name: 'Balkon/Terasa', icon: 'balcony' },
    { name: 'Roštilj', icon: 'bbq' },
    { name: 'Ljubimci OK', icon: 'pets' },
    { name: 'Bicikli', icon: 'bike' },
  ];

  for (const content of contents) {
    await prisma.content.upsert({
      where: { name: content.name },
      update: { icon: content.icon },
      create: content,
    });
  }

  const contentMap = Object.fromEntries(
    (await prisma.content.findMany()).map((content) => [content.name, content.id]),
  );

  const apartments = [
    {
      id: IDS.apartments.apt1,
      ownerId: owner1.id,
      title: 'Sunset Apartment Split',
      description: 'Prostran apartman s pogledom na more, blizu centra i rive. Idealan za obitelji i duže boravke.',
      city: 'Split',
      country: 'Hrvatska',
      address: 'Ulica Kralja Zvonimira 12',
      latitude: 43.508133,
      longitude: 16.440193,
      pricePerNight: 95,
      maxGuests: 4,
      minNights: 2,
      cancellationPolicy: 'MODERATE',
      status: 'APPROVED',
    },
    {
      id: IDS.apartments.apt2,
      ownerId: owner2.id,
      title: 'Old Town Studio Dubrovnik',
      description: 'Moderan studio unutar zidina starog grada. Idealan za parove i city-break putovanja.',
      city: 'Dubrovnik',
      country: 'Hrvatska',
      address: 'Prijeko 24',
      latitude: 42.640663,
      longitude: 18.109453,
      pricePerNight: 120,
      maxGuests: 2,
      minNights: 3,
      cancellationPolicy: 'STRICT',
      status: 'APPROVED',
    },
    {
      id: IDS.apartments.apt3,
      ownerId: owner1.id,
      title: 'Zagreb Business Flat',
      description: 'Funkcionalan apartman u blizini poslovne zone i javnog prijevoza. Pogodno za poslovne goste.',
      city: 'Zagreb',
      country: 'Hrvatska',
      address: 'Savska cesta 100',
      latitude: 45.804375,
      longitude: 15.971052,
      pricePerNight: 80,
      maxGuests: 3,
      minNights: 1,
      cancellationPolicy: 'FLEXIBLE',
      status: 'PENDING',
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
    [IDS.apartments.apt1, 'WiFi'],
    [IDS.apartments.apt1, 'Parking'],
    [IDS.apartments.apt1, 'Klima uređaj'],
    [IDS.apartments.apt1, 'Kuhinja'],
    [IDS.apartments.apt1, 'Balkon/Terasa'],
    [IDS.apartments.apt2, 'WiFi'],
    [IDS.apartments.apt2, 'Klima uređaj'],
    [IDS.apartments.apt2, 'TV'],
    [IDS.apartments.apt2, 'Plaža u blizini'],
    [IDS.apartments.apt3, 'WiFi'],
    [IDS.apartments.apt3, 'Parking'],
    [IDS.apartments.apt3, 'Perilica rublja'],
    [IDS.apartments.apt3, 'TV'],
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

  const blocks = [
    {
      id: IDS.blocks.b1,
      apartmentId: IDS.apartments.apt1,
      startDate: addDays(10),
      endDate: addDays(12),
      reason: 'Servis klima uređaja',
    },
    {
      id: IDS.blocks.b2,
      apartmentId: IDS.apartments.apt2,
      startDate: addDays(25),
      endDate: addDays(28),
      reason: 'Privatno korištenje apartmana',
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
    {
      id: IDS.reservations.r1,
      apartmentId: IDS.apartments.apt1,
      guestId: guest1.id,
      checkIn: addDays(-20),
      checkOut: addDays(-16),
      numGuests: 2,
      totalPrice: 380,
      status: 'COMPLETED',
    },
    {
      id: IDS.reservations.r2,
      apartmentId: IDS.apartments.apt1,
      guestId: guest2.id,
      checkIn: addDays(18),
      checkOut: addDays(21),
      numGuests: 3,
      totalPrice: 285,
      status: 'CONFIRMED',
    },
    {
      id: IDS.reservations.r3,
      apartmentId: IDS.apartments.apt2,
      guestId: guest1.id,
      checkIn: addDays(35),
      checkOut: addDays(38),
      numGuests: 2,
      totalPrice: 360,
      status: 'PENDING',
    },
    {
      id: IDS.reservations.r4,
      apartmentId: IDS.apartments.apt2,
      guestId: guest2.id,
      checkIn: addDays(5),
      checkOut: addDays(8),
      numGuests: 2,
      totalPrice: 360,
      status: 'REJECTED',
    },
  ];

  for (const reservation of reservations) {
    await prisma.reservation.upsert({
      where: { id: reservation.id },
      update: reservation,
      create: reservation,
    });
  }

  await prisma.review.upsert({
    where: { reservationId: IDS.reservations.r1 },
    update: {
      apartmentId: IDS.apartments.apt1,
      guestId: guest1.id,
      rating: 5,
      comment: 'Odlična lokacija, uredno i točno kao na slikama. Vraćamo se opet!',
      ownerReply: 'Hvala vam na recenziji i dobrodošli ponovno!',
    },
    create: {
      id: IDS.reviews.rev1,
      reservationId: IDS.reservations.r1,
      apartmentId: IDS.apartments.apt1,
      guestId: guest1.id,
      rating: 5,
      comment: 'Odlična lokacija, uredno i točno kao na slikama. Vraćamo se opet!',
      ownerReply: 'Hvala vam na recenziji i dobrodošli ponovno!',
    },
  });

  const messages = [
    {
      id: IDS.messages.m1,
      reservationId: IDS.reservations.r2,
      senderId: guest2.id,
      content: 'Pozdrav! Dolazimo oko 19h, je li moguć kasniji check-in?',
    },
    {
      id: IDS.messages.m2,
      reservationId: IDS.reservations.r2,
      senderId: owner1.id,
      content: 'Naravno, kasni check-in je moguć. Vidimo se! ',
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
      type: 'RESERVATION_NEW',
      content: 'Nova rezervacija za "Sunset Apartment Split".',
      isRead: false,
    },
    {
      id: IDS.notifications.n2,
      userId: guest2.id,
      type: 'RESERVATION_CONFIRMED',
      content: 'Vaša rezervacija je potvrđena.',
      isRead: false,
    },
    {
      id: IDS.notifications.n3,
      userId: admin.id,
      type: 'APARTMENT_REJECTED',
      content: 'Primjer administratorske obavijesti za moderaciju.',
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

  console.log('Seed završen.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
