export const orderStatusSteps = [
  { key: "placed", label: "Order Placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
] as const;

export const orderStatusColors = {
  confirmed: "bg-green-100 text-green-800",
  paid: "bg-green-100 text-green-800",
  shipped: "bg-blue-100 text-blue-800",
  delivered: "bg-blue-100 text-blue-800",
  pending: "bg-yellow-100 text-yellow-800",
  awaiting: "bg-yellow-100 text-yellow-800",
  cancelled: "bg-red-100 text-red-800",
  default: "bg-gray-100 text-gray-800",
} as const;

export const getStatusColor = (status: string): string => {
  const statusLower = status.toLowerCase();
  if (statusLower.includes("confirmed") || statusLower.includes("paid")) {
    return orderStatusColors.confirmed;
  }
  if (statusLower.includes("shipped") || statusLower.includes("delivered")) {
    return orderStatusColors.shipped;
  }
  if (statusLower.includes("pending") || statusLower.includes("awaiting")) {
    return orderStatusColors.pending;
  }
  if (statusLower.includes("cancelled")) {
    return orderStatusColors.cancelled;
  }
  return orderStatusColors.default;
};

