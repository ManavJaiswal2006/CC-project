"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { signOut } from "firebase/auth";
import { useFirebaseAuth } from "../lib/usefirebaseauth";
import { auth } from "../lib/firebase";

type Size = {
  label: string;
  value: string;
  price: number;
};

export default function AdminPage() {
  const { isAuthenticated, isLoading } = useFirebaseAuth();

  const products = useQuery(api.product.getAllProducts);
  const createProduct = useMutation(api.product.createProduct);
  const updateProduct = useMutation(api.product.updateProduct);
  const deleteProduct = useMutation(api.product.deleteProduct);
  const generateUploadUrl = useMutation(api.product.generateUploadUrl);

  const imageRef = useRef<HTMLInputElement>(null);

  /* ================= STATE ================= */
  const [editingId, setEditingId] = useState<Id<"products"> | null>(null);
  const [mode, setMode] = useState<"single" | "sizes">("single");

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "Kitchenware",
    discount: 0,
    soldOut: false,
    price: 0,
    sizes: [] as Size[],
    image: null as File | null,
  });

  /* ================= AUTH ================= */
  if (isLoading || products === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading…
      </div>
    );
  }

  if (!isAuthenticated) return null;

  /* ================= HELPERS ================= */
  const uploadImage = async () => {
    if (!form.image) return undefined;
    const url = await generateUploadUrl();
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": form.image.type },
      body: form.image,
    });
    return (await res.json()).storageId;
  };

  const resetForm = () => {
    setEditingId(null);
    setMode("single");
    setForm({
      name: "",
      description: "",
      category: "Kitchenware",
      discount: 0,
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
      description: form.description,
      category: form.category,
      discount: form.discount,
      soldOut: form.soldOut,
      storageId,

      price: mode === "single" ? form.price : undefined,
      sizes: mode === "sizes" && form.sizes.length > 0 ? form.sizes : undefined,
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
    <div className="min-h-screen bg-gray-50 px-6 py-20">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-3xl font-bold uppercase">Admin</h1>
          <button
            onClick={() => signOut(auth)}
            className="text-xs uppercase tracking-widest text-gray-500 hover:text-red-600"
          >
            Logout
          </button>
        </div>

        {/* ================= FORM ================= */}
        <div className="bg-white border p-8 mb-16 space-y-8">

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
                onChange={(e) => setForm({ ...form, name: e.target.value })}
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

          <div>
            <label className="label">Description</label>
            <textarea
              className="input"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>

          {/* MODE */}
          <div>
            <label className="label">Pricing Type</label>
            <div className="flex gap-4">
              <button
                onClick={() => setMode("single")}
                className={`px-4 py-2 border ${
                  mode === "single" ? "bg-black text-white" : ""
                }`}
              >
                Single Price
              </button>
              <button
                onClick={() => setMode("sizes")}
                className={`px-4 py-2 border ${
                  mode === "sizes" ? "bg-black text-white" : ""
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
                  setForm({ ...form, price: Number(e.target.value) })
                }
              />
            </div>
          )}

          {/* SIZE BASED */}
          {mode === "sizes" && (
            <div className="space-y-4">
              <label className="label">Sizes</label>

              {form.sizes.map((s, i) => (
                <div key={i} className="grid grid-cols-3 gap-3">
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
                    sizes: [...form.sizes, { label: "", value: "", price: 0 }],
                  })
                }
                className="text-sm underline"
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
              ref={imageRef}
              onChange={(e) =>
                setForm({ ...form, image: e.target.files?.[0] || null })
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

        {/* ================= LIST ================= */}
        <div className="space-y-4">
          {products.map((p) => (
            <div
              key={p._id}
              className="bg-white border p-4 flex justify-between"
            >
              <div>
                <p className="font-bold">{p.name}</p>
                <p className="text-xs text-gray-500">
                  {p.sizes?.length
                    ? `${p.sizes.length} sizes`
                    : `₹${p.price}`}
                </p>
              </div>

              <div className="flex gap-4 text-sm">
                <button
                  onClick={() => {
                    setEditingId(p._id);
                    setMode(p.sizes?.length ? "sizes" : "single");
                    setForm({
                      name: p.name,
                      description: p.description,
                      category: p.category,
                      discount: p.discount,
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

      {/* SIMPLE STYLES */}
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
