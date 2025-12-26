"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

type Size = {
  label: string;
  value: string;
  customerPrice: number;
  retailerPrice: number;
};

export default function AdminPage() {
  /* ================= CONVEX ================= */
  const products = useQuery(api.product.getAllProducts);
  const createProduct = useMutation(api.product.createProduct);
  const updateProduct = useMutation(api.product.updateProduct);
  const deleteProduct = useMutation(api.product.deleteProduct);
  const generateUploadUrl = useMutation(api.product.generateUploadUrl);

  /* ================= STATE ================= */
  const [editingId, setEditingId] = useState<Id<"products"> | null>(null);
  const [mode, setMode] = useState<"single" | "sizes">("single");
  const [pricingView, setPricingView] = useState<"customer" | "retailer">("customer");

  const imageRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "", // short
    details: "",     // ✅ long / detailed
    customerDiscount: 0,
    distributorDiscount: 0,
    stock: 0,
    soldOut: false,
    customerPrice: 0,
    retailerPrice: 0,
    sizes: [] as Size[],
    image: null as File | null,
  });

  /* ================= LOADING ================= */
  if (!products) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        Loading admin…
      </div>
    );
  }

  /* ================= HELPERS ================= */
  const uploadImage = async () => {
    if (!form.image) return undefined;

    // Validate file type
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!ALLOWED_TYPES.includes(form.image.type)) {
      alert('Invalid file type. Please upload a JPEG, PNG, or WebP image.');
      return undefined;
    }

    // Validate file size (5MB max)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (form.image.size > MAX_FILE_SIZE) {
      alert('File too large. Maximum size is 5MB.');
      return undefined;
    }

    const uploadUrl = await generateUploadUrl();
    const res = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": form.image.type },
      body: form.image,
    });

    const { storageId } = await res.json();
    return storageId;
  };

  const resetForm = () => {
    setEditingId(null);
    setMode("single");
    setPricingView("customer");
    setForm({
      name: "",
      category: "",
      description: "",
      details: "",
      customerDiscount: 0,
      distributorDiscount: 0,
      stock: 0,
      soldOut: false,
      customerPrice: 0,
      retailerPrice: 0,
      sizes: [],
      image: null,
    });
  };

  const saveProduct = async () => {
    const storageId = await uploadImage();

    const payload = {
      name: form.name,
      category: form.category,
      description: form.description,
      details: form.details || undefined,
      customerDiscount: form.customerDiscount,
      distributorDiscount: form.distributorDiscount,
      stock: form.stock,
      soldOut: form.soldOut,
      storageId,

      customerPrice: mode === "single" ? form.customerPrice : undefined,
      retailerPrice: mode === "single" ? form.retailerPrice : undefined,
      sizes: mode === "sizes" ? form.sizes : undefined,
    };

    if (editingId) {
      await updateProduct({ id: editingId, ...payload });
    } else {
      await createProduct(payload);
    }

    resetForm();
  };

  /* ================= UI ================= */
  return (
    <div className="bg-gray-50 px-8 py-8">
      <div className="w-full">

        <div className="flex items-center justify-between mb-12 gap-4">
          <h1 className="text-3xl text-black font-bold uppercase">
            Admin Panel
          </h1>
        </div>

        {/* ================= FORM ================= */}
        <div className="bg-white border p-8 mb-20 space-y-8">

          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">
            {editingId ? "Edit Product" : "Add Product"}
          </h2>

          {/* BASIC INFO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">Product Name</label>
              <input
                className="input"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />
            </div>

            <div>
              <label className="label">Category</label>
              <input
                className="input"
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
              />
            </div>
          </div>

          {/* SHORT DESCRIPTION */}
          <div>
            <label className="label">Short Description</label>
            <textarea
              className="input"
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>

          {/* DETAILED DESCRIPTION */}
          <div>
            <label className="label">Detailed Description</label>
            <textarea
              className="input"
              rows={6}
              placeholder="Materials, usage, care instructions, warranty, etc."
              value={form.details}
              onChange={(e) =>
                setForm({ ...form, details: e.target.value })
              }
            />
          </div>

          {/* STOCK & DISCOUNTS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="label">In Stock (qty)</label>
              <input
                type="number"
                min={0}
                className="input"
                value={form.stock}
                onChange={(e) =>
                  setForm({
                    ...form,
                    stock: Math.max(0, Number(e.target.value)),
                  })
                }
              />
            </div>

            <div>
              <label className="label">Customer Discount (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                className="input"
                value={form.customerDiscount}
                onChange={(e) =>
                  setForm({
                    ...form,
                    customerDiscount: Math.max(0, Math.min(100, Number(e.target.value))),
                  })
                }
              />
            </div>

            <div>
              <label className="label">Distributor Discount (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                className="input"
                value={form.distributorDiscount}
                onChange={(e) =>
                  setForm({
                    ...form,
                    distributorDiscount: Math.max(0, Math.min(100, Number(e.target.value))),
                  })
                }
              />
            </div>
          </div>

          {/* PRICING MODE */}
          <div>
            <label className="label">Pricing Type</label>
            <div className="flex gap-4">
              <button
                onClick={() => setMode("single")}
                className={`px-4 py-2 cursor-pointer border ${
                  mode === "single"
                    ? "bg-black text-white"
                    : "border-black text-black"
                }`}
              >
                Single Price
              </button>
              <button
                onClick={() => setMode("sizes")}
                className={`px-4 py-2 cursor-pointer border ${
                  mode === "sizes"
                    ? "bg-black text-white"
                    : "border-black text-black"
                }`}
              >
                Size Based
              </button>
            </div>
          </div>

          {/* SINGLE PRICE */}
          {mode === "single" && (
            <div className="space-y-4">
              <div>
                <label className="label">Pricing</label>
                <div className="flex gap-4 border-b border-gray-200 mb-4">
                  <button
                    type="button"
                    onClick={() => setPricingView("customer")}
                    className={`px-4 py-2 border-b-2 transition-colors ${
                      pricingView === "customer"
                        ? "border-black text-black font-bold"
                        : "border-transparent text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    Customer Price
                  </button>
                  <button
                    type="button"
                    onClick={() => setPricingView("retailer")}
                    className={`px-4 py-2 border-b-2 transition-colors ${
                      pricingView === "retailer"
                        ? "border-black text-black font-bold"
                        : "border-transparent text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    Retailer Price
                  </button>
                </div>

                {pricingView === "customer" && (
                  <div>
                    <input
                      type="number"
                      className="input"
                      value={form.customerPrice}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          customerPrice: Number(e.target.value),
                        })
                      }
                      placeholder="Enter customer price (B2C)"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Price shown to customers (B2C)
                    </p>
                  </div>
                )}

                {pricingView === "retailer" && (
                  <div>
                    <input
                      type="number"
                      className="input"
                      value={form.retailerPrice}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          retailerPrice: Number(e.target.value),
                        })
                      }
                      placeholder="Enter retailer price (B2B)"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Price shown to retailers/distributors (B2B)
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SIZE BASED */}
          {mode === "sizes" && (
            <div className="space-y-4">
              <div>
                <label className="label">Sizes</label>
                <div className="flex gap-4 border-b border-gray-200 mb-4">
                  <button
                    type="button"
                    onClick={() => setPricingView("customer")}
                    className={`px-4 py-2 border-b-2 transition-colors ${
                      pricingView === "customer"
                        ? "border-black text-black font-bold"
                        : "border-transparent text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    Customer Prices
                  </button>
                  <button
                    type="button"
                    onClick={() => setPricingView("retailer")}
                    className={`px-4 py-2 border-b-2 transition-colors ${
                      pricingView === "retailer"
                        ? "border-black text-black font-bold"
                        : "border-transparent text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    Retailer Prices
                  </button>
                </div>
              </div>

              {form.sizes.map((s, i) => (
                <div
                  key={i}
                  className="grid grid-cols-4 gap-3 p-3 bg-gray-50 rounded"
                >
                  <input
                    className="input"
                    placeholder="Label (22 CM)"
                    value={s.label}
                    onChange={(e) => {
                      const sizes = [...form.sizes];
                      sizes[i].label = e.target.value;
                      setForm({ ...form, sizes });
                    }}
                  />
                  <input
                    className="input"
                    placeholder="Value (22)"
                    value={s.value}
                    onChange={(e) => {
                      const sizes = [...form.sizes];
                      sizes[i].value = e.target.value;
                      setForm({ ...form, sizes });
                    }}
                  />
                  <input
                    type="number"
                    className="input"
                    placeholder={pricingView === "customer" ? "Customer Price" : "Retailer Price"}
                    value={pricingView === "customer" ? s.customerPrice : s.retailerPrice}
                    onChange={(e) => {
                      const sizes = [...form.sizes];
                      if (pricingView === "customer") {
                        sizes[i].customerPrice = Number(e.target.value);
                      } else {
                        sizes[i].retailerPrice = Number(e.target.value);
                      }
                      setForm({ ...form, sizes });
                    }}
                  />
                  <div className="text-xs text-gray-500 flex items-center">
                    {pricingView === "customer" ? (
                      <span>Retailer: ₹{s.retailerPrice || 0}</span>
                    ) : (
                      <span>Customer: ₹{s.customerPrice || 0}</span>
                    )}
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() =>
                  setForm({
                    ...form,
                    sizes: [
                      ...form.sizes,
                      { label: "", value: "", customerPrice: 0, retailerPrice: 0 },
                    ],
                  })
                }
                className="text-sm underline text-black"
              >
                + Add Size
              </button>
            </div>
          )}

          {/* IMAGE */}
          <div>
            <label className="label">Product Image</label>
            <input
              type="file"
              className="border-black border px-3 py-1"
              ref={imageRef}
              onChange={(e) =>
                setForm({
                  ...form,
                  image: e.target.files?.[0] || null,
                })
              }
            />
          </div>

          {/* SAVE */}
          <button
            onClick={saveProduct}
            className="w-full bg-black text-white py-4 uppercase font-bold tracking-widest"
          >
            Save Product
          </button>
        </div>

        {/* ================= PRODUCT LIST ================= */}
        <div className="space-y-6 text-black">
          {/* Pricing View Tabs */}
          <div className="flex gap-4 border-b border-gray-300">
            <button
              onClick={() => setPricingView("customer")}
              className={`px-6 py-3 border-b-2 transition-colors font-bold uppercase text-sm tracking-wider ${
                pricingView === "customer"
                  ? "border-black text-black"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              Customer Pricing
            </button>
            <button
              onClick={() => setPricingView("retailer")}
              className={`px-6 py-3 border-b-2 transition-colors font-bold uppercase text-sm tracking-wider ${
                pricingView === "retailer"
                  ? "border-black text-black"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              Retailer Pricing
            </button>
          </div>

          {/* Products List */}
          <div className="space-y-4">
            {products.map((p) => {
              const customerPrice = p.customerPrice ?? 0;
              const retailerPrice = p.retailerPrice ?? 0;
              const displayPrice = pricingView === "customer" ? customerPrice : retailerPrice;
              const otherPrice = pricingView === "customer" ? retailerPrice : customerPrice;

              return (
                <div
                  key={p._id}
                  className="bg-white border p-4"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-bold text-lg mb-2">{p.name}</p>
                      <p className="text-xs text-gray-500 mb-4">
                        {p.sizes?.length
                          ? `${p.sizes.length} sizes`
                          : `Single price`}{" "}
                        • Customer: {p.customerDiscount ?? 0}% off • Distributor: {p.distributorDiscount ?? 0}% off • In stock: {p.stock ?? 0}
                      </p>

                      {/* PRICING DISPLAY */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className={`p-4 rounded ${pricingView === "customer" ? "bg-gray-50 border-2 border-gray-900" : "bg-gray-50 border border-gray-200"}`}>
                          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">
                            {pricingView === "customer" ? "Customer Price (B2C)" : "Retailer Price (B2B)"}
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            ₹{displayPrice.toLocaleString()}
                          </p>
                        </div>
                        <div className="p-4 rounded bg-gray-50 border border-gray-200">
                          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">
                            {pricingView === "customer" ? "Retailer Price (B2B)" : "Customer Price (B2C)"}
                          </p>
                          <p className="text-xl font-semibold text-gray-600">
                            ₹{otherPrice.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 text-sm ml-4">
                      <button
                        onClick={() => {
                          setEditingId(p._id);
                          setMode(p.sizes?.length ? "sizes" : "single");
                          setPricingView("customer");
                          setForm({
                            name: p.name,
                            category: p.category,
                            description: p.description,
                            details: p.details ?? "",
                            customerDiscount: p.customerDiscount ?? 0,
                            distributorDiscount: p.distributorDiscount ?? 0,
                            stock: p.stock ?? 0,
                            soldOut: p.soldOut,
                            customerPrice: p.customerPrice ?? 0,
                            retailerPrice: p.retailerPrice ?? 0,
                            sizes: (p.sizes ?? []).map((s: any) => ({
                              label: s.label,
                              value: s.value,
                              customerPrice: s.customerPrice ?? 0,
                              retailerPrice: s.retailerPrice ?? 0,
                            })),
                            image: null,
                          });
                        }}
                        className="px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors uppercase text-xs font-bold tracking-wider"
                      >
                        Edit
                      </button>

                      <button
                        className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors uppercase text-xs font-bold tracking-wider"
                        onClick={() => deleteProduct({ id: p._id })}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* STYLES */}
      <style jsx>{`
        .label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          color: #6b7280;
          margin-bottom: 6px;
          display: block;
        }
        .input {
          width: 100%;
          border: 1px solid #d1d5db;
          padding: 10px;
        }
      `}</style>
    </div>
  );
}
