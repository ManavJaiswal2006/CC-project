"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

type Size = {
  label: string;
  value: string;
  price: number;
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

  const imageRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "", // short
    details: "",     // ✅ long / detailed
    discount: 0,
    stock: 0,
    soldOut: false,
    price: 0,
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
    setForm({
      name: "",
      category: "",
      description: "",
      details: "",
      discount: 0,
      stock: 0,
      soldOut: false,
      price: 0,
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
      discount: form.discount,
      stock: form.stock,
      soldOut: form.soldOut,
      storageId,

      price: mode === "single" ? form.price : undefined,
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
      <div className="max-w-6xl mx-auto">

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

          {/* STOCK & DISCOUNT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <label className="label">Discount (%)</label>
              <input
                type="number"
                className="input"
                value={form.discount}
                onChange={(e) =>
                  setForm({
                    ...form,
                    discount: Number(e.target.value),
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
            <div>
              <label className="label">Price (₹)</label>
              <input
                type="number"
                className="input"
                value={form.price}
                onChange={(e) =>
                  setForm({
                    ...form,
                    price: Number(e.target.value),
                  })
                }
              />
            </div>
          )}

          {/* SIZE BASED */}
          {mode === "sizes" && (
            <div className="space-y-4">
              <label className="label">Sizes</label>

              {form.sizes.map((s, i) => (
                <div
                  key={i}
                  className="grid grid-cols-3 gap-3"
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
                    placeholder="Price"
                    value={s.price}
                    onChange={(e) => {
                      const sizes = [...form.sizes];
                      sizes[i].price = Number(e.target.value);
                      setForm({ ...form, sizes });
                    }}
                  />
                </div>
              ))}

              <button
                onClick={() =>
                  setForm({
                    ...form,
                    sizes: [
                      ...form.sizes,
                      { label: "", value: "", price: 0 },
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
        <div className="space-y-4 text-black">
          {products.map((p) => (
            <div
              key={p._id}
              className="bg-white border p-4 flex justify-between items-center"
            >
              <div>
                <p className="font-bold">{p.name}</p>
                <p className="text-xs text-gray-500">
                  {p.sizes?.length
                    ? `${p.sizes.length} sizes`
                    : `₹${p.price}`}{" "}
                  • {p.discount}% off • In stock: {p.stock ?? 0}
                </p>
              </div>

              <div className="flex gap-4 text-sm">
                <button
                  onClick={() => {
                    setEditingId(p._id);
                    setMode(p.sizes?.length ? "sizes" : "single");
                    setForm({
                      name: p.name,
                      category: p.category,
                      description: p.description,
                      details: p.details ?? "",
                      discount: p.discount,
                      stock: p.stock ?? 0,
                      soldOut: p.soldOut,
                      price: p.price ?? 0,
                      sizes: p.sizes ?? [],
                      image: null,
                    });
                  }}
                >
                  Edit
                </button>

                <button
                  className="text-red-600"
                  onClick={() => deleteProduct({ id: p._id })}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
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
