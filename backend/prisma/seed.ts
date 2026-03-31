import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // ── Sites ─────────────────────────────────────────────────────────────────
  await prisma.site.upsert({
    where: { id: 'site_alpha' },
    update: {},
    create: {
      id: 'site_alpha',
      name: 'Alpha Tower',
      latitude: 8.9943,
      longitude: -79.5188,
    },
  });

  await prisma.site.upsert({
    where: { id: 'site_beta' },
    update: {},
    create: {
      id: 'site_beta',
      name: 'Beta Hub',
      latitude: 8.9936,
      longitude: -79.5201,
    },
  });

  // ── Spaces — Alpha Tower ──────────────────────────────────────────────────
  await prisma.space.upsert({
    where: { id: 'space_alpha_1' },
    update: {},
    create: {
      id: 'space_alpha_1',
      siteId: 'site_alpha',
      name: 'Board Room',
      capacity: 12,
      locationReference: 'Floor 3, North Wing',
    },
  });

  await prisma.space.upsert({
    where: { id: 'space_alpha_2' },
    update: {},
    create: {
      id: 'space_alpha_2',
      siteId: 'site_alpha',
      name: 'Focus Pod A',
      capacity: 2,
      locationReference: 'Floor 2, East Wing',
    },
  });

  await prisma.space.upsert({
    where: { id: 'space_alpha_3' },
    update: {},
    create: {
      id: 'space_alpha_3',
      siteId: 'site_alpha',
      name: 'Focus Pod B',
      capacity: 2,
      locationReference: 'Floor 2, East Wing',
    },
  });

  await prisma.space.upsert({
    where: { id: 'space_alpha_4' },
    update: {},
    create: {
      id: 'space_alpha_4',
      siteId: 'site_alpha',
      name: 'Open Collab',
      capacity: 8,
      locationReference: 'Floor 1, Central',
    },
  });

  // ── Spaces — Beta Hub ─────────────────────────────────────────────────────
  await prisma.space.upsert({
    where: { id: 'space_beta_1' },
    update: {},
    create: {
      id: 'space_beta_1',
      siteId: 'site_beta',
      name: 'Innovation Lab',
      capacity: 10,
      locationReference: 'Level 4, West',
    },
  });

  await prisma.space.upsert({
    where: { id: 'space_beta_2' },
    update: {},
    create: {
      id: 'space_beta_2',
      siteId: 'site_beta',
      name: 'Quiet Room',
      capacity: 1,
      locationReference: 'Level 2, South',
    },
  });

  await prisma.space.upsert({
    where: { id: 'space_beta_3' },
    update: {},
    create: {
      id: 'space_beta_3',
      siteId: 'site_beta',
      name: 'War Room',
      capacity: 6,
      locationReference: 'Level 3, North',
    },
  });

  await prisma.space.upsert({
    where: { id: 'space_beta_4' },
    update: {},
    create: {
      id: 'space_beta_4',
      siteId: 'site_beta',
      name: 'Lounge Desk',
      capacity: 4,
      locationReference: 'Level 1, Central',
    },
  });

  // ── Bookings ──────────────────────────────────────────────────────────────
  // 24 bookings across 4 users, April–May 2026.
  // Constraints verified: no space overlap at same time; ≤ 3 bookings/user/ISO week.
  //
  // ISO week starts (Mon 00:00 UTC):
  //   Apr 6, Apr 13, Apr 20, Apr 27, May 4, May 11, May 18, May 25

  const bookings = [
    // ── Evelyn (evelyn@darient.com) ── 6 bookings ──────────────────────────
    // Week Apr 6 — 3 bookings
    {
      id: 'booking_evelyn_1',
      spaceId: 'space_alpha_1',
      siteId: 'site_alpha',
      clientEmail: 'evelyn@darient.com',
      bookingDate: new Date('2026-04-07T00:00:00.000Z'),
      startTime: new Date('2026-04-07T09:00:00.000Z'),
      endTime: new Date('2026-04-07T10:00:00.000Z'),
    },
    {
      id: 'booking_evelyn_2',
      spaceId: 'space_beta_1',
      siteId: 'site_beta',
      clientEmail: 'evelyn@darient.com',
      bookingDate: new Date('2026-04-08T00:00:00.000Z'),
      startTime: new Date('2026-04-08T14:00:00.000Z'),
      endTime: new Date('2026-04-08T15:00:00.000Z'),
    },
    {
      id: 'booking_evelyn_3',
      spaceId: 'space_alpha_4',
      siteId: 'site_alpha',
      clientEmail: 'evelyn@darient.com',
      bookingDate: new Date('2026-04-09T00:00:00.000Z'),
      startTime: new Date('2026-04-09T11:00:00.000Z'),
      endTime: new Date('2026-04-09T12:00:00.000Z'),
    },
    // Week Apr 20 — 1 booking
    {
      id: 'booking_evelyn_4',
      spaceId: 'space_alpha_2',
      siteId: 'site_alpha',
      clientEmail: 'evelyn@darient.com',
      bookingDate: new Date('2026-04-21T00:00:00.000Z'),
      startTime: new Date('2026-04-21T09:00:00.000Z'),
      endTime: new Date('2026-04-21T10:00:00.000Z'),
    },
    // Week May 4 — 1 booking
    {
      id: 'booking_evelyn_5',
      spaceId: 'space_beta_3',
      siteId: 'site_beta',
      clientEmail: 'evelyn@darient.com',
      bookingDate: new Date('2026-05-05T00:00:00.000Z'),
      startTime: new Date('2026-05-05T10:00:00.000Z'),
      endTime: new Date('2026-05-05T11:00:00.000Z'),
    },
    // Week May 11 — 1 booking
    {
      id: 'booking_evelyn_6',
      spaceId: 'space_alpha_1',
      siteId: 'site_alpha',
      clientEmail: 'evelyn@darient.com',
      bookingDate: new Date('2026-05-12T00:00:00.000Z'),
      startTime: new Date('2026-05-12T13:00:00.000Z'),
      endTime: new Date('2026-05-12T14:00:00.000Z'),
    },

    // ── Daniela (daniela@darient.com) ── 6 bookings ────────────────────────
    // Week Apr 6 — 1 booking
    {
      id: 'booking_daniela_1',
      spaceId: 'space_alpha_3',
      siteId: 'site_alpha',
      clientEmail: 'daniela@darient.com',
      bookingDate: new Date('2026-04-07T00:00:00.000Z'),
      startTime: new Date('2026-04-07T09:00:00.000Z'),
      endTime: new Date('2026-04-07T10:00:00.000Z'),
    },
    // Week Apr 13 — 2 bookings
    {
      id: 'booking_daniela_2',
      spaceId: 'space_beta_2',
      siteId: 'site_beta',
      clientEmail: 'daniela@darient.com',
      bookingDate: new Date('2026-04-14T00:00:00.000Z'),
      startTime: new Date('2026-04-14T11:00:00.000Z'),
      endTime: new Date('2026-04-14T12:00:00.000Z'),
    },
    {
      id: 'booking_daniela_3',
      spaceId: 'space_alpha_2',
      siteId: 'site_alpha',
      clientEmail: 'daniela@darient.com',
      bookingDate: new Date('2026-04-15T00:00:00.000Z'),
      startTime: new Date('2026-04-15T14:00:00.000Z'),
      endTime: new Date('2026-04-15T15:00:00.000Z'),
    },
    // Week Apr 27 — 1 booking
    {
      id: 'booking_daniela_4',
      spaceId: 'space_beta_4',
      siteId: 'site_beta',
      clientEmail: 'daniela@darient.com',
      bookingDate: new Date('2026-04-28T00:00:00.000Z'),
      startTime: new Date('2026-04-28T09:00:00.000Z'),
      endTime: new Date('2026-04-28T10:00:00.000Z'),
    },
    // Week May 4 — 1 booking
    {
      id: 'booking_daniela_5',
      spaceId: 'space_alpha_3',
      siteId: 'site_alpha',
      clientEmail: 'daniela@darient.com',
      bookingDate: new Date('2026-05-06T00:00:00.000Z'),
      startTime: new Date('2026-05-06T14:00:00.000Z'),
      endTime: new Date('2026-05-06T15:00:00.000Z'),
    },
    // Week May 18 — 1 booking
    {
      id: 'booking_daniela_6',
      spaceId: 'space_beta_1',
      siteId: 'site_beta',
      clientEmail: 'daniela@darient.com',
      bookingDate: new Date('2026-05-19T00:00:00.000Z'),
      startTime: new Date('2026-05-19T10:00:00.000Z'),
      endTime: new Date('2026-05-19T11:00:00.000Z'),
    },

    // ── Michael (michael@darient.com) ── 6 bookings ────────────────────────
    // Week Apr 13 — 3 bookings
    {
      id: 'booking_michael_1',
      spaceId: 'space_alpha_1',
      siteId: 'site_alpha',
      clientEmail: 'michael@darient.com',
      bookingDate: new Date('2026-04-13T00:00:00.000Z'),
      startTime: new Date('2026-04-13T09:00:00.000Z'),
      endTime: new Date('2026-04-13T10:00:00.000Z'),
    },
    {
      id: 'booking_michael_2',
      spaceId: 'space_alpha_4',
      siteId: 'site_alpha',
      clientEmail: 'michael@darient.com',
      bookingDate: new Date('2026-04-14T00:00:00.000Z'),
      startTime: new Date('2026-04-14T14:00:00.000Z'),
      endTime: new Date('2026-04-14T15:00:00.000Z'),
    },
    {
      id: 'booking_michael_3',
      spaceId: 'space_beta_3',
      siteId: 'site_beta',
      clientEmail: 'michael@darient.com',
      bookingDate: new Date('2026-04-16T00:00:00.000Z'),
      startTime: new Date('2026-04-16T11:00:00.000Z'),
      endTime: new Date('2026-04-16T12:00:00.000Z'),
    },
    // Week Apr 27 — 1 booking
    {
      id: 'booking_michael_4',
      spaceId: 'space_alpha_1',
      siteId: 'site_alpha',
      clientEmail: 'michael@darient.com',
      bookingDate: new Date('2026-04-27T00:00:00.000Z'),
      startTime: new Date('2026-04-27T09:00:00.000Z'),
      endTime: new Date('2026-04-27T10:00:00.000Z'),
    },
    // Week May 11 — 1 booking
    {
      id: 'booking_michael_5',
      spaceId: 'space_beta_2',
      siteId: 'site_beta',
      clientEmail: 'michael@darient.com',
      bookingDate: new Date('2026-05-11T00:00:00.000Z'),
      startTime: new Date('2026-05-11T10:00:00.000Z'),
      endTime: new Date('2026-05-11T11:00:00.000Z'),
    },
    // Week May 18 — 1 booking
    {
      id: 'booking_michael_6',
      spaceId: 'space_alpha_4',
      siteId: 'site_alpha',
      clientEmail: 'michael@darient.com',
      bookingDate: new Date('2026-05-20T00:00:00.000Z'),
      startTime: new Date('2026-05-20T14:00:00.000Z'),
      endTime: new Date('2026-05-20T15:00:00.000Z'),
    },

    // ── Freddy (freddy@darient.com) ── 6 bookings ──────────────────────────
    // Week Apr 20 — 3 bookings
    {
      id: 'booking_freddy_1',
      spaceId: 'space_beta_1',
      siteId: 'site_beta',
      clientEmail: 'freddy@darient.com',
      bookingDate: new Date('2026-04-20T00:00:00.000Z'),
      startTime: new Date('2026-04-20T09:00:00.000Z'),
      endTime: new Date('2026-04-20T10:00:00.000Z'),
    },
    {
      id: 'booking_freddy_2',
      spaceId: 'space_alpha_3',
      siteId: 'site_alpha',
      clientEmail: 'freddy@darient.com',
      bookingDate: new Date('2026-04-22T00:00:00.000Z'),
      startTime: new Date('2026-04-22T11:00:00.000Z'),
      endTime: new Date('2026-04-22T12:00:00.000Z'),
    },
    {
      id: 'booking_freddy_3',
      spaceId: 'space_beta_4',
      siteId: 'site_beta',
      clientEmail: 'freddy@darient.com',
      bookingDate: new Date('2026-04-23T00:00:00.000Z'),
      startTime: new Date('2026-04-23T14:00:00.000Z'),
      endTime: new Date('2026-04-23T15:00:00.000Z'),
    },
    // Week May 4 — 1 booking
    {
      id: 'booking_freddy_4',
      spaceId: 'space_alpha_2',
      siteId: 'site_alpha',
      clientEmail: 'freddy@darient.com',
      bookingDate: new Date('2026-05-04T00:00:00.000Z'),
      startTime: new Date('2026-05-04T09:00:00.000Z'),
      endTime: new Date('2026-05-04T10:00:00.000Z'),
    },
    // Week May 11 — 1 booking
    {
      id: 'booking_freddy_5',
      spaceId: 'space_beta_3',
      siteId: 'site_beta',
      clientEmail: 'freddy@darient.com',
      bookingDate: new Date('2026-05-13T00:00:00.000Z'),
      startTime: new Date('2026-05-13T10:00:00.000Z'),
      endTime: new Date('2026-05-13T11:00:00.000Z'),
    },
    // Week May 25 — 1 booking
    {
      id: 'booking_freddy_6',
      spaceId: 'space_alpha_1',
      siteId: 'site_alpha',
      clientEmail: 'freddy@darient.com',
      bookingDate: new Date('2026-05-25T00:00:00.000Z'),
      startTime: new Date('2026-05-25T14:00:00.000Z'),
      endTime: new Date('2026-05-25T15:00:00.000Z'),
    },
  ];

  for (const b of bookings) {
    await prisma.booking.upsert({
      where: { id: b.id },
      update: {},
      create: b,
    });
  }

  // ── BookingWeeklySummary ───────────────────────────────────────────────────
  // One record per (clientEmail, weekStart). Counts reflect the seed bookings above.
  // weekStart = Monday 00:00:00 UTC of each ISO week.

  const summaries = [
    // Evelyn
    { clientEmail: 'evelyn@darient.com', weekStart: new Date('2026-04-06T00:00:00.000Z'), count: 3 },
    { clientEmail: 'evelyn@darient.com', weekStart: new Date('2026-04-20T00:00:00.000Z'), count: 1 },
    { clientEmail: 'evelyn@darient.com', weekStart: new Date('2026-05-04T00:00:00.000Z'), count: 1 },
    { clientEmail: 'evelyn@darient.com', weekStart: new Date('2026-05-11T00:00:00.000Z'), count: 1 },
    // Daniela
    { clientEmail: 'daniela@darient.com', weekStart: new Date('2026-04-06T00:00:00.000Z'), count: 1 },
    { clientEmail: 'daniela@darient.com', weekStart: new Date('2026-04-13T00:00:00.000Z'), count: 2 },
    { clientEmail: 'daniela@darient.com', weekStart: new Date('2026-04-27T00:00:00.000Z'), count: 1 },
    { clientEmail: 'daniela@darient.com', weekStart: new Date('2026-05-04T00:00:00.000Z'), count: 1 },
    { clientEmail: 'daniela@darient.com', weekStart: new Date('2026-05-18T00:00:00.000Z'), count: 1 },
    // Michael
    { clientEmail: 'michael@darient.com', weekStart: new Date('2026-04-13T00:00:00.000Z'), count: 3 },
    { clientEmail: 'michael@darient.com', weekStart: new Date('2026-04-27T00:00:00.000Z'), count: 1 },
    { clientEmail: 'michael@darient.com', weekStart: new Date('2026-05-11T00:00:00.000Z'), count: 1 },
    { clientEmail: 'michael@darient.com', weekStart: new Date('2026-05-18T00:00:00.000Z'), count: 1 },
    // Freddy
    { clientEmail: 'freddy@darient.com', weekStart: new Date('2026-04-20T00:00:00.000Z'), count: 3 },
    { clientEmail: 'freddy@darient.com', weekStart: new Date('2026-05-04T00:00:00.000Z'), count: 1 },
    { clientEmail: 'freddy@darient.com', weekStart: new Date('2026-05-11T00:00:00.000Z'), count: 1 },
    { clientEmail: 'freddy@darient.com', weekStart: new Date('2026-05-25T00:00:00.000Z'), count: 1 },
  ];

  for (const s of summaries) {
    await prisma.bookingWeeklySummary.upsert({
      where: { clientEmail_weekStart: { clientEmail: s.clientEmail, weekStart: s.weekStart } },
      update: { count: s.count },
      create: s,
    });
  }

  console.log('Seed complete: 2 sites, 8 spaces, 24 bookings, 17 weekly summaries');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
