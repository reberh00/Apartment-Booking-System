const router = require("express").Router();
const { z } = require("zod");
const prisma = require("../utils/prisma");
const { authenticate } = require("../middleware/auth");
const { createError } = require("../middleware/errorHandler");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const UUID = "[0-9a-fA-F-]{36}";

const checkoutSessionSchema = z.object({
  apartmentId: z.string().uuid(),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  numGuests: z.number().int().positive(),
});

const verifySessionSchema = z.object({
  sessionId: z.string().min(1),
});

async function createReservationFromSession(session) {
  if (session.payment_status !== "paid") {
    return null;
  }

  const { apartmentId, guestId, checkIn, checkOut, numGuests, totalPrice } =
    session.metadata || {};

  if (
    !apartmentId ||
    !guestId ||
    !checkIn ||
    !checkOut ||
    !numGuests ||
    !totalPrice
  ) {
    console.error("Missing required metadata fields on session", session.id);
    return null;
  }

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id || null;

  const existing = paymentIntentId
    ? await prisma.reservation.findFirst({
        where: { stripePaymentIntentId: paymentIntentId },
      })
    : null;

  if (existing) {
    return existing;
  }

  const apartment = await prisma.apartment.findUnique({
    where: { id: apartmentId },
    select: { ownerId: true, title: true },
  });

  const guest = await prisma.user.findUnique({
    where: { id: guestId },
    select: { firstName: true, lastName: true },
  });

  if (!apartment || !guest) {
    console.error("Apartment or guest not found for session", session.id);
    return null;
  }

  const [reservation] = await prisma.$transaction([
    prisma.reservation.create({
      data: {
        apartmentId,
        guestId,
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        numGuests: parseInt(numGuests, 10),
        totalPrice: parseFloat(totalPrice),
        status: "PENDING",
        paymentStatus: "PAID",
        paymentAmount: parseFloat(session.amount_total) / 100,
        stripePaymentIntentId: paymentIntentId,
      },
    }),
    prisma.notification.create({
      data: {
        userId: apartment.ownerId,
        type: "RESERVATION_NEW",
        content: `Nova plaćena rezervacija za "${apartment.title}" od ${guest.firstName} ${guest.lastName} - čeka vašu potvrdu`,
      },
    }),
  ]);

  return reservation;
}

router.post(
  "/create-checkout-session",
  authenticate,
  async (req, res, next) => {
    try {
      const { apartmentId, checkIn, checkOut, numGuests } =
        checkoutSessionSchema.parse(req.body);

      const apartment = await prisma.apartment.findUnique({
        where: { id: apartmentId },
        select: {
          id: true,
          title: true,
          ownerId: true,
          pricePerNight: true,
          minNights: true,
          maxGuests: true,
          status: true,
        },
      });

      if (!apartment) {
        return next(createError("Apartman nije pronađen", 404));
      }

      if (apartment.status !== "APPROVED") {
        return next(
          createError(
            "Ovaj apartman trenutno nije dostupan za rezervaciju",
            400,
          ),
        );
      }

      if (apartment.ownerId === req.user.id) {
        return next(
          createError("Ne možete rezervirati vlastiti apartman", 403),
        );
      }

      const ci = new Date(checkIn);
      const co = new Date(checkOut);

      if (ci <= new Date()) {
        return next(createError("Datum check-in mora biti u budućnosti"));
      }

      if (co <= new Date()) {
        return next(createError("Datum check-out mora biti u budućnosti"));
      }

      if (ci >= co) {
        return next(createError("Datum check-out mora biti nakon check-in"));
      }

      if (numGuests > apartment.maxGuests) {
        return next(
          createError(
            `Apartman prima maksimalno ${apartment.maxGuests} gostiju`,
          ),
        );
      }

      const nights = Math.ceil((co - ci) / (1000 * 60 * 60 * 24));
      if (nights < apartment.minNights) {
        return next(
          createError(`Minimalni boravak je ${apartment.minNights} noć/i`),
        );
      }

      const totalPrice = parseFloat(apartment.pricePerNight) * nights;
      const amountInCents = Math.round(totalPrice * 100);

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: `Rezervacija: ${apartment.title}`,
                description: `Check-in: ${ci.toLocaleDateString()} - Check-out: ${co.toLocaleDateString()}`,
              },
              unit_amount: amountInCents,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.FRONTEND_URL}/app/apartments/${apartmentId}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/app/apartments/${apartmentId}?payment=cancelled`,
        metadata: {
          apartmentId,
          guestId: req.user.id,
          checkIn: checkIn,
          checkOut: checkOut,
          numGuests: numGuests.toString(),
          totalPrice: totalPrice.toString(),
        },
      });

      res.json({ url: session.url });
    } catch (err) {
      next(err);
    }
  },
);

router.post("/verify-session", authenticate, async (req, res, next) => {
  try {
    const { sessionId } = verifySessionSchema.parse(req.body);

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });

    if (session.metadata?.guestId !== req.user.id) {
      return next(createError("Nemate ovlasti za ovu sesiju", 403));
    }

    if (session.payment_status !== "paid") {
      return res.json({ paid: false, reservationId: null });
    }

    const reservation = await createReservationFromSession(session);

    if (!reservation) {
      return next(createError("Greška pri kreiranju rezervacije", 500));
    }

    res.json({ paid: true, reservationId: reservation.id });
  } catch (err) {
    next(err);
  }
});

router.post("/webhook", async (req, res, next) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    return next(
      createError(`Webhook signature verification failed: ${err.message}`, 400),
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        await createReservationFromSession(event.data.object);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
