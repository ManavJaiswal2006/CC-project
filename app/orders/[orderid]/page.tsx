"use client";

import { useParams } from "next/navigation";
import OrderDetailsPage from '@/components/orders/orderDetails';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function Page() {
  const params = useParams();
  const orderId = typeof params?.orderid === "string" ? params.orderid : "";

  if (!orderId) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-white text-gray-900">
          <p className="text-sm text-gray-500">No order id provided.</p>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <OrderDetailsPage orderId={orderId} />
    </ProtectedRoute>
  );
}
