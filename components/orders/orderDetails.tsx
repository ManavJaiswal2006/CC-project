"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Download, CheckCircle2, Circle, Package, Truck, Home } from "lucide-react";
import { useState } from "react";
import CancelOrderButton from "@/components/orders/CancelOrderButton";

interface OrderDetailsProps {
  orderId: string;
}

export default function OrderDetailsPage({ orderId }: OrderDetailsProps) {
  const router = useRouter();
  const [downloading, setDownloading] = useState(false);

  /* ================= CONVEX ================= */
  const order = useQuery(
    api.order.getByOrderId,
    orderId ? { orderId } : "skip"
  );

  const statusHistory = useQuery(
    api.order.getStatusHistory,
    orderId ? { orderId } : "skip"
  );

  /* ================= HELPERS ================= */
  // Define status steps
  const statusSteps = [
    { key: "placed", label: "Order Placed", icon: CheckCircle2 },
    { key: "confirmed", label: "Confirmed", icon: CheckCircle2 },
    { key: "processing", label: "Processing", icon: Package },
    { key: "shipped", label: "Shipped", icon: Truck },
    { key: "delivered", label: "Delivered", icon: Home },
  ];

  const getCurrentStep = () => {
    if (!order) return 0;
    const statusLower = order.status.toLowerCase();
    if (statusLower.includes("delivered")) return 4;
    if (statusLower.includes("shipped") || statusLower.includes("out for delivery")) return 3;
    if (statusLower.includes("processing")) return 2;
    if (statusLower.includes("confirmed") || statusLower.includes("paid")) return 1;
    return 0;
  };

  const currentStep = getCurrentStep();

  const handleDownloadInvoice = async () => {
    setDownloading(true);
    try {
      const response = await fetch(`/api/orders/pdf?orderId=${orderId}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `invoice-${orderId}.html`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Download error", error);
    } finally {
      setDownloading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* ================= LOADING ================= */
  if (order === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-gray-900">
        <p className="text-sm text-gray-500">Loading order…</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-gray-900">
        <p className="text-sm text-gray-500">
          We couldn&apos;t find an order with id {orderId}.
        </p>
      </div>
    );
  }

  type OrderItem = {
    id?: string;
    name?: string;
    size?: string | null;
    quantity?: number;
    price?: number;
  };

  const items = (order.items ?? []) as OrderItem[];

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-white text-gray-900 pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-6 space-y-8">
        {/* HEADER */}
        <header className="border-b pb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                Order
              </p>
              <h1 className="text-2xl font-bold uppercase font-mono">
                {order.orderId}
              </h1>
            </div>
            <button
              onClick={handleDownloadInvoice}
              disabled={downloading}
              className="flex items-center gap-2 px-4 py-2 border border-black text-black text-[11px] font-black uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all disabled:opacity-50"
            >
              <Download size={14} />
              {downloading ? "Downloading..." : "Download Invoice"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">
                Status: <span className="font-semibold text-gray-900">{order.status}</span>
              </p>
              <p className="text-gray-500 mt-1">
                Payment:{" "}
                <span className="font-semibold text-gray-900">
                  {order.paymentStatus ?? "Pending"}
                </span>{" "}
                • {order.paymentMethod ?? "N/A"}
              </p>
            </div>
            <div>
              {order.trackingNumber && order.trackingNumber !== "Awaiting payment" && (
                <p className="text-gray-500">
                  Tracking:{" "}
                  <span className="font-mono font-semibold text-gray-900">
                    {order.trackingNumber}
                  </span>
                </p>
              )}
              {order._creationTime && (
                <p className="text-gray-500 mt-1">
                  Ordered: {formatDate(order._creationTime)}
                </p>
              )}
            </div>
          </div>
        </header>

        {/* STATUS TIMELINE */}
        <section className="border p-6 bg-gray-50">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-6">
            Order Status
          </h2>
          <div className="relative">
            {/* TIMELINE LINE */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300" />
            
            <div className="space-y-6">
              {statusSteps.map((step, index) => {
                const StepIcon = step.icon;
                const isCompleted = index <= currentStep;
                const isCurrent = index === currentStep;
                
                return (
                  <div key={step.key} className="relative flex items-start gap-4">
                    <div
                      className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                        isCompleted
                          ? "bg-black border-black text-white"
                          : "bg-white border-gray-300 text-gray-400"
                      }`}
                    >
                      <StepIcon size={16} />
                    </div>
                    <div className="flex-1 pt-1">
                      <p
                        className={`font-semibold ${
                          isCompleted ? "text-gray-900" : "text-gray-400"
                        }`}
                      >
                        {step.label}
                      </p>
                      {isCurrent && (
                        <p className="text-xs text-gray-500 mt-1">
                          Current status
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STATUS HISTORY */}
          {statusHistory && statusHistory.length > 0 && (
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">
                Status History
              </h3>
              <div className="space-y-3">
                {statusHistory.map((entry, idx) => (
                  <div key={idx} className="text-sm">
                    <p className="font-semibold text-gray-900">{entry.status}</p>
                    {entry.message && (
                      <p className="text-xs text-gray-500 mt-1">{entry.message}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(entry.timestamp)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ITEMS */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">
            Items
          </h2>
          <div className="border divide-y">
            {items.map((item, idx) => (
              <div
                key={`${item.id ?? idx}-${item.size ?? "default"}`}
                className="flex justify-between p-4 text-sm"
              >
                <div>
                  <p className="font-semibold">
                    {item.name ?? "Item"}
                  </p>
                  {item.size && (
                    <p className="text-xs text-gray-500">
                      Size: {item.size}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    Qty: {item.quantity ?? 1}
                  </p>
                </div>
                <p className="font-semibold">
                  ₹
                  {(item.price ?? 0) * (item.quantity ?? 1)}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* SHIPPING ADDRESS */}
        {order.shippingAddress && (
          <section className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">
              Shipping Address
            </h2>
            <div className="border p-4 text-sm">
              <p className="font-semibold mb-2">{order.shippingName}</p>
              <p className="text-gray-600 whitespace-pre-line">
                {order.shippingAddress}
              </p>
            </div>
          </section>
        )}

        {/* TOTAL */}
        <section className="space-y-2 text-sm border-t pt-6">
          <div className="flex justify-between">
            <span className="text-gray-500">Subtotal</span>
            <span>₹{order.totalAmount.toFixed(2)}</span>
          </div>
          {order.promoDiscount && order.promoDiscount > 0 && (
            <div className="flex justify-between text-red-600">
              <span>Promo Discount {order.promoCode ? `(${order.promoCode})` : ""}</span>
              <span>-₹{order.promoDiscount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold text-base pt-2 border-t">
            <span>Total paid</span>
            <span>₹{order.totalAmount.toFixed(2)}</span>
          </div>
        </section>

        {/* ACTIONS */}
        <div className="flex gap-4 pt-6">
          <button
            onClick={() => router.push("/orders")}
            className="px-6 py-3 border border-gray-300 text-gray-700 text-[11px] font-black uppercase tracking-[0.2em] hover:border-black hover:text-black transition-all"
          >
            Back to Orders
          </button>
          {order && (
            <CancelOrderButton
              orderId={order.orderId}
              currentStatus={order.status}
            />
          )}
        </div>
      </div>
    </div>
  );
}

