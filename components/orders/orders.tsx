"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Package, Calendar, IndianRupee, Search, Filter } from "lucide-react";
import { useState, useMemo } from "react";

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  /* ================= CONVEX ================= */
  const orders = useQuery(
    api.order.getOrders,
    user?.uid ? { userId: user.uid } : "skip"
  );

  /* ================= FILTERS ================= */
  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    
    let filtered = orders;
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.shippingName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }
    
    return filtered;
  }, [orders, searchTerm, statusFilter]);

  // Get unique statuses for filter
  const uniqueStatuses = useMemo(() => {
    if (!orders) return [];
    const statuses = new Set(orders.map((o) => o.status));
    return Array.from(statuses);
  }, [orders]);

  /* ================= HELPERS ================= */
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes("confirmed") || statusLower.includes("paid")) {
      return "bg-green-100 text-green-800";
    }
    if (statusLower.includes("shipped") || statusLower.includes("delivered")) {
      return "bg-blue-100 text-blue-800";
    }
    if (statusLower.includes("pending") || statusLower.includes("awaiting")) {
      return "bg-yellow-100 text-yellow-800";
    }
    if (statusLower.includes("cancelled")) {
      return "bg-red-100 text-red-800";
    }
    return "bg-gray-100 text-gray-800";
  };

  /* ================= LOADING ================= */
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-gray-900">
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-gray-900">
        <div className="text-center space-y-4">
          <p className="text-sm text-gray-500">Please log in to view your orders.</p>
          <button
            onClick={() => router.push("/login")}
            className="px-6 py-3 bg-black text-white text-[11px] font-black tracking-[0.2em] uppercase hover:bg-red-600 transition-all"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  if (orders === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-gray-900">
        <p className="text-sm text-gray-500">Loading orders...</p>
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 text-gray-900 pt-20 sm:pt-24 pb-12 sm:pb-16 md:pb-20">
      <div className="w-full px-4 sm:px-6 space-y-6 sm:space-y-8">
        {/* HEADER */}
        <header className="border-b pb-6">
          <div className="flex items-center gap-3 mb-4">
            <Package size={24} />
            <h1 className="text-3xl font-bold uppercase">My Orders</h1>
          </div>
          <p className="text-sm text-gray-500">
            View and track all your orders
          </p>
        </header>

        {/* FILTERS */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* SEARCH */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by order ID or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent shadow-sm hover:shadow-md transition-all"
            />
          </div>

          {/* STATUS FILTER */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent appearance-none bg-white shadow-sm hover:shadow-md transition-all cursor-pointer min-w-[180px]"
            >
              <option value="all">All Status</option>
              {uniqueStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ORDERS LIST */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-20 border border-gray-200">
            <Package size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 mb-2">
              {orders.length === 0
                ? "You haven't placed any orders yet."
                : "No orders match your filters."}
            </p>
            {orders.length === 0 && (
              <button
                onClick={() => router.push("/shop")}
                className="mt-4 px-6 py-3 bg-black text-white text-[11px] font-black tracking-[0.2em] uppercase hover:bg-red-600 transition-all"
              >
                Start Shopping
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order._id}
                className="border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* ORDER INFO */}
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <h3 className="text-lg font-bold font-mono">
                          {order.orderId}
                        </h3>
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} />
                          <span>
                            {order._creationTime
                              ? formatDate(order._creationTime)
                              : "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <IndianRupee size={16} />
                          <span className="font-semibold text-gray-900">
                            ₹{order.totalAmount.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-500">Payment: </span>
                          <span className="font-semibold">
                            {order.paymentStatus || "Pending"}
                          </span>
                        </div>
                      </div>

                      {order.trackingNumber &&
                        order.trackingNumber !== "Awaiting payment" && (
                          <div className="mt-3 text-sm">
                            <span className="text-gray-500">Tracking: </span>
                            <span className="font-mono font-semibold">
                              {order.trackingNumber}
                            </span>
                          </div>
                        )}
                    </div>

                    {/* ACTIONS */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => router.push(`/orders/${order.orderId}`)}
                        className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 border border-black text-black text-[11px] font-black uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all whitespace-nowrap"
                      >
                        View Details
                      </button>
                    </div>
                  </div>

                  {/* ITEMS PREVIEW */}
                  {order.items && Array.isArray(order.items) && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">
                        Items ({order.items.length})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {order.items.slice(0, 3).map((item: any, idx: number) => (
                          <span
                            key={idx}
                            className="text-sm text-gray-600 bg-gray-50 px-3 py-1"
                          >
                            {item.name || "Item"} {item.quantity ? `×${item.quantity}` : ""}
                          </span>
                        ))}
                        {order.items.length > 3 && (
                          <span className="text-sm text-gray-500">
                            +{order.items.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* STATS */}
        {orders.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-8 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold">{orders.length}</p>
              <p className="text-xs text-gray-500 uppercase tracking-widest">
                Total Orders
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {orders.filter((o) =>
                  o.status.toLowerCase().includes("delivered")
                ).length}
              </p>
              <p className="text-xs text-gray-500 uppercase tracking-widest">
                Delivered
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {orders.filter((o) =>
                  o.status.toLowerCase().includes("pending") ||
                  o.status.toLowerCase().includes("awaiting")
                ).length}
              </p>
              <p className="text-xs text-gray-500 uppercase tracking-widest">
                Pending
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                ₹
                {orders
                  .reduce((sum, o) => sum + o.totalAmount, 0)
                  .toFixed(0)}
              </p>
              <p className="text-xs text-gray-500 uppercase tracking-widest">
                Total Spent
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

