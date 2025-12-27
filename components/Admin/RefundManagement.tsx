"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { CheckCircle2, XCircle, Clock, AlertCircle, Image as ImageIcon } from "lucide-react";

interface RefundManagementProps {
  orderId: string;
  adminUserId: string;
}

export default function RefundManagement({ orderId, adminUserId }: RefundManagementProps) {
  const [reviewingId, setReviewingId] = useState<Id<"refundRequests"> | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [refundAmount, setRefundAmount] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);

  // Get refund requests for this order
  const refundRequests = useQuery(
    api.refund.getAllRefundRequests,
    {} // Get all, then filter client-side
  );

  const filteredRequests = refundRequests?.filter((r) => r.orderId === orderId) || [];

  const reviewRefundRequest = useMutation(api.refund.reviewRefundRequest);
  const markRefundProcessed = useMutation(api.refund.markRefundProcessed);

  const handleReview = async (requestId: Id<"refundRequests">, action: "approve" | "reject") => {
    if (!confirm(`Are you sure you want to ${action} this refund request?`)) {
      return;
    }

    setProcessing(true);
    try {
      await fetch("/api/refunds/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": process.env.NEXT_PUBLIC_ADMIN_API_KEY || "",
        },
        body: JSON.stringify({
          refundRequestId: requestId,
          action,
          adminNotes: adminNotes.trim() || undefined,
          refundAmount: refundAmount || undefined,
          reviewedBy: adminUserId,
        }),
      });

      setReviewingId(null);
      setAdminNotes("");
      setRefundAmount(null);
    } catch (error) {
      console.error("Review error", error);
      alert("Failed to review refund request");
    } finally {
      setProcessing(false);
    }
  };

  const handleProcessRefund = async (requestId: Id<"refundRequests">) => {
    if (!confirm("This will process the refund via Razorpay. Continue?")) {
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch("/api/refunds/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": process.env.NEXT_PUBLIC_ADMIN_API_KEY || "",
        },
        body: JSON.stringify({
          refundRequestId: requestId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to process refund");
      }

      alert("Refund processed successfully!");
    } catch (error: any) {
      console.error("Process refund error", error);
      alert(error.message || "Failed to process refund");
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold">
            <Clock size={12} />
            Pending
          </span>
        );
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
            <CheckCircle2 size={12} />
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold">
            <XCircle size={12} />
            Rejected
          </span>
        );
      case "refunded":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
            <CheckCircle2 size={12} />
            Refunded
          </span>
        );
      default:
        return <span className="text-xs text-gray-500">{status}</span>;
    }
  };

  if (filteredRequests.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">
        Refund Requests
      </h2>
      
      <div className="space-y-4">
        {filteredRequests.map((request) => (
          <div key={request._id} className="border bg-white p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  {getStatusBadge(request.status)}
                  <span className="text-sm text-gray-500">
                    Requested: {new Date(request.createdAt).toLocaleString("en-IN")}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1">Reason:</p>
                  <p className="text-sm text-gray-700">{request.reason}</p>
                </div>
                {request.refundAmount && (
                  <p className="text-sm">
                    <span className="font-semibold">Refund Amount:</span> ₹{request.refundAmount.toFixed(2)}
                  </p>
                )}
                {request.adminNotes && (
                  <div>
                    <p className="font-semibold text-sm mb-1">Admin Notes:</p>
                    <p className="text-sm text-gray-700">{request.adminNotes}</p>
                  </div>
                )}
                {request.refundId && (
                  <p className="text-sm">
                    <span className="font-semibold">Razorpay Refund ID:</span> {request.refundId}
                  </p>
                )}
              </div>
              
              {/* Photo */}
              {request.photoStorageId && (
                <div className="ml-4">
                  <p className="text-xs font-semibold mb-2">Photo:</p>
                  <a
                    href={`${process.env.NEXT_PUBLIC_CONVEX_URL}/api/storage/${request.photoStorageId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <ImageIcon size={16} />
                    View Photo
                  </a>
                </div>
              )}
            </div>

            {/* Actions */}
            {request.status === "pending" && (
              <div className="pt-4 border-t space-y-3">
                {reviewingId === request._id ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-semibold mb-1">
                        Admin Notes (Optional)
                      </label>
                      <textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Add notes about your decision..."
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">
                        Refund Amount (Optional, defaults to full refund)
                      </label>
                      <input
                        type="number"
                        value={refundAmount || ""}
                        onChange={(e) => setRefundAmount(e.target.value ? parseFloat(e.target.value) : null)}
                        placeholder="Enter refund amount"
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                        min={0}
                        step={0.01}
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleReview(request._id, "approve")}
                        disabled={processing}
                        className="flex-1 px-4 py-2 bg-green-600 text-white text-sm font-bold uppercase tracking-wider hover:bg-green-700 transition-all disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReview(request._id, "reject")}
                        disabled={processing}
                        className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-bold uppercase tracking-wider hover:bg-red-700 transition-all disabled:opacity-50"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => {
                          setReviewingId(null);
                          setAdminNotes("");
                          setRefundAmount(null);
                        }}
                        className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-bold uppercase tracking-wider hover:bg-gray-50 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setReviewingId(request._id)}
                    className="px-4 py-2 bg-black text-white text-sm font-bold uppercase tracking-wider hover:bg-red-600 transition-all"
                  >
                    Review Request
                  </button>
                )}
              </div>
            )}

            {request.status === "approved" && (
              <div className="pt-4 border-t">
                <button
                  onClick={() => handleProcessRefund(request._id)}
                  disabled={processing}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-bold uppercase tracking-wider hover:bg-green-700 transition-all disabled:opacity-50"
                >
                  {processing ? "Processing..." : "Process Refund via Razorpay"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

