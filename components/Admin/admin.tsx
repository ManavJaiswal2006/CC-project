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

type Color = {
  label: string;
  value: string;
  price: number;
};

type Subproduct = {
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
  const [mode, setMode] = useState<"single" | "sizes" | "colors" | "subproducts">("single");

  const imageRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "", // short
    details: "",     // ✅ long / detailed
    customerDiscount: 0,
    distributorDiscount: 0,
    stock: 0,
    quantity: 1, // Pack quantity (1 for solo, 6 for pack of 6, 8 for pack of 8, etc.)
    soldOut: false,
    price: 0,
    sizes: [] as Size[],
    colors: [] as Color[],
    subproducts: [] as Subproduct[],
    image: null as File | null,
    existingStorageId: null as Id<"_storage"> | null, // Store existing image ID when editing
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
      customerDiscount: 0,
      distributorDiscount: 0,
      stock: 0,
      quantity: 1,
      soldOut: false,
      price: 0,
      sizes: [],
      colors: [],
      subproducts: [],
      image: null,
      existingStorageId: null,
    });
  };

  const saveProduct = async () => {
    // Validate required fields
    if (!form.name.trim()) {
      alert("Please enter a product name.");
      return;
    }

    if (!form.category.trim()) {
      alert("Please enter a category.");
      return;
    }

    if (!form.description.trim()) {
      alert("Please enter a short description.");
      return;
    }

    // Validate pricing based on mode
    if (mode === "single") {
      if (!form.price || form.price <= 0) {
        alert("Please enter a valid base price for single price mode.");
        return;
      }
    } else if (mode === "sizes") {
      if (!form.sizes || form.sizes.length === 0) {
        alert("Please add at least one size.");
        return;
      }
      
      // Validate each size has all required fields
      for (let i = 0; i < form.sizes.length; i++) {
        const size = form.sizes[i];
        if (!size.label.trim()) {
          alert(`Please enter a label for size ${i + 1}.`);
          return;
        }
        if (!size.value.trim()) {
          alert(`Please enter a value for size ${i + 1}.`);
          return;
        }
        if (!size.price || size.price <= 0) {
          alert(`Please enter a valid price for size ${i + 1}.`);
          return;
        }
      }
    } else if (mode === "colors") {
      if (!form.colors || form.colors.length === 0) {
        alert("Please add at least one color.");
        return;
      }
      
      // Validate each color has all required fields
      for (let i = 0; i < form.colors.length; i++) {
        const color = form.colors[i];
        if (!color.label.trim()) {
          alert(`Please enter a label for color ${i + 1}.`);
          return;
        }
        if (!color.value.trim()) {
          alert(`Please enter a value for color ${i + 1}.`);
          return;
        }
        if (!color.price || color.price <= 0) {
          alert(`Please enter a valid price for color ${i + 1}.`);
          return;
        }
      }
    } else if (mode === "subproducts") {
      if (!form.subproducts || form.subproducts.length === 0) {
        alert("Please add at least one subproduct.");
        return;
      }
      
      // Validate each subproduct has all required fields
      for (let i = 0; i < form.subproducts.length; i++) {
        const subproduct = form.subproducts[i];
        if (!subproduct.label.trim()) {
          alert(`Please enter a label for subproduct ${i + 1}.`);
          return;
        }
        if (!subproduct.value.trim()) {
          alert(`Please enter a value for subproduct ${i + 1}.`);
          return;
        }
        if (!subproduct.price || subproduct.price <= 0) {
          alert(`Please enter a valid price for subproduct ${i + 1}.`);
          return;
        }
      }
    }

    // Validate image for new products
    if (!editingId && !form.image) {
      alert("Please upload a product image.");
      return;
    }

    // Upload new image if provided, otherwise use existing one
    const newStorageId = await uploadImage();
    const storageId = newStorageId || form.existingStorageId;

    // Explicitly construct payload to avoid any accidental field inclusion
    const payload: {
      name: string;
      category: string;
      description: string;
      details?: string;
      customerDiscount: number;
      distributorDiscount: number;
      stock: number;
      quantity?: number;
      soldOut: boolean;
      storageId?: any;
      price?: number;
      sizes?: Size[];
      colors?: Color[];
      subproducts?: Subproduct[];
    } = {
      name: form.name,
      category: form.category,
      description: form.description,
      details: form.details || undefined,
      customerDiscount: form.customerDiscount,
      distributorDiscount: form.distributorDiscount,
      stock: form.stock,
      quantity: form.quantity > 1 ? form.quantity : undefined, // Only include if > 1
      soldOut: form.soldOut,

      price: mode === "single" ? form.price : undefined,
      sizes: mode === "sizes" ? form.sizes : undefined,
      colors: mode === "colors" ? form.colors : undefined,
      subproducts: mode === "subproducts" ? form.subproducts : undefined,
    };

    // Only include storageId if we have one (new or existing)
    if (storageId) {
      payload.storageId = storageId;
    }

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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
              <label className="label">Pack Quantity</label>
              <input
                type="number"
                min={1}
                className="input"
                value={form.quantity}
                onChange={(e) =>
                  setForm({
                    ...form,
                    quantity: Math.max(1, Number(e.target.value)),
                  })
                }
                placeholder="1 for solo, 6 for pack of 6, etc."
              />
              <p className="text-xs text-gray-500 mt-1">
                {form.quantity === 1 ? "Solo item" : `Pack of ${form.quantity}`}
              </p>
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
              <button
                onClick={() => setMode("colors")}
                className={`px-4 py-2 cursor-pointer border ${
                  mode === "colors"
                    ? "bg-black text-white"
                    : "border-black text-black"
                }`}
              >
                Color Based
              </button>
              <button
                onClick={() => setMode("subproducts")}
                className={`px-4 py-2 cursor-pointer border ${
                  mode === "subproducts"
                    ? "bg-black text-white"
                    : "border-black text-black"
                }`}
              >
                Subproducts
              </button>
            </div>
          </div>

          {/* SINGLE PRICE */}
          {mode === "single" && (
            <div className="space-y-4">
              <div>
                <label className="label">Base Price</label>
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
                  placeholder="Enter base price"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Base price (customer and retailer prices calculated from discounts above)
                </p>
                {form.price > 0 && (
                  <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                    <p className="font-semibold mb-2">Calculated Prices:</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-500">Customer Price:</p>
                        <p className="font-bold">
                          ₹{Math.round(form.price - (form.price * form.customerDiscount) / 100)}
                        </p>
                        {form.customerDiscount > 0 && (
                          <p className="text-xs text-gray-400">
                            ({form.customerDiscount}% off from ₹{form.price})
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Retailer Price:</p>
                        <p className="font-bold">
                          ₹{Math.round(form.price - (form.price * form.distributorDiscount) / 100)}
                        </p>
                        {form.distributorDiscount > 0 && (
                          <p className="text-xs text-gray-400">
                            ({form.distributorDiscount}% off from ₹{form.price})
                          </p>
                        )}
                      </div>
                    </div>
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
                <p className="text-xs text-gray-500 mb-3">
                  Enter base price for each size. Customer and retailer prices will be calculated from discounts above.
                </p>
              </div>

              {form.sizes.map((s, i) => {
                const basePrice = s.price || 0;
                const customerPrice = Math.round(basePrice - (basePrice * form.customerDiscount) / 100);
                const retailerPrice = Math.round(basePrice - (basePrice * form.distributorDiscount) / 100);
                
                return (
                  <div
                    key={i}
                    className="grid grid-cols-5 gap-3 p-3 bg-gray-50 rounded items-center"
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
                      placeholder="Base Price"
                      value={s.price}
                      onChange={(e) => {
                        const sizes = [...form.sizes];
                        sizes[i].price = Number(e.target.value);
                        setForm({ ...form, sizes });
                      }}
                    />
                    <div className="text-xs text-gray-500 flex flex-col justify-center">
                      <span>Customer: ₹{customerPrice}</span>
                      <span>Retailer: ₹{retailerPrice}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const sizes = form.sizes.filter((_, index) => index !== i);
                        setForm({ ...form, sizes });
                      }}
                      className="px-3 py-2 bg-red-600 text-white text-xs font-bold uppercase hover:bg-red-700 transition-colors"
                      title="Remove size"
                    >
                      Remove
                    </button>
                  </div>
                );
              })}

              <button
                type="button"
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

          {/* COLOR BASED */}
          {mode === "colors" && (
            <div className="space-y-4">
              <div>
                <label className="label">Colors</label>
                <p className="text-xs text-gray-500 mb-3">
                  Enter base price for each color. Customer and retailer prices will be calculated from discounts above.
                </p>
              </div>

              {form.colors.map((c, i) => {
                const basePrice = c.price || 0;
                const customerPrice = Math.round(basePrice - (basePrice * form.customerDiscount) / 100);
                const retailerPrice = Math.round(basePrice - (basePrice * form.distributorDiscount) / 100);
                
                return (
                  <div
                    key={i}
                    className="grid grid-cols-5 gap-3 p-3 bg-gray-50 rounded items-center"
                  >
                    <input
                      className="input"
                      placeholder="Label (Red)"
                      value={c.label}
                      onChange={(e) => {
                        const colors = [...form.colors];
                        colors[i].label = e.target.value;
                        setForm({ ...form, colors });
                      }}
                    />
                    <input
                      className="input"
                      placeholder="Value (#FF0000)"
                      value={c.value}
                      onChange={(e) => {
                        const colors = [...form.colors];
                        colors[i].value = e.target.value;
                        setForm({ ...form, colors });
                      }}
                    />
                    <input
                      type="number"
                      className="input"
                      placeholder="Base Price"
                      value={c.price}
                      onChange={(e) => {
                        const colors = [...form.colors];
                        colors[i].price = Number(e.target.value);
                        setForm({ ...form, colors });
                      }}
                    />
                    <div className="text-xs text-gray-500 flex flex-col justify-center">
                      <span>Customer: ₹{customerPrice}</span>
                      <span>Retailer: ₹{retailerPrice}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const colors = form.colors.filter((_, index) => index !== i);
                        setForm({ ...form, colors });
                      }}
                      className="px-3 py-2 bg-red-600 text-white text-xs font-bold uppercase hover:bg-red-700 transition-colors"
                      title="Remove color"
                    >
                      Remove
                    </button>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={() =>
                  setForm({
                    ...form,
                    colors: [
                      ...form.colors,
                      { label: "", value: "", price: 0 },
                    ],
                  })
                }
                className="text-sm underline text-black"
              >
                + Add Color
              </button>
            </div>
          )}

          {/* SUBPRODUCTS BASED */}
          {mode === "subproducts" && (
            <div className="space-y-4">
              <div>
                <label className="label">Subproducts</label>
                <p className="text-xs text-gray-500 mb-3">
                  Enter base price for each subproduct (e.g., Baby Fork, Baby Soup). Customer and retailer prices will be calculated from discounts above.
                </p>
              </div>

              {form.subproducts.map((sp, i) => {
                const basePrice = sp.price || 0;
                const customerPrice = Math.round(basePrice - (basePrice * form.customerDiscount) / 100);
                const retailerPrice = Math.round(basePrice - (basePrice * form.distributorDiscount) / 100);
                
                return (
                  <div
                    key={i}
                    className="grid grid-cols-5 gap-3 p-3 bg-gray-50 rounded items-center"
                  >
                    <input
                      className="input"
                      placeholder="Label (Baby Fork)"
                      value={sp.label}
                      onChange={(e) => {
                        const subproducts = [...form.subproducts];
                        subproducts[i].label = e.target.value;
                        setForm({ ...form, subproducts });
                      }}
                    />
                    <input
                      className="input"
                      placeholder="Value (baby-fork)"
                      value={sp.value}
                      onChange={(e) => {
                        const subproducts = [...form.subproducts];
                        subproducts[i].value = e.target.value;
                        setForm({ ...form, subproducts });
                      }}
                    />
                    <input
                      type="number"
                      className="input"
                      placeholder="Base Price"
                      value={sp.price}
                      onChange={(e) => {
                        const subproducts = [...form.subproducts];
                        subproducts[i].price = Number(e.target.value);
                        setForm({ ...form, subproducts });
                      }}
                    />
                    <div className="text-xs text-gray-500 flex flex-col justify-center">
                      <span>Customer: ₹{customerPrice}</span>
                      <span>Retailer: ₹{retailerPrice}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const subproducts = form.subproducts.filter((_, index) => index !== i);
                        setForm({ ...form, subproducts });
                      }}
                      className="px-3 py-2 bg-red-600 text-white text-xs font-bold uppercase hover:bg-red-700 transition-colors"
                      title="Remove subproduct"
                    >
                      Remove
                    </button>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={() =>
                  setForm({
                    ...form,
                    subproducts: [
                      ...form.subproducts,
                      { label: "", value: "", price: 0 },
                    ],
                  })
                }
                className="text-sm underline text-black"
              >
                + Add Subproduct
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

          {/* Products List */}
          <div className="space-y-4">
            {products.map((p) => {
              const basePrice = p.price ?? 0;
              const customerPrice = Math.round(basePrice - (basePrice * (p.customerDiscount ?? 0)) / 100);
              const retailerPrice = Math.round(basePrice - (basePrice * (p.distributorDiscount ?? 0)) / 100);

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
                          : p.colors?.length
                          ? `${p.colors.length} colors`
                          : p.subproducts?.length
                          ? `${p.subproducts.length} subproducts`
                          : `Single price`}{" "}
                        • {p.quantity && p.quantity > 1 ? `Pack of ${p.quantity}` : "Solo"}{" "}
                        • Customer: {p.customerDiscount ?? 0}% off • Distributor: {p.distributorDiscount ?? 0}% off • In stock: {p.stock ?? 0}
                      </p>

                      {/* PRICING DISPLAY */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 rounded bg-gray-50 border border-gray-200">
                          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">
                            Base Price
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            ₹{basePrice.toLocaleString()}
                          </p>
                        </div>
                        <div className="p-4 rounded bg-gray-50 border border-gray-200">
                          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">
                            Customer Price (B2C)
                          </p>
                          <p className="text-xl font-semibold text-gray-900">
                            ₹{customerPrice.toLocaleString()}
                          </p>
                          {p.customerDiscount > 0 && (
                            <p className="text-xs text-gray-400 mt-1">
                              {p.customerDiscount}% off
                            </p>
                          )}
                        </div>
                        <div className="p-4 rounded bg-gray-50 border border-gray-200">
                          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">
                            Retailer Price (B2B)
                          </p>
                          <p className="text-xl font-semibold text-gray-900">
                            ₹{retailerPrice.toLocaleString()}
                          </p>
                          {p.distributorDiscount > 0 && (
                            <p className="text-xs text-gray-400 mt-1">
                              {p.distributorDiscount}% off
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 text-sm ml-4">
                      <button
                        onClick={() => {
                          setEditingId(p._id);
                          // Determine mode based on what fields exist
                          let productMode: "single" | "sizes" | "colors" | "subproducts" = "single";
                          if (p.sizes?.length) {
                            productMode = "sizes";
                          } else if (p.colors?.length) {
                            productMode = "colors";
                          } else if (p.subproducts?.length) {
                            productMode = "subproducts";
                          }
                          setMode(productMode);
                          setForm({
                            name: p.name,
                            category: p.category,
                            description: p.description,
                            details: p.details ?? "",
                            customerDiscount: p.customerDiscount ?? 0,
                            distributorDiscount: p.distributorDiscount ?? 0,
                            stock: p.stock ?? 0,
                            quantity: p.quantity ?? 1,
                            soldOut: p.soldOut,
                            price: p.price ?? 0,
                            sizes: (p.sizes ?? []).map((s: any) => ({
                              label: s.label,
                              value: s.value,
                              price: s.price ?? 0,
                            })),
                            colors: (p.colors ?? []).map((c: any) => ({
                              label: c.label,
                              value: c.value,
                              price: c.price ?? 0,
                            })),
                            subproducts: (p.subproducts ?? []).map((sp: any) => ({
                              label: sp.label,
                              value: sp.value,
                              price: sp.price ?? 0,
                            })),
                            image: null,
                            existingStorageId: p.storageId ?? null, // Preserve existing image ID
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
