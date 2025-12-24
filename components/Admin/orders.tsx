"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { useState, useMemo } from "react";
import { Search, Filter, Download, AlertCircle, CheckCircle2 } from "lucide-react";

export default function AdminOrdersPage() {
  /* ================= CONVEX ================= */
  const orders = useQuery(api.order.getAllOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");

  /* ================= FILTERS ================= */
  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    
    let filtered = orders;
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.shippingName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.userId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }
    
    // Payment filter
    if (paymentFilter !== "all") {
      filtered = filtered.filter((order) => order.paymentStatus === paymentFilter);
    }
    
    return filtered;
  }, [orders, searchTerm, statusFilter, paymentFilter]);

  // Get unique values for filters
  const uniqueStatuses = useMemo(() => {
    if (!orders) return [];
    return Array.from(new Set(orders.map((o) => o.status)));
  }, [orders]);

  const uniquePaymentStatuses = useMemo(() => {
    if (!orders) return [];
    return Array.from(new Set(orders.map((o) => o.paymentStatus || "Pending")));
  }, [orders]);

  // Pending orders count
  const pendingOrdersCount = useMemo(() => {
    if (!orders) return 0;
    return orders.filter(
      (o) =>
        o.status.toLowerCase().includes("awaiting") ||
        o.status.toLowerCase().includes("pending")
    ).length;
  }, [orders]);

  /* ================= HELPERS ================= */
  const exportToCSV = () => {
    if (!filteredOrders || filteredOrders.length === 0) return;
    
    const headers = ["Order ID", "User ID", "Customer Name", "Email", "Total", "Status", "Payment Status", "Payment Method", "Date"];
    const rows = filteredOrders.map((order) => [
      order.orderId,
      order.userId,
      order.shippingName || "",
      order.customerEmail || "",
      order.totalAmount,
      order.status,
      order.paymentStatus || "Pending",
      order.paymentMethod || "N/A",
      order._creationTime ? new Date(order._creationTime).toLocaleDateString() : "",
    ]);
    
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  /* ================= LOADING ================= */
  if (orders === undefined) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50 text-gray-900 px-8 py-8">
        <p>Loading orders…</p>
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="bg-gray-50 text-gray-900 px-4 sm:px-6 md:px-8 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* HEADER */}
        <header>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold uppercase mb-2">
                Orders
              </h1>
              <p className="text-sm text-gray-500">
                Admin overview of all customer orders. Total: {orders.length} orders
                {pendingOrdersCount > 0 && (
                  <span className="ml-2 text-red-600 font-semibold">
                    • {pendingOrdersCount} awaiting confirmation
                  </span>
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <Link
                href="/admin2424/dashboard"
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-3 text-xs font-black uppercase tracking-[0.2em] border border-black hover:bg-black hover:text-white transition-colors whitespace-nowrap"
              >
                Dashboard
              </Link>
              <Link
                href="/admin2424"
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-3 text-xs font-black uppercase tracking-[0.2em] border border-black hover:bg-black hover:text-white transition-colors whitespace-nowrap"
              >
                Products
              </Link>
            </div>
          </div>
        </header>

        {/* FILTERS */}
        <div className="bg-white border p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* SEARCH */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black text-sm"
              />
            </div>

            {/* STATUS FILTER */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-8 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black appearance-none bg-white text-sm"
              >
                <option value="all">All Status</option>
                {uniqueStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {/* PAYMENT FILTER */}
            <div className="relative">
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black appearance-none bg-white text-sm"
              >
                <option value="all">All Payment Status</option>
                {uniquePaymentStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {/* EXPORT */}
            <button
              onClick={exportToCSV}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-black text-black text-xs font-black uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-colors"
            >
              <Download size={14} />
              Export CSV
            </button>
          </div>

          {/* RESULTS COUNT */}
          <div className="text-sm text-gray-500">
            Showing {filteredOrders.length} of {orders.length} orders
          </div>
        </div>

        {/* ORDERS TABLE */}
        <div className="bg-white border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-left text-xs uppercase tracking-widest text-gray-500">
              <tr>
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    No orders found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o._id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">
                      {o.orderId}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <div>
                        <div className="font-semibold">{o.shippingName || "N/A"}</div>
                        <div className="text-gray-500 text-[10px]">{o.userId}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {o.customerEmail || "N/A"}
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      ₹{o.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className={`px-2 py-1 rounded ${
                        o.status.toLowerCase().includes("delivered") ? "bg-green-100 text-green-800" :
                        o.status.toLowerCase().includes("shipped") ? "bg-blue-100 text-blue-800" :
                        o.status.toLowerCase().includes("pending") || o.status.toLowerCase().includes("awaiting") ? "bg-yellow-100 text-yellow-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className={`px-2 py-1 rounded ${
                        o.paymentStatus === "Paid" ? "bg-green-100 text-green-800" :
                        "bg-yellow-100 text-yellow-800"
                      }`}>
                        {o.paymentStatus || "Pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {o._creationTime
                        ? new Date(o._creationTime).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "N/A"}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin2424/orderdetails/${o._id}`}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors ${
                          o.status.toLowerCase().includes("awaiting") || o.status.toLowerCase().includes("pending")
                            ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                            : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                        }`}
                      >
                        {o.status.toLowerCase().includes("awaiting") || o.status.toLowerCase().includes("pending") ? (
                          <>
                            <AlertCircle size={12} />
                            Review
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={12} />
                            View
                          </>
                        )}
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

