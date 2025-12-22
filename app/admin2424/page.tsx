"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../lib/firebase";  // 👈 POINT TO YOUR FIREBASE FILE
import { useFirebaseAuth } from "../lib/usefirebaseauth";

// --- CONFIGURATION ---
const ADMIN_EMAILS = ["2858.manav@gmail.com"]; 

export default function AdminPage() {
  // --- AUTH STATE ---
  const { user, isLoading: authLoading, isAuthenticated } = useFirebaseAuth();

  // --- LOCAL LOGIN FORM STATE ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // --- CONVEX DATA ---
  const products = useQuery(api.product.getAllProducts);
  const createProduct = useMutation(api.product.createProduct);
  const updateProduct = useMutation(api.product.updateProduct);
  const deleteProduct = useMutation(api.product.deleteProduct);
  const generateUploadUrl = useMutation(api.product.generateUploadUrl);

  // --- EDITOR STATE ---
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<Id<"products"> | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: "", description: "", price: 0, discount: 0, soldOut: false, selectedImage: null as File | null,
  });

  // --- LOGIN HANDLER ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setErrorMsg(""); // Success! Firebase state listener will trigger re-render
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Invalid Credentials or User Not Found");
    }
  };

  // --- CRUD HELPERS ---
  const resetForm = () => {
    setIsCreating(false);
    setEditingId(null);
    setFormData({ name: "", description: "", price: 0, discount: 0, soldOut: false, selectedImage: null });
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const startEdit = (product: any) => {
    setIsCreating(false);
    setEditingId(product._id);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      discount: product.discount,
      soldOut: product.soldOut,
      selectedImage: null
    });
  };

  const handleImageUpload = async () => {
    if (!formData.selectedImage) return null;
    const postUrl = await generateUploadUrl();
    const result = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": formData.selectedImage.type },
      body: formData.selectedImage,
    });
    const { storageId } = await result.json();
    return storageId as Id<"_storage">;
  };

  const handleSave = async () => {
    try {
      const storageId = await handleImageUpload();
      if (isCreating) {
        await createProduct({
          name: formData.name,
          description: formData.description,
          price: formData.price,
          discount: formData.discount,
          soldOut: formData.soldOut,
          storageId: storageId || undefined,
        });
      } else if (editingId) {
        await updateProduct({
          id: editingId,
          name: formData.name, // Ensure your backend supports 'name' update
          description: formData.description,
          price: formData.price,
          discount: formData.discount,
          soldOut: formData.soldOut,
          ...(storageId ? { storageId } : {}), 
        });
      }
      resetForm();
    } catch (error) {
      console.error(error);
      alert("Save failed. Check console.");
    }
  };

  const handleDelete = async (id: Id<"products">) => {
    if (confirm("Delete this product?")) await deleteProduct({ id });
  };

  // --- RENDER: LOADING ---
  if (authLoading || products === undefined) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-green-500 font-mono">
        <div className="animate-pulse">LOADING_SYSTEM...</div>
      </div>
    );
  }

  // --- RENDER: LOGIN SCREEN (If not logged in) ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative">
         <div className="absolute inset-0 z-0 pointer-events-none opacity-20" 
             style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 0)', backgroundSize: '20px 20px' }}>
        </div>

        <div className="z-10 w-full max-w-md border border-neutral-800 bg-neutral-900/50 p-8 backdrop-blur-sm">
          <h1 className="text-2xl font-bold text-white mb-6 tracking-widest text-center">ADMIN TERMINAL</h1>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-mono text-neutral-500">IDENTIFIER</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black border border-neutral-700 p-3 text-white focus:border-green-500 outline-none"
                placeholder="admin@example.com"
              />
            </div>
            <div>
               <label className="text-xs font-mono text-neutral-500">PASSKEY</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black border border-neutral-700 p-3 text-white focus:border-green-500 outline-none"
                placeholder="••••••••"
              />
            </div>

            {errorMsg && (
              <div className="bg-red-900/20 border border-red-900/50 p-2 text-red-500 text-xs text-center font-mono">
                {errorMsg}
              </div>
            )}

            <button type="submit" className="w-full py-3 bg-white text-black font-bold hover:bg-neutral-200 uppercase mt-4">
              Authenticate
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- RENDER: UNAUTHORIZED (Logged in, but wrong email) ---
  if (user?.email && !ADMIN_EMAILS.includes(user.email)) {
     return (
       <div className="min-h-screen bg-black flex items-center justify-center p-4">
         <div className="border border-red-900/50 p-8 text-center max-w-md">
            <h1 className="text-red-500 text-xl font-bold mb-4">ACCESS DENIED</h1>
            <p className="text-neutral-500 mb-2 font-mono text-xs">CURRENT USER:</p>
            <p className="text-white mb-6 font-mono">{user.email}</p>
            <button onClick={() => signOut(auth)} className="text-neutral-400 underline text-sm hover:text-white">
              Terminate Session
            </button>
         </div>
       </div>
     );
  }

  // --- RENDER: DASHBOARD (Authorized) ---
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-sans selection:bg-green-500/30 selection:text-green-200 pb-20 pt-20">
      <div className="fixed inset-0 z-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #262626 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

      <div className="relative z-10 max-w-6xl mx-auto p-6 md:p-12">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-neutral-800 pb-6 mb-12 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-green-500 animate-pulse"></div>
              <span className="text-xs font-mono text-green-500 uppercase tracking-widest">System Online</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight uppercase">
              Inventory<span className="text-neutral-700">_OS</span>
            </h1>
          </div>

          <div className="flex gap-4 items-center">
            <div className="text-right hidden md:block">
              <p className="text-xs text-neutral-500 font-mono">OPERATOR</p>
              <p className="text-sm text-white font-mono">{user?.email}</p>
            </div>
            {!isCreating && !editingId && (
              <button onClick={() => setIsCreating(true)} className="bg-white text-black h-12 px-6 font-bold hover:bg-green-400 transition-colors uppercase tracking-wide text-sm">
                + New Item
              </button>
            )}
            <button 
                onClick={() => signOut(auth)} 
                className="h-12 w-12 border border-neutral-800 flex items-center justify-center hover:bg-red-900/20 hover:text-red-500 transition-colors"
                title="Sign Out"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </button>
          </div>
        </div>

        {/* EDITOR */}
        {(isCreating || editingId) && (
          <div className="bg-black border border-neutral-800 p-8 mb-12 shadow-[0_0_50px_-15px_rgba(0,0,0,0.5)] relative">
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white"></div>

            <h2 className="text-xl font-bold text-white mb-8 border-b border-neutral-800 pb-2 inline-block">
              {isCreating ? "// INITIALIZE_PRODUCT" : "// MODIFY_DATA"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                {isCreating && (
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-neutral-500 uppercase">Product Name</label>
                    <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-neutral-900 border border-neutral-800 p-4 text-white focus:border-green-500 outline-none" placeholder="ENTER_NAME" />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-neutral-500 uppercase">Price ($)</label>
                    <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.valueAsNumber })} className="w-full bg-neutral-900 border border-neutral-800 p-4 text-white focus:border-green-500 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-neutral-500 uppercase">Discount (%)</label>
                    <input type="number" value={formData.discount} onChange={(e) => setFormData({ ...formData, discount: e.target.valueAsNumber })} className="w-full bg-neutral-900 border border-neutral-800 p-4 text-white focus:border-green-500 outline-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono text-neutral-500 uppercase">Asset Upload</label>
                  <input type="file" accept="image/*" ref={imageInputRef} onChange={(e) => setFormData({ ...formData, selectedImage: e.target.files?.[0] || null })} className="w-full bg-neutral-900 border border-neutral-800 p-3 text-sm text-neutral-400" />
                </div>
                <div className="flex items-center gap-3 p-4 border border-neutral-800 bg-neutral-900/50">
                   <input type="checkbox" checked={formData.soldOut} onChange={(e) => setFormData({ ...formData, soldOut: e.target.checked })} className="w-5 h-5 accent-red-500" />
                   <span className="text-xs font-mono uppercase text-neutral-400">Mark stock as 'DEPLETED'</span>
                </div>
              </div>
              <div className="flex flex-col h-full">
                <label className="text-xs font-mono text-neutral-500 uppercase mb-2">Description / Metadata</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="flex-1 w-full bg-neutral-900 border border-neutral-800 p-4 text-white focus:border-green-500 outline-none resize-none font-mono text-sm" />
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-neutral-800">
              <button onClick={resetForm} className="px-8 py-3 text-neutral-500 hover:text-white font-mono text-sm">[ CANCEL ]</button>
              <button onClick={handleSave} className="px-8 py-3 bg-green-600 hover:bg-green-500 text-black font-bold uppercase text-sm">{isCreating ? "Execute" : "Save"}</button>
            </div>
          </div>
        )}

        {/* DATA GRID */}
        <div className="grid grid-cols-1 gap-0 border border-neutral-800 bg-black">
          {products.map((product) => (
            <div key={product._id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center border-b border-neutral-800 hover:bg-neutral-900/30 group">
              <div className="col-span-2">
                <div className="w-16 h-16 bg-neutral-900 border border-neutral-800 relative">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                  ) : (
                     <div className="w-full h-full flex items-center justify-center text-neutral-700 text-[10px] font-mono">NO_IMG</div>
                  )}
                </div>
              </div>
              <div className="col-span-4">
                <h3 className="font-bold text-white font-mono uppercase">{product.name}</h3>
                <p className="text-neutral-500 text-xs mt-1 truncate font-mono">{product.description}</p>
              </div>
              <div className="col-span-2 font-mono text-sm text-white">${product.price}</div>
              <div className="col-span-2">
                {product.soldOut ? <span className="text-red-500 text-[10px] border border-red-900 px-2 py-1 bg-red-900/10 uppercase">Sold Out</span> : <span className="text-green-500 text-[10px] border border-green-900 px-2 py-1 bg-green-900/10 uppercase">In Stock</span>}
              </div>
              <div className="col-span-2 flex justify-end gap-2">
                <button onClick={() => startEdit(product)} className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800">Edit</button>
                <button onClick={() => handleDelete(product._id)} className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-900/10">Del</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}