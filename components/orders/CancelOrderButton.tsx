"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/app/context/AuthContext";
import { X, AlertCircle } from "lucide-react";

interface CancelOrderButtonProps {
  orderId: string;
  currentStatus: string;
}

export default function CancelOrderButton({
  orderId,
  currentStatus,
}: CancelOrderButtonProps) {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const createOrderRequest = useMutation(api.order.createOrderRequest);
  const orderRequests = useQuery(
    api.order.getOrderRequests,
    user?.uid ? { userId: user.uid } : "skip"
  );

  // Check if cancellation already requested
  const existingRequest = orderRequests?.find(
    (req) => req.orderId === orderId && req.type === "cancellation"
  );

  // Check if order can be cancelled
  const canCancel =
    currentStatus.toLowerCase().includes("pending") ||
    currentStatus.toLowerCase().includes("awaiting") ||
    currentStatus.toLowerCase().includes("confirmed");

  if (!canCancel || existingRequest) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid || !reason.trim() || submitting) return;

    setSubmitting(true);
    try {
      await createOrderRequest({
        orderId,
        userId: user.uid,
        type: "cancellation",
        reason: reason.trim(),
      });
      setShowModal(false);
      setReason("");
      alert("Cancellation request submitted. We'll process it shortly.");
    } catch (error: any) {
      alert(error.message || "Failed to submit cancellation request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-6 py-3 border border-red-300 text-red-600 text-[11px] font-black uppercase tracking-[0.2em] hover:border-red-600 hover:bg-red-50 transition-all"
      >
        Cancel Order
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Cancel Order</h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setReason("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
              <div className="text-sm text-yellow-800">
                <p className="font-semibold mb-1">Please Note</p>
                <p>
                  Cancellation requests are subject to approval. If your order has
                  already been shipped, it cannot be cancelled.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Reason for Cancellation
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  className="w-full border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Please tell us why you want to cancel this order..."
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting || !reason.trim()}
                  className="flex-1 px-6 py-3 bg-red-600 text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Submitting..." : "Submit Request"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setReason("");
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 text-[11px] font-black uppercase tracking-[0.2em] hover:border-black transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

