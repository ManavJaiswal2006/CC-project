"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { X, Upload, AlertCircle } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";

interface RefundRequestButtonProps {
  orderId: string;
  orderStatus: string;
  deliveredAt?: number;
}

export default function RefundRequestButton({
  orderId,
  orderStatus,
  deliveredAt,
}: RefundRequestButtonProps) {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [reason, setReason] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const generateUploadUrl = useMutation(api.refund.generateRefundPhotoUploadUrl);

  // Get existing refund request
  const existingRequest = useQuery(
    api.refund.getRefundRequestByOrderId,
    user?.uid && orderId
      ? { orderId, userId: user.uid }
      : "skip"
  );

  // Check if refund window is valid (7 days from delivery)
  const isRefundWindowValid = () => {
    if (!deliveredAt) return false;
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
    const refundWindowEnd = deliveredAt + sevenDaysInMs;
    return Date.now() <= refundWindowEnd;
  };

  // Check if refund request can be made
  const canRequestRefund = () => {
    if (orderStatus !== "Delivered") return false;
    if (!isRefundWindowValid()) return false;
    if (existingRequest && (existingRequest.status === "pending" || existingRequest.status === "approved")) {
      return false;
    }
    return true;
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }
      setPhotoFile(file);
      setError(null);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Please provide a reason for the refund");
      return;
    }

    if (!user?.uid) {
      setError("You must be logged in to request a refund");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      let photoStorageId: string | undefined;

      // Upload photo if provided
      if (photoFile) {
        setUploading(true);
        try {
          // Get upload URL from Convex
          const uploadUrl = await generateUploadUrl();
          
          // Upload file to Convex storage
          const uploadResponse = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": photoFile.type },
            body: photoFile,
          });

          if (!uploadResponse.ok) {
            throw new Error("Failed to upload photo");
          }

          // Get storage ID from response
          // The upload URL response contains the storageId
          const result = await uploadResponse.json();
          if (result.storageId) {
            photoStorageId = result.storageId as Id<"_storage">;
          } else {
            // Fallback: sometimes the storageId is in the response directly
            throw new Error("Failed to get storage ID from upload response");
          }
        } catch (uploadError: any) {
          console.error("Photo upload error", uploadError);
          setError("Failed to upload photo. Please try again.");
          setUploading(false);
          setSubmitting(false);
          return;
        }
        setUploading(false);
      }

      // Submit refund request
      const response = await fetch("/api/refunds/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          orderId,
          reason: reason.trim(),
          photoStorageId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to submit refund request");
      }

      setSuccess(true);
      setReason("");
      setPhotoFile(null);
      setPhotoPreview(null);
      setTimeout(() => {
        setShowForm(false);
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to submit refund request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!canRequestRefund()) {
    // Show refund request status if exists
    if (existingRequest) {
      if (existingRequest.status === "pending") {
        return (
          <div className="p-4 border border-yellow-500 bg-yellow-50 rounded">
            <p className="text-sm font-semibold text-yellow-900">
              Refund Request Pending Review
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              Your refund request is being reviewed by our team.
            </p>
          </div>
        );
      } else if (existingRequest.status === "approved") {
        return (
          <div className="p-4 border border-green-500 bg-green-50 rounded">
            <p className="text-sm font-semibold text-green-900">
              Refund Request Approved
            </p>
            <p className="text-xs text-green-700 mt-1">
              Your refund has been approved and will be processed shortly.
            </p>
          </div>
        );
      } else if (existingRequest.status === "refunded") {
        return (
          <div className="p-4 border border-green-500 bg-green-50 rounded">
            <p className="text-sm font-semibold text-green-900">
              Refund Processed
            </p>
            <p className="text-xs text-green-700 mt-1">
              Your refund has been processed successfully.
              {existingRequest.refundId && (
                <span className="block mt-1">Refund ID: {existingRequest.refundId}</span>
              )}
            </p>
          </div>
        );
      } else if (existingRequest.status === "rejected") {
        return (
          <div className="p-4 border border-red-500 bg-red-50 rounded">
            <p className="text-sm font-semibold text-red-900">
              Refund Request Rejected
            </p>
            <p className="text-xs text-red-700 mt-1">
              {existingRequest.adminNotes || "Your refund request was not approved."}
            </p>
          </div>
        );
      }
    }

    // Window expired
    if (orderStatus === "Delivered" && deliveredAt && !isRefundWindowValid()) {
      return (
        <div className="p-4 border border-gray-300 bg-gray-50 rounded">
          <p className="text-sm text-gray-600">
            Refund window has expired. Refunds can only be requested within 7 days of delivery.
          </p>
        </div>
      );
    }

    return null;
  }

  return (
    <div className="space-y-4">
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-red-600 text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-red-700 transition-all"
        >
          Request Refund
        </button>
      ) : (
        <div className="border p-6 bg-gray-50 rounded">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Request Refund</h3>
            <button
              onClick={() => {
                setShowForm(false);
                setError(null);
                setReason("");
                setPhotoFile(null);
                setPhotoPreview(null);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>

          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm">
              Refund request submitted successfully! Our team will review it shortly.
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm flex items-start gap-2">
              <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Reason for Refund <span className="text-red-600">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please describe why you need a refund (e.g., damaged product, wrong item, etc.)"
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-black resize-none"
                rows={4}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Photo of Damaged Product (Optional but Recommended)
              </label>
              {photoPreview ? (
                <div className="relative inline-block">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="max-w-xs max-h-48 rounded border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded p-6 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                    id="refund-photo"
                  />
                  <label
                    htmlFor="refund-photo"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload size={24} className="text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Click to upload a photo
                    </span>
                    <span className="text-xs text-gray-400">
                      PNG, JPG up to 5MB
                    </span>
                  </label>
                </div>
              )}
            </div>

            <div className="pt-4 border-t flex gap-4">
              <button
                type="submit"
                disabled={submitting || uploading}
                className="px-6 py-3 bg-black text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting || uploading ? "Submitting..." : "Submit Request"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setError(null);
                  setReason("");
                  setPhotoFile(null);
                  setPhotoPreview(null);
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 text-[11px] font-black uppercase tracking-[0.2em] hover:border-black hover:text-black transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

