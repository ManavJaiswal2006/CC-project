"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { User, Package, MapPin, LogOut, Plus, Trash2, Loader2 } from "lucide-react";
import { auth } from "@/app/lib/firebase";

export default function AccountPage() {
  const router = useRouter();
  
  // 1. Auth State
  const [firebaseUser, setFirebaseUser] = useState<any>(null);

  // 2. Convex Queries
  const userProfile = useQuery(api.user.getUser, 
    firebaseUser ? { userId: firebaseUser.uid } : "skip"
  );
  
  const userOrders = useQuery(api.order.getOrders,
    firebaseUser ? { userId: firebaseUser.uid } : "skip"
  );

  const updateUserMutation = useMutation(api.user.updateUser);

  // 3. UI States
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "" });
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: "Home", street: "", city: "", zip: "" });

  // --- UPDATED AUTH LISTENER (Redirects to Home on Logout) ---
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/"); // <--- Redirect to Home
      } else {
        setFirebaseUser(user);
        if(userProfile) {
           setFormData({ name: userProfile.name || "", phone: userProfile.phone || "" })
        }
      }
    });
    return () => unsub();
  }, [router, userProfile]);

  // --- HANDLERS ---
  const handleSaveProfile = async () => {
    if (!firebaseUser) return;
    await updateUserMutation({
      userId: firebaseUser.uid,
      email: firebaseUser.email,
      name: formData.name,
      phone: formData.phone,
      addresses: userProfile?.addresses || []
    });
    setIsEditing(false);
  };

  const handleAddAddress = async () => {
    if (!firebaseUser) return;
    const addressEntry = { ...newAddress, id: Date.now().toString() };
    const currentAddresses = userProfile?.addresses || [];
    
    await updateUserMutation({
      userId: firebaseUser.uid,
      email: firebaseUser.email,
      name: userProfile?.name || "",
      phone: userProfile?.phone || "",
      addresses: [...currentAddresses, addressEntry]
    });
    setShowAddressForm(false);
    setNewAddress({ label: "", street: "", city: "", zip: "" });
  };

  const handleDeleteAddress = async (idToDelete: string) => {
    if (!firebaseUser || !userProfile) return;
    const updatedList = userProfile.addresses.filter((a: any) => a.id !== idToDelete);
    await updateUserMutation({
      userId: firebaseUser.uid,
      email: firebaseUser.email,
      name: userProfile.name || "",
      phone: userProfile.phone || "",
      addresses: updatedList
    });
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // The useEffect above will handle the redirect
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  if (!firebaseUser) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-black"/></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 text-gray-900">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* SIDEBAR */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <div className="flex items-center gap-3 mb-8">
             <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center text-xl font-bold">
               {userProfile?.name ? userProfile.name[0].toUpperCase() : "U"}
             </div>
             <div className="overflow-hidden">
               <p className="font-bold truncate text-gray-900">{userProfile?.name || "Welcome"}</p>
               <p className="text-xs text-gray-500 truncate">{firebaseUser.email}</p>
             </div>
          </div>
          
          <nav className="space-y-2">
            {[
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'orders', label: 'Orders', icon: Package },
              { id: 'addresses', label: 'Addresses', icon: MapPin },
            ].map((item) => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)} 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === item.id 
                    ? 'bg-black text-white' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-black'
                }`}
              >
                <item.icon size={18} /> {item.label}
              </button>
            ))}
            
            <hr className="my-2 border-gray-100"/>
            
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg text-sm transition-colors">
              <LogOut size={18} /> Logout
            </button>
          </nav>
        </div>

        {/* CONTENT AREA */}
        <div className="md:col-span-3 bg-white p-8 rounded-xl shadow-sm border border-gray-100 min-h-[500px]">
          
          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Personal Info</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <label className="text-sm font-bold text-gray-700">Name</label>
                   <input 
                     disabled={!isEditing}
                     value={isEditing ? formData.name : (userProfile?.name || "")}
                     onChange={e => setFormData({...formData, name: e.target.value})}
                     className="w-full border border-gray-300 p-3 rounded-lg mt-1 text-gray-900 bg-white focus:ring-2 focus:ring-black focus:outline-none disabled:bg-gray-100 disabled:text-gray-500 transition-all"
                     placeholder="Enter your name"
                   />
                </div>
                <div>
                   <label className="text-sm font-bold text-gray-700">Phone</label>
                   <input 
                     disabled={!isEditing}
                     value={isEditing ? formData.phone : (userProfile?.phone || "")}
                     onChange={e => setFormData({...formData, phone: e.target.value})}
                     className="w-full border border-gray-300 p-3 rounded-lg mt-1 text-gray-900 bg-white focus:ring-2 focus:ring-black focus:outline-none disabled:bg-gray-100 disabled:text-gray-500 transition-all"
                     placeholder="Enter phone number"
                   />
                </div>
              </div>
              
              <div className="pt-4">
                {isEditing ? (
                  <div className="flex gap-4">
                    <button onClick={handleSaveProfile} className="bg-black text-white px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-colors font-medium">Save Changes</button>
                    <button onClick={() => setIsEditing(false)} className="border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-50 transition-colors font-medium">Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => setIsEditing(true)} className="bg-black text-white px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-colors font-medium">Edit Profile</button>
                )}
              </div>
            </div>
          )}

          {/* ORDERS TAB */}
          {activeTab === "orders" && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Order History</h2>
              {!userOrders ? <div className="flex justify-center py-10"><Loader2 className="animate-spin text-gray-400"/></div> : userOrders.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <Package className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <p className="text-gray-500 font-medium">No orders placed yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userOrders.map((order : any) => (
                    <div key={order._id} className="border border-gray-200 p-5 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center hover:border-black transition-colors bg-white">
                      <div>
                        <p className="font-bold text-gray-900 text-lg">{order.orderId}</p>
                        <p className="text-sm text-gray-500">{new Date(order._creationTime).toLocaleDateString()}</p>
                        <p className="text-xs text-blue-600 mt-1 font-medium bg-blue-50 inline-block px-2 py-0.5 rounded">{order.trackingNumber}</p>
                      </div>
                      <div className="mt-4 sm:mt-0 text-right">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {order.status}
                          </span>
                          <p className="font-bold mt-2 text-gray-900 text-lg">₹{order.totalAmount}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ADDRESSES TAB */}
          {activeTab === "addresses" && (
            <div>
               <div className="flex justify-between items-center mb-6">
                 <h2 className="text-2xl font-bold text-gray-900">Saved Addresses</h2>
                 <button onClick={() => setShowAddressForm(!showAddressForm)} className="flex items-center gap-2 text-sm font-bold bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                    <Plus size={16}/> Add New
                 </button>
               </div>
               
               {showAddressForm && (
                 <div className="bg-gray-50 p-6 rounded-xl mb-6 border border-gray-200">
                    <h3 className="font-bold text-gray-900 mb-4">New Address Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <input placeholder="Label (e.g. Home, Work)" className="border border-gray-300 p-3 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-black focus:outline-none" value={newAddress.label} onChange={e=>setNewAddress({...newAddress, label:e.target.value})}/>
                      <input placeholder="City" className="border border-gray-300 p-3 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-black focus:outline-none" value={newAddress.city} onChange={e=>setNewAddress({...newAddress, city:e.target.value})}/>
                      <input placeholder="Street Address" className="border border-gray-300 p-3 rounded-lg col-span-1 md:col-span-2 text-gray-900 bg-white focus:ring-2 focus:ring-black focus:outline-none" value={newAddress.street} onChange={e=>setNewAddress({...newAddress, street:e.target.value})}/>
                      <input placeholder="Zip Code" className="border border-gray-300 p-3 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-black focus:outline-none" value={newAddress.zip} onChange={e=>setNewAddress({...newAddress, zip:e.target.value})}/>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={handleAddAddress} className="bg-black text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-800">Save Address</button>
                        <button onClick={() => setShowAddressForm(false)} className="bg-white border border-gray-300 text-gray-700 px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
                    </div>
                 </div>
               )}

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {userProfile?.addresses?.length === 0 && !showAddressForm && (
                    <div className="col-span-2 text-center py-10 text-gray-400">No addresses saved.</div>
                 )}
                 {userProfile?.addresses?.map((addr : any) => (
                   <div key={addr.id} className="border border-gray-200 p-5 rounded-xl relative group hover:border-black transition-all bg-white shadow-sm">
                     <div className="flex items-center gap-2 mb-2">
                        <MapPin size={18} className="text-gray-400"/> 
                        <span className="font-bold text-gray-900">{addr.label}</span>
                     </div>
                     <p className="text-sm text-gray-600 leading-relaxed">{addr.street}</p>
                     <p className="text-sm text-gray-600">{addr.city} - {addr.zip}</p>
                     
                     <button 
                        onClick={() => handleDeleteAddress(addr.id)} 
                        className="absolute top-4 right-4 text-gray-300 hover:text-red-600 transition-colors p-1"
                        title="Delete Address"
                     >
                        <Trash2 size={18}/>
                     </button>
                   </div>
                 ))}
               </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}