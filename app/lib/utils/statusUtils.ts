/**
 * Get badge color classes based on status
 */
export function getStatusBadgeColor(status: string): string {
  const lowerStatus = status.toLowerCase();
  if (lowerStatus === "resolved") {
    return "bg-green-100 text-green-800";
  } else if (lowerStatus === "pending") {
    return "bg-orange-100 text-orange-800";
  } else if (lowerStatus === "on process" || lowerStatus === "onprocess") {
    return "bg-blue-100 text-blue-800";
  } else {
    return "bg-gray-100 text-gray-800";
  }
}

/**
 * Get payment status badge color
 */
export function getPaymentStatusBadgeColor(status: string): string {
  const lowerStatus = status.toLowerCase();
  if (lowerStatus === "paid early") {
    return "bg-green-100 text-green-800";
  } else if (lowerStatus === "paid late") {
    return "bg-orange-100 text-orange-800";
  } else if (lowerStatus === "not yet paid") {
    return "bg-red-100 text-red-800";
  } else {
    return "bg-gray-100 text-gray-800";
  }
}

