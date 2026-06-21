const router = require("express").Router();
const { z } = require("zod");
const { authenticate } = require("../middleware/auth");
const { createError } = require("../middleware/errorHandler");

const PHOTON_URL = "https://photon.komoot.io/api/";
const PLACE_TYPES = ["city", "town", "village", "hamlet"];

const searchSchema = z.object({
  q: z.string().trim().min(3),
});

function pickCity(props) {
  const city = props.city || props.town || props.village || props.county;
  if (city) {
    return city;
  }
  if (PLACE_TYPES.includes(props.osm_value)) {
    return props.name;
  }
  return "";
}

function pickAddress(props) {
  if (props.street) {
    return props.housenumber
      ? `${props.street} ${props.housenumber}`
      : props.street;
  }
  return "";
}

function buildLabel(props) {
  const address = pickAddress(props);
  const city = pickCity(props);
  const segments = [];

  if (address) {
    segments.push(address);
  }
  if (city) {
    segments.push(props.postcode ? `${props.postcode} ${city}` : city);
  }
  if (props.state && props.state !== city) {
    segments.push(props.state);
  }
  if (props.country) {
    segments.push(props.country);
  }

  return segments.filter(Boolean).join(", ");
}

function normalizeFeature(feature) {
  const props = feature.properties || {};
  const coords = feature.geometry?.coordinates;

  if (!Array.isArray(coords) || coords.length < 2 || !props.country) {
    return null;
  }

  return {
    placeId: `${props.osm_type || ""}${props.osm_id || ""}`,
    label: buildLabel(props),
    address: pickAddress(props),
    city: pickCity(props),
    country: props.country,
    countryCode: (props.countrycode || "").toUpperCase(),
    state: props.state || "",
    postcode: props.postcode || "",
    latitude: coords[1],
    longitude: coords[0],
  };
}

router.get("/search", authenticate, async (req, res, next) => {
  try {
    const { q } = searchSchema.parse(req.query);

    const url = `${PHOTON_URL}?q=${encodeURIComponent(q)}&limit=6&lang=en`;
    const response = await fetch(url, {
      headers: { "User-Agent": "diplomskiBooking/1.0" },
    });

    if (!response.ok) {
      return next(createError("Geokodiranje trenutno nije dostupno", 502));
    }

    const data = await response.json();
    const results = (data.features || []).map(normalizeFeature).filter(Boolean);

    res.json({ results });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
