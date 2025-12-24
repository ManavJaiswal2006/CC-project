"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import type { Id } from "@/convex/_generated/dataModel";
import QuickActions from "@/components/Admin/QuickActions";
import Link from "next/link";
import AdminProtectedRoute from "@/components/auth/AdminProtectedRoute";

export default function AdminOrderDetailsPage() {
  const params = useParams();
  const idParam = params?.id;
  const [status, setStatus] = useState("");
  const [tracking, setTracking] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");

  const order = useQuery(
    api.order.getById,
    typeof idParam === "string"
      ? { id: idParam as Id<"orders"> }
      : "skip"
  );
  const updateStatus = useMutation(api.order.updateStatus);

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
  };

  const items = (order.items ?? []) as OrderItem[];

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateStatus({
      id: order._id,
      status: status || order.status,
      trackingNumber: tracking || order.trackingNumber,
      paymentStatus: paymentStatus || order.paymentStatus,
    });

    // Optionally notify customer when marked paid/confirmed
    if (
      process.env.NEXT_PUBLIC_ADMIN_API_KEY &&
      (status.toLowerCase() === "confirmed" ||
        paymentStatus.toLowerCase() === "paid")
    ) {
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
          status: status || order.status,
        }),
      }).catch(() => {});
    }
  };

  return (
    <AdminProtectedRoute>
      <div className="bg-gray-50 text-gray-900 px-8 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
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
              const key = `${item.id ?? idx}-${item.size ?? "default"}`;
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
                      <p className="text-xs text-gray-500">
                        Qty: {item.quantity ?? 1}
                        {item.size ? ` • Size: ${item.size}` : ""}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold whitespace-nowrap">
                    ₹
                    {(item.price ?? 0) * (item.quantity ?? 1)}
                  </p>
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
        </section>

        {/* QUICK ACTIONS */}
        <section className="bg-white border p-6">
          <QuickActions
            orderId={order._id}
            orderIdString={order.orderId}
            currentStatus={order.status}
            currentPaymentStatus={order.paymentStatus}
            customerEmail={order.customerEmail}
            customerName={order.shippingName}
            onUpdate={() => {
              setStatus("");
              setTracking("");
              setPaymentStatus("");
            }}
          />
        </section>

        {/* MANUAL UPDATE FORM */}
        <section className="bg-white border p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">
            Manual Update
          </h2>
          <form onSubmit={handleUpdate} className="space-y-3">
            <input
              placeholder={`Current: ${order.status}`}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 text-sm"
            />
            <input
              placeholder={`Payment status: ${order.paymentStatus ?? "Pending"}`}
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 text-sm"
            />
            <input
              placeholder={`Tracking: ${order.trackingNumber ?? ""}`}
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-black text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-red-600 transition-all"
            >
              Save
            </button>
          </form>
        </section>
        </div>
      </div>
    </AdminProtectedRoute>
  );
}


