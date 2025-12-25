"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/lib/firebase";
import { User, MapPin, Plus, Trash2, Package, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/app/context/AuthContext";

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
  const { logout } = useAuth();

  /* ================= AUTH ================= */
  const [authLoading, setAuthLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUserEmail(user?.email ?? null);
      setUserId(user?.uid ?? null);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  /* ================= CONVEX ================= */
  const userData = useQuery(
    api.user.getUser,
    userId ? { userId } : "skip"
  );
  const updateUser = useMutation(api.user.updateUser);

  /* ================= PROFILE ================= */
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const isProfileValid =
    name.trim().length > 0 && phone.trim().length === 10;

  /* ================= ADDRESSES ================= */
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [savingAddresses, setSavingAddresses] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  /* ================= LOAD USER DATA ================= */
  useEffect(() => {
    // Only load data once when userData first becomes available and hasn't been loaded yet
    if (userData && !dataLoaded) {
      setName(userData.name || "");
      setPhone(userData.phone || "");
      if (userData.addresses && userData.addresses.length > 0) {
        // Map database addresses to component format
        setAddresses(
          userData.addresses.map((addr) => ({
            id: addr.id,
            label: (addr.label as "Home" | "Work" | "Other") || "Home",
            customLabel: addr.customLabel,
            street: addr.street || "",
            pincode: addr.pincode || "",
            city: addr.city || "",
            state: addr.state || "",
          }))
        );
      }
      setDataLoaded(true);
    }
  }, [userData, dataLoaded]);

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

  /* ================= SAVE HANDLERS ================= */

  const handleSaveProfile = async () => {
    if (!isProfileValid || !userId || !userEmail || savingProfile) return;

    setSavingProfile(true);
    try {
      // Map addresses to database format
      const dbAddresses = addresses.map((addr) => ({
        id: addr.id,
        label: addr.label,
        customLabel: addr.customLabel,
        street: addr.street,
        city: addr.city,
        pincode: addr.pincode,
        state: addr.state,
      }));

      await updateUser({
        userId,
        name: name.trim(),
        email: userEmail,
        phone: phone.trim(),
        addresses: dbAddresses,
      });
      alert("Profile saved successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile. Please try again.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveAddresses = async () => {
    if (!canSaveAddresses || !userId || !userEmail || savingAddresses) return;

    setSavingAddresses(true);
    try {
      // Map addresses to database format
      const dbAddresses = addresses.map((addr) => ({
        id: addr.id,
        label: addr.label,
        customLabel: addr.customLabel,
        street: addr.street,
        city: addr.city,
        pincode: addr.pincode,
        state: addr.state,
      }));

      await updateUser({
        userId,
        name: name.trim() || userData?.name || "",
        email: userEmail,
        phone: phone.trim() || userData?.phone || "",
        addresses: dbAddresses,
      });
      alert("Addresses saved successfully!");
    } catch (error) {
      console.error("Error saving addresses:", error);
      alert("Failed to save addresses. Please try again.");
    } finally {
      setSavingAddresses(false);
    }
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-medium text-gray-600">Loading account…</p>
        </div>
      </div>
    );
  }

  if (!userEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center space-y-4 p-8 bg-white rounded-2xl shadow-lg border border-gray-200">
          <User size={48} className="mx-auto text-gray-400" />
          <p className="text-sm font-medium text-gray-600">Please log in to view your account.</p>
        </div>
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 text-gray-900">
      <div className="w-full px-4 sm:px-6 py-8 sm:py-12 md:py-16 lg:py-20">
        
        {/* HEADER */}
        <header className="mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-3 bg-black rounded-xl shadow-lg">
                <User size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold uppercase tracking-tight">
                  My Account
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">{userEmail}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <button
                onClick={() => router.push("/orders")}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider border-2 border-gray-300 bg-white hover:border-black hover:bg-black hover:text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg transition-all duration-200 shadow-sm whitespace-nowrap cursor-pointer"
              >
                <Package size={16} />
                Orders
              </button>

              <button
                onClick={async () => {
                  await logout();
                  router.push("/");
                }}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider border-2 border-red-300 bg-white text-red-600 hover:border-red-600 hover:bg-red-600 hover:text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg transition-all duration-200 shadow-sm whitespace-nowrap cursor-pointer"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </header>

        <div className="space-y-6 sm:space-y-8">

          {/* PROFILE */}
          <section className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8 md:p-10 overflow-hidden">
            <div className="flex items-center gap-3 mb-6 sm:mb-8 pb-4 border-b border-gray-200">
              <div className="p-2 bg-gray-100 rounded-lg">
                <User size={20} className="text-gray-700" />
              </div>
              <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-gray-700">
                Profile Information
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              {/* NAME */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">
                  Full Name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all bg-white hover:bg-gray-50 shadow-sm hover:shadow-md"
                />
              </div>

              {/* PHONE */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">
                  Mobile Number
                </label>
                <div className="flex items-center border-2 border-gray-200 rounded-lg bg-gray-50 hover:bg-white transition-colors focus-within:ring-2 focus-within:ring-black focus-within:border-transparent">
                  <span className="px-4 py-3 text-sm font-medium text-gray-600 border-r-2 border-gray-200">+91</span>
                  <input
                    value={phone}
                    maxLength={10}
                    onChange={(e) =>
                      setPhone(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="10-digit mobile number"
                    className="flex-1 px-4 py-3 text-sm outline-none bg-transparent"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={!isProfileValid || savingProfile}
              className={`mt-6 sm:mt-8 px-8 sm:px-10 py-3 sm:py-4 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 whitespace-nowrap shadow-md ${
                isProfileValid && !savingProfile
                  ? "bg-black text-white hover:bg-gray-800 hover:shadow-lg transform hover:-translate-y-0.5 cursor-pointer"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {savingProfile ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </span>
              ) : (
                "Save Profile"
              )}
            </button>
          </section>

          {/* ADDRESSES */}
          <section className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8 md:p-10 overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <MapPin size={20} className="text-gray-700" />
                </div>
                <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-gray-700">
                  Shipping Addresses
                </h2>
              </div>

              <button
                onClick={addAddress}
                disabled={!canAddNewAddress}
                className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider border-2 px-4 py-2.5 rounded-lg transition-all duration-200 whitespace-nowrap shadow-sm ${
                  canAddNewAddress
                    ? "border-gray-300 bg-white hover:border-black hover:bg-black hover:text-white text-gray-700 cursor-pointer"
                    : "border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50"
                }`}
              >
                <Plus size={16} /> Add Address
              </button>
            </div>

            {addresses.length === 0 && (
              <div className="text-center py-12 sm:py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-sm font-medium text-gray-500">
                  No addresses added yet.
                </p>
                <p className="text-xs text-gray-400 mt-2">Add your first address to get started</p>
              </div>
            )}

            <div className="space-y-4 sm:space-y-6">
              {addresses.map((addr, index) => (
                <div
                  key={addr.id}
                  className="relative bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200 p-5 sm:p-6 space-y-4 sm:space-y-5 hover:border-gray-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="absolute top-4 right-4">
                    <button
                      onClick={() => removeAddress(addr.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 cursor-pointer"
                      aria-label="Remove address"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pr-10 sm:pr-12">
                    <select
                      value={addr.label}
                      onChange={(e) =>
                        updateAddress(addr.id, "label", e.target.value)
                      }
                      className="flex-1 border-2 border-gray-200 rounded-lg px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white hover:bg-gray-50 transition-all shadow-sm hover:shadow-md cursor-pointer"
                    >
                      <option>Home</option>
                      <option>Work</option>
                      <option>Other</option>
                    </select>

                    {addr.label === "Other" && (
                      <input
                        placeholder="Custom label (e.g., Apartment)"
                        value={addr.customLabel ?? ""}
                        onChange={(e) =>
                          updateAddress(
                            addr.id,
                            "customLabel",
                            e.target.value
                          )
                        }
                        className="flex-1 border-2 border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white hover:bg-gray-50 transition-colors"
                      />
                    )}
                  </div>

                  <input
                    placeholder="Street address, building, apartment"
                    value={addr.street}
                    onChange={(e) =>
                      updateAddress(addr.id, "street", e.target.value)
                    }
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white hover:bg-gray-50 transition-all shadow-sm hover:shadow-md"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
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
                      className="border-2 border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white hover:bg-gray-50 transition-all shadow-sm hover:shadow-md"
                    />

                    <input
                      value={addr.city}
                      readOnly
                      placeholder="City"
                      className="border-2 border-gray-200 rounded-lg px-4 py-3 text-sm bg-gray-100 text-gray-600 cursor-not-allowed"
                    />

                    <input
                      value={addr.state}
                      readOnly
                      placeholder="State"
                      className="border-2 border-gray-200 rounded-lg px-4 py-3 text-sm bg-gray-100 text-gray-600 cursor-not-allowed"
                    />
                  </div>
                </div>
              ))}
            </div>

            {addresses.length > 0 && (
              <button
                onClick={handleSaveAddresses}
                disabled={!canSaveAddresses || savingAddresses}
                className={`mt-6 sm:mt-8 w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 whitespace-nowrap shadow-md ${
                  canSaveAddresses && !savingAddresses
                    ? "bg-black text-white hover:bg-gray-800 hover:shadow-lg transform hover:-translate-y-0.5 cursor-pointer"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {savingAddresses ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </span>
                ) : (
                  "Save Addresses"
                )}
              </button>
            )}
          </section>

        </div>
      </div>
    </div>
  );
}
