export function statusBadgeClass(status) {
  if (
    status === "APPROVED" ||
    status === "CONFIRMED" ||
    status === "COMPLETED"
  ) {
    return "badge badge-ok";
  }
  if (status === "PENDING") {
    return "badge badge-warn";
  }
  return "badge badge-neutral";
}

const APARTMENT_STATUS_LABELS = {
  PENDING: "Na čekanju",
  APPROVED: "Aktivan",
  REJECTED: "Odbijen",
  INACTIVE: "Isključen",
};

export function apartmentStatusLabel(status) {
  return APARTMENT_STATUS_LABELS[status] || status;
}
