"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { Package, DollarSign, Users, TrendingUp, AlertCircle } from "lucide-react";
import { useMemo } from "react";

export default function AdminDashboard() {
  /* ================= CONVEX ================= */
  const orders = useQuery(api.order.getAllOrders);
  const products = useQuery(api.product.getAllProducts);

  /* ================= ANALYTICS ================= */
  const analytics = useMemo(() => {
    if (!orders || !products) return null;

    const totalRevenue = orders
      .filter((o) => o.paymentStatus === "Paid")
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const pendingOrders = orders.filter(
      (o) =>
        o.status.toLowerCase().includes("pending") ||
        o.status.toLowerCase().includes("awaiting")
    ).length;

    const totalOrders = orders.length;
    const paidOrders = orders.filter((o) => o.paymentStatus === "Paid").length;

    const lowStockProducts = products.filter(
      (p) => (p.stock ?? 0) > 0 && (p.stock ?? 0) < 10
    ).length;

    const outOfStockProducts = products.filter((p) => p.soldOut).length;

    // Recent orders (last 7 days)
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentOrders = orders.filter(
      (o) => o._creationTime && o._creationTime >= sevenDaysAgo
    ).length;

    // Revenue this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const monthlyRevenue = orders
      .filter(
        (o) =>
          o.paymentStatus === "Paid" &&
          o._creationTime &&
          o._creationTime >= startOfMonth
      )
      .reduce((sum, o) => sum + o.totalAmount, 0);

    // Top products (by order frequency)
    const productCounts: Record<string, number> = {};
    orders.forEach((order) => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          if (item.name) {
            productCounts[item.name] = (productCounts[item.name] || 0) + (item.quantity || 1);
          }
        });
      }
    });
    const topProducts = Object.entries(productCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    return {
      totalRevenue,
      monthlyRevenue,
      totalOrders,
      paidOrders,
      pendingOrders,
      recentOrders,
      lowStockProducts,
      outOfStockProducts,
      topProducts,
    };
  }, [orders, products]);

  /* ================= LOADING ================= */
  if (orders === undefined || products === undefined) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50 text-gray-900 px-8 py-8">
        <p>Loading dashboard…</p>
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
              <h1 className="text-3xl font-bold uppercase mb-2">Dashboard</h1>
              <p className="text-sm text-gray-500">
                Overview of your store performance
              </p>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <Link
                href="/admin2424"
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-3 text-xs font-black uppercase tracking-[0.2em] border border-black hover:bg-black hover:text-white transition-colors whitespace-nowrap"
              >
                Products
              </Link>
              <Link
                href="/admin2424/orders"
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-3 text-xs font-black uppercase tracking-[0.2em] border border-black hover:bg-black hover:text-white transition-colors whitespace-nowrap"
              >
                Orders
              </Link>
              <Link
                href="/admin2424/promos"
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-3 text-xs font-black uppercase tracking-[0.2em] border border-black hover:bg-black hover:text-white transition-colors whitespace-nowrap"
              >
                Promos
              </Link>
            </div>
          </div>
        </header>

        {analytics && (
          <>
            {/* STATS CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white border p-6">
                <div className="flex items-center justify-between mb-4">
                  <DollarSign className="text-gray-400" size={24} />
                  <span className="text-xs text-gray-500 uppercase tracking-widest">
                    Total Revenue
                  </span>
                </div>
                <p className="text-3xl font-bold">₹{analytics.totalRevenue.toFixed(0)}</p>
                <p className="text-xs text-gray-500 mt-2">
                  This month: ₹{analytics.monthlyRevenue.toFixed(0)}
                </p>
              </div>

              <div className="bg-white border p-6">
                <div className="flex items-center justify-between mb-4">
                  <Package className="text-gray-400" size={24} />
                  <span className="text-xs text-gray-500 uppercase tracking-widest">
                    Total Orders
                  </span>
                </div>
                <p className="text-3xl font-bold">{analytics.totalOrders}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {analytics.paidOrders} paid • {analytics.pendingOrders} pending
                </p>
              </div>

              <div className="bg-white border p-6">
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="text-gray-400" size={24} />
                  <span className="text-xs text-gray-500 uppercase tracking-widest">
                    Recent Orders
                  </span>
                </div>
                <p className="text-3xl font-bold">{analytics.recentOrders}</p>
                <p className="text-xs text-gray-500 mt-2">Last 7 days</p>
              </div>

              <div className="bg-white border p-6">
                <div className="flex items-center justify-between mb-4">
                  <AlertCircle className="text-gray-400" size={24} />
                  <span className="text-xs text-gray-500 uppercase tracking-widest">
                    Stock Alerts
                  </span>
                </div>
                <p className="text-3xl font-bold">{analytics.lowStockProducts}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Low stock • {analytics.outOfStockProducts} out of stock
                </p>
              </div>
            </div>

            {/* TOP PRODUCTS */}
            <div className="bg-white border p-6">
              <h2 className="text-lg font-bold uppercase mb-4">Top Products</h2>
              {analytics.topProducts.length > 0 ? (
                <div className="space-y-3">
                  {analytics.topProducts.map((product, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-400 w-6">
                          #{idx + 1}
                        </span>
                        <span className="font-semibold">{product.name}</span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {product.count} sold
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No sales data yet</p>
              )}
            </div>

            {/* QUICK ACTIONS */}
            <div className="bg-white border p-6">
              <h2 className="text-lg font-bold uppercase mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  href="/admin2424"
                  className="p-4 border border-gray-300 hover:border-black transition-colors text-center"
                >
                  <p className="font-semibold mb-1">Manage Products</p>
                  <p className="text-xs text-gray-500">Add or edit products</p>
                </Link>
                <Link
                  href="/admin2424/orders"
                  className="p-4 border border-gray-300 hover:border-black transition-colors text-center"
                >
                  <p className="font-semibold mb-1">View Orders</p>
                  <p className="text-xs text-gray-500">
                    {analytics.pendingOrders} orders need attention
                  </p>
                </Link>
                <Link
                  href="/admin2424/promos"
                  className="p-4 border border-gray-300 hover:border-black transition-colors text-center"
                >
                  <p className="font-semibold mb-1">Manage Promos</p>
                  <p className="text-xs text-gray-500">Create discount codes</p>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

