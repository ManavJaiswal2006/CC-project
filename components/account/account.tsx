"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/lib/firebase";
import {
  User,
  MapPin,
  Plus,
  Trash2,
  Package,
  Phone,
} from "lucide-react";
import { useRouter } from "next/navigation";

/* ================= TYPES ================= */

type Address = {
  id: string;
  label: "Home" | "Work" | "Other";
  customLabel?: string;
  street: string;
  pincode: string;
  city: string;
  state: string;
};

export default function AccountPage() {
  const router = useRouter();

  /* ================= AUTH ================= */
  const [authLoading, setAuthLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUserEmail(user?.email ?? null);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  /* ================= PROFILE ================= */
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const isProfileValid =
    name.trim().length > 0 && phone.trim().length === 10;

  /* ================= ADDRESSES ================= */
  const [addresses, setAddresses] = useState<Address[]>([]);

  /* ---------- HELPERS ---------- */

  const isAddressComplete = (a: Address) => {
    if (!a.street.trim()) return false;
    if (a.pincode.length !== 6) return false;
    if (!a.city || !a.state) return false;
    if (a.label === "Other" && !a.customLabel?.trim()) return false;
    return true;
  };

  const canAddNewAddress =
    addresses.length === 0 ||
    isAddressComplete(addresses[addresses.length - 1]);

  const canSaveAddresses =
    addresses.length > 0 && addresses.every(isAddressComplete);

  /* ---------- ADDRESS ACTIONS ---------- */

  const addAddress = () => {
    if (!canAddNewAddress) return;

    setAddresses((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        label: "Home",
        street: "",
        pincode: "",
        city: "",
        state: "",
      },
    ]);
  };

  const removeAddress = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const updateAddress = (
    id: string,
    field: keyof Address,
    value: string
  ) => {
    setAddresses((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, [field]: value } : a
      )
    );
  };

  /* ================= PIN LOOKUP ================= */
  useEffect(() => {
    addresses.forEach((addr) => {
      if (addr.pincode.length !== 6) return;
      if (addr.city && addr.state) return;

      fetch(`https://api.postalpincode.in/pincode/${addr.pincode}`)
        .then((res) => res.json())
        .then((data) => {
          if (data[0]?.Status === "Success") {
            const po = data[0].PostOffice[0];
            setAddresses((prev) =>
              prev.map((a) =>
                a.id === addr.id
                  ? {
                      ...a,
                      city: po.District,
                      state: po.State,
                    }
                  : a
              )
            );
          }
        })
        .catch(() => {});
    });
  }, [addresses]);

  /* ================= LOADING ================= */
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-500">
        Loading account…
      </div>
    );
  }

  if (!userEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-500">
        Please log in to view your account.
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-white text-zinc-900 px-6 py-24">
      <div className="max-w-4xl mx-auto space-y-20">

        {/* HEADER */}
        <header className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <User size={20} />
            <h1 className="text-2xl font-bold uppercase">
              My Account
            </h1>
          </div>

          <button
            onClick={() => router.push("/orders")}
            className="flex items-center gap-2 text-xs font-black uppercase tracking-widest border border-zinc-300 px-5 py-3 hover:border-black"
          >
            <Package size={14} />
            Orders
          </button>
        </header>

        {/* PROFILE */}
        <section className="border border-zinc-200 p-8 space-y-6">
          <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500">
            Profile
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">

            {/* NAME */}
            <div>
              <label className="block text-[11px] font-bold uppercase text-zinc-500 mb-2">
                Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-zinc-300 px-4 py-3 text-sm"
              />
            </div>

            {/* PHONE */}
            <div>
              <label className="block text-[11px] font-bold uppercase text-zinc-500 mb-2">
                Mobile Number
              </label>
              <div className="flex items-center border border-zinc-300">
                <span className="px-3 text-sm text-zinc-500">+91</span>
                <input
                  value={phone}
                  maxLength={10}
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/\D/g, ""))
                  }
                  className="flex-1 px-4 py-3 text-sm outline-none"
                />
              </div>
            </div>

          </div>

          <button
            disabled={!isProfileValid}
            className={`px-10 py-4 text-[11px] font-black uppercase tracking-[0.2em] transition
              ${
                isProfileValid
                  ? "bg-black text-white hover:bg-zinc-800"
                  : "bg-zinc-300 text-zinc-500 cursor-not-allowed"
              }`}
          >
            Save Profile
          </button>
        </section>

        {/* ADDRESSES */}
        <section className="border border-zinc-200 p-8 space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
              <MapPin size={14} /> Addresses
            </h2>

            <button
              onClick={addAddress}
              disabled={!canAddNewAddress}
              className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest border px-4 py-2 transition
                ${
                  canAddNewAddress
                    ? "border-zinc-300 hover:border-black"
                    : "border-zinc-200 text-zinc-400 cursor-not-allowed"
                }`}
            >
              <Plus size={14} /> Add Address
            </button>
          </div>

          {addresses.length === 0 && (
            <p className="text-sm text-zinc-400">
              No addresses added yet.
            </p>
          )}

          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="border border-zinc-200 p-6 space-y-6 relative"
            >
              <button
                onClick={() => removeAddress(addr.id)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-red-600"
              >
                <Trash2 size={16} />
              </button>

              <div className="flex gap-4">
                <select
                  value={addr.label}
                  onChange={(e) =>
                    updateAddress(addr.id, "label", e.target.value)
                  }
                  className="border px-3 py-2 text-sm"
                >
                  <option>Home</option>
                  <option>Work</option>
                  <option>Other</option>
                </select>

                {addr.label === "Other" && (
                  <input
                    placeholder="Custom label"
                    value={addr.customLabel ?? ""}
                    onChange={(e) =>
                      updateAddress(
                        addr.id,
                        "customLabel",
                        e.target.value
                      )
                    }
                    className="border px-3 py-2 text-sm"
                  />
                )}
              </div>

              <input
                placeholder="Street address"
                value={addr.street}
                onChange={(e) =>
                  updateAddress(addr.id, "street", e.target.value)
                }
                className="w-full border px-4 py-3 text-sm"
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  placeholder="PIN code"
                  maxLength={6}
                  value={addr.pincode}
                  onChange={(e) =>
                    updateAddress(
                      addr.id,
                      "pincode",
                      e.target.value.replace(/\D/g, "")
                    )
                  }
                  className="border px-4 py-3 text-sm"
                />

                <input
                  value={addr.city}
                  readOnly
                  placeholder="City"
                  className="border bg-zinc-100 px-4 py-3 text-sm"
                />

                <input
                  value={addr.state}
                  readOnly
                  placeholder="State"
                  className="border bg-zinc-100 px-4 py-3 text-sm"
                />
              </div>
            </div>
          ))}

          <button
            disabled={!canSaveAddresses}
            className={`px-10 py-4 text-[11px] font-black uppercase tracking-[0.2em] transition
              ${
                canSaveAddresses
                  ? "bg-black text-white hover:bg-zinc-800"
                  : "bg-zinc-300 text-zinc-500 cursor-not-allowed"
              }`}
          >
            Save Addresses
          </button>
        </section>

      </div>
    </div>
  );
}
