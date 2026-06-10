export function statusBadgeClass(status) {
  if (status === 'APPROVED' || status === 'CONFIRMED' || status === 'COMPLETED') {
    return 'badge badge-ok';
  }
  if (status === 'PENDING') {
    return 'badge badge-warn';
  }
  return 'badge badge-neutral';
}
