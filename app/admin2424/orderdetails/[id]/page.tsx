"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import type { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import AdminProtectedRoute from "@/components/auth/AdminProtectedRoute";
import { useAuth } from "@/app/context/AuthContext";
import RefundManagement from "@/components/Admin/RefundManagement";

export default function AdminOrderDetailsPage() {
  const params = useParams();
  const idParam = params?.id;
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [showTrackingDialog, setShowTrackingDialog] = useState(false);

  const order = useQuery(
    api.order.getById,
    typeof idParam === "string"
      ? { id: idParam as Id<"orders"> }
      : "skip"
  );
  const updateStatus = useMutation(api.order.updateStatus);
  const processOrderRequest = useMutation(api.order.processOrderRequest);
  const { user } = useAuth();
  
  // Get cancellation requests for this order
  const cancellationRequests = useQuery(
    api.order.getOrderRequestsByOrderId,
    order?.orderId ? { orderId: order.orderId } : "skip"
  );

  if (order === undefined) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50 text-gray-900 px-8 py-8">
        <p>Loading order…</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50 text-gray-900 px-8 py-8">
        <p>Order not found.</p>
      </div>
    );
  }

  type OrderItem = {
    id?: string;
    name?: string;
    size?: string | null;
    quantity?: number;
    price?: number;
    basePrice?: number;
    discount?: number;
  };

  const items = (order.items ?? []) as OrderItem[];

  const handleStatusChange = async (newStatus: string, newPaymentStatus?: string, requireTracking = false) => {
    if (!confirm(`Are you sure you want to update the order status to "${newStatus}"${newPaymentStatus ? ` and payment status to "${newPaymentStatus}"` : ""}? This will send an email notification to the customer.`)) {
      return;
    }

    if (requireTracking) {
      setShowTrackingDialog(true);
      return;
    }

    await updateStatus({
      id: order._id,
      status: newStatus,
      paymentStatus: newPaymentStatus || order.paymentStatus,
    });

    // Send email notification
    if (process.env.NEXT_PUBLIC_ADMIN_API_KEY && order.customerEmail) {
      fetch("/api/orders/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": process.env.NEXT_PUBLIC_ADMIN_API_KEY,
        },
        body: JSON.stringify({
          orderId: order.orderId,
          customerEmail: order.customerEmail,
          customerName: order.shippingName,
          status: newStatus,
        }),
      }).catch(() => {});
    }
  };

  const handleShipOrder = async () => {
    if (!trackingNumber.trim()) {
      alert("Please enter a tracking number");
      return;
    }

    await updateStatus({
      id: order._id,
      status: "Shipped",
      trackingNumber: trackingNumber.trim(),
      trackingUrl: trackingUrl.trim() || undefined,
    });

    setShowTrackingDialog(false);
    setTrackingNumber("");
    setTrackingUrl("");

    // Send email notification
    if (process.env.NEXT_PUBLIC_ADMIN_API_KEY && order.customerEmail) {
      fetch("/api/orders/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": process.env.NEXT_PUBLIC_ADMIN_API_KEY,
        },
        body: JSON.stringify({
          orderId: order.orderId,
          customerEmail: order.customerEmail,
          customerName: order.shippingName,
          status: "Shipped",
          trackingNumber: trackingNumber.trim(),
          trackingUrl: trackingUrl.trim() || undefined,
        }),
      }).catch(() => {});
    }
  };

  return (
    <AdminProtectedRoute>
      <div className="bg-gray-50 text-gray-900 px-8 py-8">
        <div className="w-full space-y-8">
        <header>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold uppercase mb-2">
                Order {order.orderId}
              </h1>
              <p className="text-sm text-gray-500">
                User: {order.userId} • Created: {order._creationTime ? new Date(order._creationTime).toLocaleString("en-IN") : "N/A"}
              </p>
            </div>
            <Link
              href="/admin2424/orders"
              className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-bold uppercase tracking-wider hover:border-black hover:text-black transition-colors"
            >
              ← Back to Orders
            </Link>
          </div>
        </header>

        <section className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">
            Packing checklist
          </h2>
          <div className="border bg-white divide-y">
            {items.map((item, idx) => {
              const key = `${item.id ?? idx}-${item.size ?? "default"}-${(item as any).subproduct ?? "default"}-${(item as any).color ?? "default"}`;
              return (
                <label
                  key={key}
                  className="flex items-start justify-between gap-4 p-4 text-sm hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                    />
                    <div>
                      <p className="font-semibold">
                        {item.name ?? "Item"}
                      </p>
                      {item.size && (
                        <p className="text-xs text-gray-500">
                          Size: {item.size}
                        </p>
                      )}
                      {(item as any).subproduct && (
                        <p className="text-xs text-gray-500">
                          Subproduct: {(item as any).subproduct}
                        </p>
                      )}
                      {(item as any).color && (
                        <p className="text-xs text-gray-500">
                          Color: {(item as any).color}
                        </p>
                      )}
                      {(item as any).packQuantity && (item as any).packQuantity > 1 && (
                        <p className="text-xs text-red-600 font-semibold">
                          Pack of {(item as any).packQuantity}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        Qty: {item.quantity ?? 1}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end whitespace-nowrap">
                    {item.basePrice && item.basePrice > (item.price ?? 0) && (
                      <span className="text-xs text-gray-400 line-through">
                        ₹{(item.basePrice * (item.quantity ?? 1)).toFixed(2)}
                      </span>
                    )}
                    <p className="font-semibold">
                      ₹{((item.price ?? 0) * (item.quantity ?? 1)).toFixed(2)}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        </section>

        <section className="space-y-2 text-sm">
          <p className="flex justify-between font-semibold text-base">
            <span>Total</span>
            <span>₹{order.totalAmount}</span>
          </p>
          <p>
            Payment:{" "}
            <span className="font-semibold">
              {order.paymentStatus ?? "Pending"}
            </span>{" "}
            • {order.paymentMethod ?? "N/A"}
          </p>
          <p>
            Status:{" "}
            <span className="font-semibold">{order.status}</span>
          </p>
          <p>
            Tracking:{" "}
            <span className="font-semibold">
              {order.trackingNumber}
            </span>
          </p>
          {order.trackingUrl && (
            <p>
              Tracking URL:{" "}
              <a 
                href={order.trackingUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-semibold text-blue-600 hover:underline break-all"
              >
                {order.trackingUrl}
              </a>
            </p>
          )}
        </section>

        {/* CANCELLATION REQUESTS */}
        {cancellationRequests && cancellationRequests.length > 0 && (
          <section className="bg-white border p-6 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">
              Cancellation Requests
            </h2>
            <div className="space-y-3">
              {cancellationRequests
                .filter((req) => req.type === "cancellation")
                .map((request) => (
                  <div
                    key={request._id}
                    className={`p-4 border rounded ${
                      request.status === "pending"
                        ? "border-yellow-300 bg-yellow-50"
                        : request.status === "approved"
                        ? "border-green-300 bg-green-50"
                        : "border-red-300 bg-red-50"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-semibold text-sm mb-1">
                          Cancellation Request
                        </p>
                        <p className="text-xs text-gray-600 mb-2">
                          {request.reason}
                        </p>
                        <p className="text-xs text-gray-500">
                          Requested:{" "}
                          {new Date(request.createdAt).toLocaleString("en-IN")}
                        </p>
                        {request.status !== "pending" && (
                          <p className="text-xs text-gray-500 mt-1">
                            Status:{" "}
                            <span className="font-semibold capitalize">
                              {request.status}
                            </span>
                            {request.resolvedAt && (
                              <>
                                {" "}
                                • Resolved:{" "}
                                {new Date(request.resolvedAt).toLocaleString(
                                  "en-IN"
                                )}
                              </>
                            )}
                          </p>
                        )}
                        {request.adminNotes && (
                          <p className="text-xs text-gray-600 mt-1 italic">
                            Admin Notes: {request.adminNotes}
                          </p>
                        )}
                      </div>
                      {request.status === "pending" && (
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={async () => {
                              if (
                                confirm(
                                  "Are you sure you want to approve this cancellation request? The order will be marked as Cancelled."
                                )
                              ) {
                                try {
                                  await processOrderRequest({
                                    requestId: request._id,
                                    action: "approve",
                                  });
                                  alert("Cancellation request approved. Order status updated to Cancelled.");
                                } catch (error: any) {
                                  alert(
                                    error.message ||
                                      "Failed to approve cancellation request"
                                  );
                                }
                              }
                            }}
                            className="px-3 py-1.5 bg-green-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-green-700 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={async () => {
                              const notes = prompt(
                                "Enter rejection reason (optional):"
                              );
                              if (notes !== null) {
                                try {
                                  await processOrderRequest({
                                    requestId: request._id,
                                    action: "reject",
                                    adminNotes: notes || undefined,
                                  });
                                  alert("Cancellation request rejected.");
                                } catch (error: any) {
                                  alert(
                                    error.message ||
                                      "Failed to reject cancellation request"
                                  );
                                }
                              }
                            }}
                            className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* ORDER STATUS UPDATES */}
        <section className="bg-white border p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">
            Order Status Updates
          </h2>
          
          <div className="space-y-4">
            {/* Payment Received - Only show for non-COD orders that aren't already paid */}
            {order.paymentMethod?.toLowerCase() !== "cod" && order.paymentStatus !== "Paid" && (
              <label className="flex items-center gap-3 p-4 border border-gray-200 hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={order.paymentStatus === "Paid"}
                  onChange={(e) => {
                    if (e.target.checked) {
                      handleStatusChange("Payment Received", "Paid");
                    }
                  }}
                  className="h-5 w-5 rounded border-gray-300 text-black focus:ring-black"
                />
                <div className="flex-1">
                  <p className="font-semibold text-sm">Payment Received</p>
                  <p className="text-xs text-gray-500">Confirm payment and update order to Confirmed status</p>
                </div>
              </label>
            )}

            {/* Order Processing */}
            {(() => {
              const isProcessingChecked = order.status === "Confirmed" || order.status === "Processing" || order.status === "Shipped" || order.status === "Out for Delivery" || order.status === "Delivered";
              const canCheckProcessing = !order.status || order.status === "Awaiting Admin Confirmation" || order.status === "Confirmed";
              const isProcessingDisabled = order.status === "Cancelled" || isProcessingChecked || (order.paymentMethod?.toLowerCase() !== "cod" && order.paymentStatus !== "Paid");
              
              return (
                <label className={`flex items-center gap-3 p-4 border border-gray-200 ${isProcessingChecked ? "bg-gray-50" : "hover:bg-gray-50"} ${isProcessingDisabled ? "cursor-not-allowed" : "cursor-pointer"}`}>
                  <input
                    type="checkbox"
                    checked={isProcessingChecked}
                    onChange={(e) => {
                      // Only allow checking, not unchecking
                      if (e.target.checked && canCheckProcessing) {
                        const isCOD = order.paymentMethod?.toLowerCase() === "cod";
                        if (isCOD || order.paymentStatus === "Paid") {
                          handleStatusChange("Processing");
                        }
                      }
                    }}
                    disabled={isProcessingDisabled}
                    className="h-5 w-5 rounded border-gray-300 text-black focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">Order Processing</p>
                    <p className="text-xs text-gray-500">
                      {order.paymentMethod?.toLowerCase() === "cod" 
                        ? "Mark order as processing (COD - payment on delivery)" 
                        : "Mark order as processing (requires payment received)"}
                    </p>
                  </div>
                </label>
              );
            })()}

            {/* Order Shipped */}
            {(() => {
              const isShippedChecked = order.status === "Shipped" || order.status === "Out for Delivery" || order.status === "Delivered";
              const canCheckShipped = order.status === "Processing" || order.status === "Confirmed";
              const isShippedDisabled = order.status === "Cancelled" || 
                order.status === "Awaiting Admin Confirmation" || 
                isShippedChecked || 
                !canCheckShipped ||
                (order.paymentMethod?.toLowerCase() !== "cod" && order.paymentStatus !== "Paid");
              
              return (
                <label className={`flex items-center gap-3 p-4 border border-gray-200 ${isShippedChecked ? "bg-gray-50" : "hover:bg-gray-50"} ${isShippedDisabled ? "cursor-not-allowed" : "cursor-pointer"}`}>
                  <input
                    type="checkbox"
                    checked={isShippedChecked}
                    onChange={(e) => {
                      // Only allow checking, not unchecking
                      if (e.target.checked && canCheckShipped) {
                        handleStatusChange("Shipped", undefined, true);
                      }
                    }}
                    disabled={isShippedDisabled}
                    className="h-5 w-5 rounded border-gray-300 text-black focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">Order Shipped</p>
                    <p className="text-xs text-gray-500">Mark order as shipped (requires tracking details)</p>
                  </div>
                </label>
              );
            })()}

            {/* Order Delivered */}
            {(() => {
              const isDeliveredChecked = order.status === "Delivered";
              const canCheckDelivered = order.status === "Shipped" || order.status === "Out for Delivery";
              const isDeliveredDisabled = order.status === "Cancelled" || 
                order.status === "Awaiting Admin Confirmation" || 
                isDeliveredChecked || 
                !canCheckDelivered ||
                !order.trackingNumber;
              
              return (
                <label className={`flex items-center gap-3 p-4 border border-gray-200 ${isDeliveredChecked ? "bg-gray-50" : "hover:bg-gray-50"} ${isDeliveredDisabled ? "cursor-not-allowed" : "cursor-pointer"}`}>
                  <input
                    type="checkbox"
                    checked={isDeliveredChecked}
                    onChange={(e) => {
                      // Only allow checking, not unchecking
                      if (e.target.checked && canCheckDelivered) {
                        const isCOD = order.paymentMethod?.toLowerCase() === "cod";
                        if (isCOD && order.paymentStatus !== "Paid") {
                          handleStatusChange("Delivered", "Paid");
                        } else {
                          handleStatusChange("Delivered");
                        }
                      }
                    }}
                    disabled={isDeliveredDisabled}
                    className="h-5 w-5 rounded border-gray-300 text-black focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">Order Delivered</p>
                    <p className="text-xs text-gray-500">
                      {order.paymentMethod?.toLowerCase() === "cod" 
                        ? "Mark order as delivered (will mark payment as received)" 
                        : "Mark order as delivered"}
                    </p>
                  </div>
                </label>
              );
            })()}
          </div>
        </section>

        {/* Refund Management */}
        {order.orderId && user?.uid && (
          <RefundManagement orderId={order.orderId} adminUserId={user.uid} />
        )}

        {/* Tracking Dialog */}
        {showTrackingDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 w-full max-w-md mx-4 space-y-4 rounded-lg shadow-xl">
              <h3 className="text-lg font-bold">Enter Tracking Details</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold mb-1">Tracking Number *</label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number"
                    className="w-full border border-gray-300 px-3 py-2 text-sm"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Tracking URL (Optional)</label>
                  <input
                    type="url"
                    value={trackingUrl}
                    onChange={(e) => setTrackingUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleShipOrder}
                  disabled={!trackingNumber.trim()}
                  className="flex-1 px-4 py-2 bg-black text-white text-sm font-bold uppercase tracking-wider hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Ship Order
                </button>
                <button
                  onClick={() => {
                    setShowTrackingDialog(false);
                    setTrackingNumber("");
                    setTrackingUrl("");
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-bold uppercase tracking-wider hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </AdminProtectedRoute>
  );
}


