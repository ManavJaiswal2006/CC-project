"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CheckCircle2, Package, Truck, X } from "lucide-react";
import { useState } from "react";
import type { Id } from "@/convex/_generated/dataModel";

interface QuickActionsProps {
  orderId: Id<"orders">;
  orderIdString?: string;
  currentStatus: string;
  currentPaymentStatus?: string;
  customerEmail?: string;
  customerName?: string;
  onUpdate?: () => void;
}

export default function QuickActions({
  orderId,
  orderIdString,
  currentStatus,
  currentPaymentStatus,
  customerEmail,
  customerName,
  onUpdate,
}: QuickActionsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const updateStatus = useMutation(api.order.updateStatus);

  const handleQuickAction = async (
    status: string,
    paymentStatus?: string,
    trackingNumber?: string,
    trackingUrl?: string
  ) => {
    setLoading(status);
    try {
      await updateStatus({
        id: orderId,
        status,
        paymentStatus,
        trackingNumber,
        trackingUrl,
      });

      // Send email notification if status changed
      if (process.env.NEXT_PUBLIC_ADMIN_API_KEY) {
        fetch("/api/orders/confirm", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-key": process.env.NEXT_PUBLIC_ADMIN_API_KEY,
          },
          body: JSON.stringify({
            orderId: orderIdString || "",
            customerEmail,
            customerName,
            status,
            trackingNumber,
            trackingUrl,
          }),
        }).catch(() => {});
      }

      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Quick action error", error);
      alert("Failed to update order. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const isAwaiting = currentStatus.toLowerCase().includes("awaiting") || 
                     currentStatus.toLowerCase().includes("pending");
  const isConfirmed = currentStatus.toLowerCase().includes("confirmed") || 
                     currentStatus.toLowerCase().includes("processing");
  const isShipped = currentStatus.toLowerCase().includes("shipped");
  const isPaid = currentPaymentStatus?.toLowerCase() === "paid";

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">
        Quick Actions
      </h3>
      
      <div className="flex flex-wrap gap-2">
        {/* Confirm Order */}
        {isAwaiting && (
          <button
            onClick={() => handleQuickAction("Confirmed", currentPaymentStatus)}
            disabled={loading !== null}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <CheckCircle2 size={14} />
            {loading === "Confirmed" ? "Confirming..." : "Confirm Order"}
          </button>
        )}

        {/* Mark as Paid */}
        {!isPaid && (
          <button
            onClick={() => handleQuickAction(currentStatus, "Paid")}
            disabled={loading !== null}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <CheckCircle2 size={14} />
            {loading === "Paid" ? "Updating..." : "Mark as Paid"}
          </button>
        )}

        {/* Ship Order */}
        {isConfirmed && !isShipped && (
          <button
            onClick={() => {
              const tracking = prompt("Enter tracking number:");
              if (tracking) {
                const trackingUrl = prompt("Enter tracking URL (third-party tracking link):");
                handleQuickAction("Shipped", currentPaymentStatus, tracking.trim(), trackingUrl?.trim() || undefined);
              }
            }}
            disabled={loading !== null}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            <Truck size={14} />
            {loading === "Shipped" ? "Shipping..." : "Ship Order"}
          </button>
        )}

        {/* Mark as Delivered */}
        {isShipped && (
          <button
            onClick={() => handleQuickAction("Delivered", currentPaymentStatus)}
            disabled={loading !== null}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white text-xs font-bold uppercase tracking-wider hover:bg-gray-900 transition-colors disabled:opacity-50"
          >
            <Package size={14} />
            {loading === "Delivered" ? "Updating..." : "Mark Delivered"}
          </button>
        )}
      </div>

      <p className="text-xs text-gray-500">
        Quick actions automatically send email notifications to customers.
      </p>
    </div>
  );
}

