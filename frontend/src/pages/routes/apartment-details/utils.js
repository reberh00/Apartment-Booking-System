export const editableKeys = [
  "title",
  "description",
  "city",
  "country",
  "address",
  "latitude",
  "longitude",
  "pricePerNight",
  "maxGuests",
  "minNights",
  "cancellationPolicy",
];

export function formatCurrency(value) {
  return `${Number(value || 0).toFixed(2)} EUR`;
}

export function formatDateInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function parseDateFromInput(value) {
  if (!value) return null;
  const parsed = new Date(value);
  parsed.setHours(0, 0, 0, 0);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

export function calculateNights(checkIn, checkOut) {
  const from = parseDateFromInput(checkIn);
  const to = parseDateFromInput(checkOut);

  if (!from || !to || to <= from) {
    return 0;
  }

  return Math.floor((to - from) / (1000 * 60 * 60 * 24));
}

export function isDateInRange(date, range) {
  if (!range?.from || !range?.to) return false;
  return date >= range.from && date <= range.to;
}

export function formatDate(date) {
  const parsed = new Date(date);
  const day = String(parsed.getDate()).padStart(2, "0");
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const year = parsed.getFullYear();
  return `${day}-${month}-${year}`;
}
