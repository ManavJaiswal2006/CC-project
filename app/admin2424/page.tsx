"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

type Size = {
  label: string;
  value: string;
  price: number;
};

export default function AdminPage() {
  const products = useQuery(api.product.getAllProducts);
  const createProduct = useMutation(api.product.createProduct);
  const updateProduct = useMutation(api.product.updateProduct);
  const deleteProduct = useMutation(api.product.deleteProduct);
  const generateUploadUrl = useMutation(api.product.generateUploadUrl);

  const imageRef = useRef<HTMLInputElement>(null);

  const [editingId, setEditingId] = useState<Id<"products"> | null>(null);
  const [mode, setMode] = useState<"single" | "sizes">("single");

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    discount: 0,
    soldOut: false,
    price: 0,
    sizes: [] as Size[],
    image: null as File | null,
  });

  if (!products) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading admin…
      </div>
    );
  }

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
      category: "",
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
      sizes: mode === "sizes" ? form.sizes : undefined,
    };

    if (editingId) {
      await updateProduct({ id: editingId, ...payload });
    } else {
      await createProduct(payload);
    }

    resetForm();
  };

  return (
    <div className="min-h-screen bg-gray-50 px-8 py-16">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold uppercase mb-12">
          Admin Panel
        </h1>

        {/* ================= FORM ================= */}
        <div className="bg-white border p-8 mb-20 space-y-8">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">
            {editingId ? "Edit Product" : "Add Product"}
          </h2>

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

          <div>
            <label className="label">Description</label>
            <textarea
              className="input"
              rows={4}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
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

          {/* MODE */}
          <div>
            <label className="label">Pricing Type</label>
            <div className="flex gap-4">
              <button
                onClick={() => setMode("single")}
                className={`px-4 py-2 border ${
                  mode === "single"
                    ? "bg-black text-white"
                    : ""
                }`}
              >
                Single Price
              </button>
              <button
                onClick={() => setMode("sizes")}
                className={`px-4 py-2 border ${
                  mode === "sizes"
                    ? "bg-black text-white"
                    : ""
                }`}
              >
                Size Based
              </button>
            </div>
          </div>

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
                className="text-sm underline"
              >
                + Add Size
              </button>
            </div>
          )}

          <div>
            <label className="label">Product Image</label>
            <input
              type="file"
              ref={imageRef}
              onChange={(e) =>
                setForm({
                  ...form,
                  image: e.target.files?.[0] || null,
                })
              }
            />
          </div>

          <button
            onClick={saveProduct}
            className="w-full bg-black text-white py-4 uppercase font-bold tracking-widest"
          >
            Save Product
          </button>
        </div>
      </div>

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
