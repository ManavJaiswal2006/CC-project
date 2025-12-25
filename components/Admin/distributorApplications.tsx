"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export default function DistributorApplicationsPage() {
  const [viewStatus, setViewStatus] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [selectedApplication, setSelectedApplication] = useState<Id<"distributor_applications"> | null>(null);
  const [gstin, setGstin] = useState("");
  const [creditLimit, setCreditLimit] = useState("100000");
  const [rejectionNotes, setRejectionNotes] = useState("");
  const [userId, setUserId] = useState("");

  const applications = useQuery(
    api.distributorApplications.getAllApplications,
    viewStatus === "all" ? {} : { status: viewStatus }
  );

  const approveApplication = useMutation(api.distributorApplications.approveApplication);
  const rejectApplication = useMutation(api.distributorApplications.rejectApplication);

  // Get user by email for auto-filling user ID
  const selectedApp = applications?.find((app) => app._id === selectedApplication);
  const userByEmail = useQuery(
    api.user.getUserByEmail,
    selectedApp?.email ? { email: selectedApp.email } : "skip"
  );

  // Auto-fill user ID when application is selected
  useEffect(() => {
    if (selectedApplication && selectedApp) {
      // If application already has userId, use it
      if (selectedApp.userId) {
        setUserId(selectedApp.userId);
      } 
      // Otherwise, try to find user by email
      else if (userByEmail?.userId) {
        setUserId(userByEmail.userId);
      } else {
        // No user found, leave empty for admin to fill
        setUserId("");
      }
    } else {
      // Reset when no application is selected
      setUserId("");
      setGstin("");
      setCreditLimit("100000");
      setRejectionNotes("");
    }
  }, [selectedApplication, selectedApp, userByEmail]);

  const handleApprove = async (applicationId: Id<"distributor_applications">) => {
    if (!confirm("Are you sure you want to approve this application? This will grant distributor role to the user.")) {
      return;
    }

    try {
      await approveApplication({
        applicationId,
        userId: userId.trim() || undefined,
        gstin: gstin.trim() || undefined,
        creditLimit: creditLimit ? Number(creditLimit) : undefined,
      });
      setSelectedApplication(null);
      setGstin("");
      setCreditLimit("100000");
      setUserId("");
      alert("Application approved successfully!");
    } catch (error: any) {
      alert(`Error: ${error.message || "Failed to approve application"}`);
    }
  };

  const handleReject = async (applicationId: Id<"distributor_applications">) => {
    if (!confirm("Are you sure you want to reject this application?")) {
      return;
    }

    try {
      await rejectApplication({
        applicationId,
        notes: rejectionNotes.trim() || undefined,
      });
      setSelectedApplication(null);
      setRejectionNotes("");
      alert("Application rejected.");
    } catch (error: any) {
      alert(`Error: ${error.message || "Failed to reject application"}`);
    }
  };

  if (!applications) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        Loading applications…
      </div>
    );
  }

  const pendingCount = applications.filter((a) => a.status === "pending").length;
  const approvedCount = applications.filter((a) => a.status === "approved").length;
  const rejectedCount = applications.filter((a) => a.status === "rejected").length;

  return (
    <div className="bg-gray-50 px-8 py-8">
      <div className="w-full">
        <div className="flex items-center justify-between mb-12 gap-4">
          <h1 className="text-3xl text-black font-bold uppercase">
            Distributor Applications
          </h1>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-4 border-b border-gray-300 mb-8">
          <button
            onClick={() => setViewStatus("pending")}
            className={`px-6 py-3 border-b-2 transition-colors font-bold uppercase text-sm tracking-wider ${
              viewStatus === "pending"
                ? "border-red-600 text-red-600"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setViewStatus("approved")}
            className={`px-6 py-3 border-b-2 transition-colors font-bold uppercase text-sm tracking-wider ${
              viewStatus === "approved"
                ? "border-green-600 text-green-600"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            Approved ({approvedCount})
          </button>
          <button
            onClick={() => setViewStatus("rejected")}
            className={`px-6 py-3 border-b-2 transition-colors font-bold uppercase text-sm tracking-wider ${
              viewStatus === "rejected"
                ? "border-gray-600 text-gray-600"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            Rejected ({rejectedCount})
          </button>
          <button
            onClick={() => setViewStatus("all")}
            className={`px-6 py-3 border-b-2 transition-colors font-bold uppercase text-sm tracking-wider ${
              viewStatus === "all"
                ? "border-black text-black"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            All
          </button>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {applications.length === 0 ? (
            <div className="bg-white border p-8 text-center text-gray-500">
              No applications found.
            </div>
          ) : (
            applications.map((app) => (
              <div
                key={app._id}
                className="bg-white border p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <h3 className="text-xl font-bold">{app.name}</h3>
                      <span
                        className={`px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                          app.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : app.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4">
                      <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Email</p>
                        <p className="font-semibold">{app.email}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Phone</p>
                        <p className="font-semibold">{app.phone}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Location</p>
                        <p className="font-semibold">{app.location}</p>
                      </div>
                      {app.company && (
                        <div>
                          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Company</p>
                          <p className="font-semibold">{app.company}</p>
                        </div>
                      )}
                      {app.createdAt && (
                        <div>
                          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Applied On</p>
                          <p className="font-semibold">
                            {new Date(app.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="bg-gray-50 p-4 border border-gray-200 mb-4">
                      <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Message</p>
                      <p className="text-sm whitespace-pre-wrap">{app.message}</p>
                    </div>

                    {app.notes && (
                      <div className="bg-blue-50 p-4 border border-blue-200 mb-4">
                        <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Admin Notes</p>
                        <p className="text-sm">{app.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {app.status === "pending" && (
                    <div className="flex flex-col gap-3 ml-4">
                      <button
                        onClick={() => setSelectedApplication(app._id)}
                        className="px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors uppercase text-xs font-bold tracking-wider whitespace-nowrap"
                      >
                        Review
                      </button>
                    </div>
                  )}
                </div>

                {/* Approval/Rejection Modal */}
                {selectedApplication === app._id && app.status === "pending" && (
                  <div className="mt-6 pt-6 border-t border-gray-200 bg-gray-50 p-6">
                    <h4 className="font-bold mb-4 uppercase text-sm tracking-wider">
                      Review Application
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
                          User ID (Firebase UID) - Optional
                        </label>
                        <input
                          type="text"
                          value={userId}
                          onChange={(e) => setUserId(e.target.value)}
                          placeholder="Leave empty if user doesn't exist yet"
                          className="w-full border border-gray-300 px-3 py-2 text-sm"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          If user already has an account, enter their Firebase UID
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
                          GSTIN - Optional
                        </label>
                        <input
                          type="text"
                          value={gstin}
                          onChange={(e) => setGstin(e.target.value)}
                          placeholder="GST Identification Number"
                          className="w-full border border-gray-300 px-3 py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
                          Credit Limit (₹)
                        </label>
                        <input
                          type="number"
                          value={creditLimit}
                          onChange={(e) => setCreditLimit(e.target.value)}
                          placeholder="100000"
                          className="w-full border border-gray-300 px-3 py-2 text-sm"
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
                        Rejection Notes (if rejecting)
                      </label>
                      <textarea
                        value={rejectionNotes}
                        onChange={(e) => setRejectionNotes(e.target.value)}
                        placeholder="Optional notes for rejection"
                        rows={3}
                        className="w-full border border-gray-300 px-3 py-2 text-sm"
                      />
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={() => handleApprove(app._id)}
                        className="px-6 py-2 bg-green-600 text-white hover:bg-green-700 transition-colors uppercase text-xs font-bold tracking-wider"
                      >
                        Approve Application
                      </button>
                      <button
                        onClick={() => handleReject(app._id)}
                        className="px-6 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors uppercase text-xs font-bold tracking-wider"
                      >
                        Reject Application
                      </button>
                      <button
                        onClick={() => {
                          setSelectedApplication(null);
                          setGstin("");
                          setCreditLimit("100000");
                          setUserId("");
                          setRejectionNotes("");
                        }}
                        className="px-6 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors uppercase text-xs font-bold tracking-wider"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

