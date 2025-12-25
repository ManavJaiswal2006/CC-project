"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Trash2, Edit2, X, Check } from "lucide-react";

export default function PromosPage() {
  /* ================= CONVEX ================= */
  const promos = useQuery(api.promo.getAllPromos);
  const createPromo = useMutation(api.promo.createPromo);
  const updatePromo = useMutation(api.promo.updatePromo);
  const deletePromo = useMutation(api.promo.deletePromo);

  /* ================= STATE ================= */
  const [editingId, setEditingId] = useState<Id<"promos"> | null>(null);
  const [form, setForm] = useState({
    code: "",
    discount: 0,
    active: true,
    minOrderAmount: "",
    maxDiscount: "",
    expiresAt: "",
    maxUsage: "",
    description: "",
  });

  /* ================= LOADING ================= */
  if (!promos) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50 px-8 py-8">
        <p>Loading promos…</p>
      </div>
    );
  }

  /* ================= HELPERS ================= */
  const resetForm = () => {
    setEditingId(null);
    setForm({
      code: "",
      discount: 0,
      active: true,
      minOrderAmount: "",
      maxDiscount: "",
      expiresAt: "",
      maxUsage: "",
      description: "",
    });
  };

  const handleEdit = (promo: typeof promos[0]) => {
    setEditingId(promo._id);
    setForm({
      code: promo.code,
      discount: promo.discount,
      active: promo.active,
      minOrderAmount: promo.minOrderAmount?.toString() || "",
      maxDiscount: promo.maxDiscount?.toString() || "",
      expiresAt: promo.expiresAt
        ? new Date(promo.expiresAt).toISOString().slice(0, 16)
        : "",
      maxUsage: promo.maxUsage?.toString() || "",
      description: promo.description || "",
    });
  };

  const handleSave = async () => {
    try {
      const payload: any = {
        discount: form.discount,
        active: form.active,
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : undefined,
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).getTime() : undefined,
        maxUsage: form.maxUsage ? Number(form.maxUsage) : undefined,
        description: form.description || undefined,
      };

      if (editingId) {
        if (form.code !== promos.find((p) => p._id === editingId)?.code) {
          payload.code = form.code;
        }
        await updatePromo({ id: editingId, ...payload });
      } else {
        payload.code = form.code;
        await createPromo(payload);
      }

      resetForm();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to save promo");
    }
  };

  const handleDelete = async (id: Id<"promos">) => {
    if (!confirm("Are you sure you want to delete this promo code?")) return;
    try {
      await deletePromo({ id });
    } catch (error) {
      alert("Failed to delete promo");
    }
  };

  const formatDate = (timestamp: number | undefined) => {
    if (!timestamp) return "Never";
    return new Date(timestamp).toLocaleString();
  };

  /* ================= UI ================= */
  return (
    <div className="bg-gray-50 px-4 sm:px-6 md:px-8 py-6 sm:py-8">
      <div className="w-full space-y-6 sm:space-y-8">
        {/* HEADER */}
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl text-black font-bold uppercase">
            Promo Codes
          </h1>
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
          </div>
        </div>

        {/* FORM */}
        <div className="bg-white border p-4 sm:p-6 md:p-8 space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">
            {editingId ? "Edit Promo Code" : "Create New Promo Code"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                Promo Code *
              </label>
              <input
                type="text"
                value={form.code}
                onChange={(e) =>
                  setForm({ ...form, code: e.target.value.toUpperCase() })
                }
                className="w-full border border-gray-300 px-3 py-2 text-sm"
                placeholder="SAVE20"
                disabled={!!editingId}
              />
              <p className="text-xs text-gray-400 mt-1">
                {editingId ? "Code cannot be changed after creation" : "Enter unique promo code"}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                Discount (%) *
              </label>
              <input
                type="number"
                value={form.discount}
                onChange={(e) =>
                  setForm({ ...form, discount: Number(e.target.value) })
                }
                className="w-full border border-gray-300 px-3 py-2 text-sm"
                min="0"
                max="100"
                placeholder="20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                Minimum Order Amount (₹)
              </label>
              <input
                type="number"
                value={form.minOrderAmount}
                onChange={(e) =>
                  setForm({ ...form, minOrderAmount: e.target.value })
                }
                className="w-full border border-gray-300 px-3 py-2 text-sm"
                min="0"
                placeholder="1000"
              />
              <p className="text-xs text-gray-400 mt-1">Optional - Leave empty for no minimum</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                Maximum Discount (₹)
              </label>
              <input
                type="number"
                value={form.maxDiscount}
                onChange={(e) =>
                  setForm({ ...form, maxDiscount: e.target.value })
                }
                className="w-full border border-gray-300 px-3 py-2 text-sm"
                min="0"
                placeholder="500"
              />
              <p className="text-xs text-gray-400 mt-1">Optional - Caps discount amount</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                Expires At
              </label>
              <input
                type="datetime-local"
                value={form.expiresAt}
                onChange={(e) =>
                  setForm({ ...form, expiresAt: e.target.value })
                }
                className="w-full border border-gray-300 px-3 py-2 text-sm"
              />
              <p className="text-xs text-gray-400 mt-1">Optional - Leave empty for no expiration</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                Maximum Usage Count
              </label>
              <input
                type="number"
                value={form.maxUsage}
                onChange={(e) =>
                  setForm({ ...form, maxUsage: e.target.value })
                }
                className="w-full border border-gray-300 px-3 py-2 text-sm"
                min="1"
                placeholder="100"
              />
              <p className="text-xs text-gray-400 mt-1">Optional - Leave empty for unlimited</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                Description
              </label>
              <input
                type="text"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full border border-gray-300 px-3 py-2 text-sm"
                placeholder="Save 20% on all orders"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) =>
                    setForm({ ...form, active: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm font-semibold">Active (Promo code is currently usable)</span>
              </label>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <button
              onClick={handleSave}
              disabled={!form.code.trim() || form.discount < 0 || form.discount > 100}
              className="px-6 py-3 bg-black text-white text-xs font-black uppercase tracking-[0.2em] hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {editingId ? "Update Promo" : "Create Promo"}
            </button>
            {editingId && (
              <button
                onClick={resetForm}
                className="px-6 py-3 border border-gray-300 text-xs font-black uppercase tracking-[0.2em] hover:bg-gray-100 whitespace-nowrap"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* LIST */}
        <div className="bg-white border">
          <div className="p-6 border-b">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">
              All Promo Codes ({promos.length})
            </h2>
          </div>

          {promos.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <p>No promo codes created yet.</p>
              <p className="text-sm mt-2">Create your first promo code above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold uppercase tracking-widest text-gray-500 text-xs">
                      Code
                    </th>
                    <th className="px-4 py-3 text-left font-bold uppercase tracking-widest text-gray-500 text-xs">
                      Discount
                    </th>
                    <th className="px-4 py-3 text-left font-bold uppercase tracking-widest text-gray-500 text-xs">
                      Usage
                    </th>
                    <th className="px-4 py-3 text-left font-bold uppercase tracking-widest text-gray-500 text-xs">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left font-bold uppercase tracking-widest text-gray-500 text-xs">
                      Expires
                    </th>
                    <th className="px-4 py-3 text-left font-bold uppercase tracking-widest text-gray-500 text-xs">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {promos.map((promo) => (
                    <tr key={promo._id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="font-mono font-bold">{promo.code}</span>
                        {promo.description && (
                          <p className="text-xs text-gray-400 mt-1">{promo.description}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold">{promo.discount}%</span>
                        {promo.maxDiscount && (
                          <p className="text-xs text-gray-400">Max ₹{promo.maxDiscount}</p>
                        )}
                        {promo.minOrderAmount && (
                          <p className="text-xs text-gray-400">Min ₹{promo.minOrderAmount}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {promo.usageCount}
                        {promo.maxUsage && ` / ${promo.maxUsage}`}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold ${
                            promo.active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {promo.active ? (
                            <>
                              <Check size={12} /> Active
                            </>
                          ) : (
                            <>
                              <X size={12} /> Inactive
                            </>
                          )}
                        </span>
                        {promo.expiresAt && promo.expiresAt < Date.now() && (
                          <p className="text-xs text-red-600 mt-1">Expired</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {formatDate(promo.expiresAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(promo)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(promo._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

