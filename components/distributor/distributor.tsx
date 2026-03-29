"use client";

import React, { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Phone, Mail, Building2, MapPin, Send, Users, TrendingUp, CheckCircle } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

gsap.registerPlugin(ScrollTrigger);

export default function DistributorPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const containerRef = useRef(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/distributor");
    }
  }, [user, authLoading, router]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-medium text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render form if not authenticated
  if (!user) {
    return null;
  }

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".reveal", { y: 30, opacity: 0, duration: 1, stagger: 0.15, ease: "power3.out" });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get("name"),
      email: user.email || formData.get("email") || "",
      phone: formData.get("phone"),
      company: formData.get("company"),
      location: formData.get("location"),
      message: formData.get("message"),
      userId: user.uid, // Include user ID since login is now required
    };

    try {
      const res = await fetch("/api/distributor", { 
        method: "POST", 
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload) 
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        setStatus("success");
        (e.target as HTMLFormElement).reset();
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error("Submission error:", error);
      setStatus("error");
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <main ref={containerRef} className="bg-[#fcfcfc] text-slate-900 selection:bg-red-600 selection:text-white pb-20">
      
      {/* HEADER */}
      <section className="pt-32 pb-16 px-6 text-center">
        <h1 className="reveal font-bold text-5xl md:text-7xl italic mb-6">
          Become a <span className="text-red-600">Distributor</span>
        </h1>
        <p className="reveal w-full text-slate-500 font-light text-lg">
          Join Manmal as a distributor and become part of our network delivering authentic football jerseys across India.
        </p>
      </section>

      {/* BENEFITS */}
      <section className="w-full px-6 grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
        <div className="reveal bg-white p-10 border border-slate-100 flex flex-col items-center text-center shadow-sm">
          <TrendingUp className="text-red-600 mb-4" size={32} />
          <h3 className="italic text-xl mb-3 font-semibold">Growth Opportunities</h3>
          <p className="text-slate-600 font-light">Access to premium product range and growing market demand</p>
        </div>
        <div className="reveal bg-white p-10 border border-slate-100 flex flex-col items-center text-center shadow-sm">
          <Users className="text-red-600 mb-4" size={32} />
          <h3 className="italic text-xl mb-3 font-semibold">Support & Training</h3>
          <p className="text-slate-600 font-light">Comprehensive support, training, and marketing materials</p>
        </div>
        <div className="reveal bg-white p-10 border border-slate-100 flex flex-col items-center text-center shadow-sm">
          <CheckCircle className="text-red-600 mb-4" size={32} />
          <h3 className="italic text-xl mb-3 font-semibold">Quality Products</h3>
          <p className="text-slate-600 font-light">Authentic football jerseys trusted by fans nationwide</p>
        </div>
      </section>

      {/* CONTACT INFO & FORM GRID */}
      <section className="w-full px-6 grid grid-cols-1 lg:grid-cols-2 gap-20">
        {/* CONTACT INFO */}
        <div className="reveal space-y-8">
          <h2 className="text-4xl italic mb-8">
            Get in <span className="text-slate-400">Touch</span>
          </h2>
          
          <div className="space-y-6">
            <div className="bg-white p-8 border border-slate-100 shadow-sm">
              <Phone className="text-red-600 mb-3" size={24} />
              <h3 className="italic text-lg mb-2 font-semibold">Call Us</h3>
              <div className="flex flex-col gap-2">
                <a href="tel:+918800830465" className="font-bold text-lg text-slate-900 hover:text-red-600 transition-colors">
                  +91 88008 30465
                </a>
                <a href="tel:+918800830467" className="font-bold text-lg text-slate-900 hover:text-red-600 transition-colors">
                  +91 88008 30467
                </a>
              </div>
            </div>
            
            <div className="bg-white p-8 border border-slate-100 shadow-sm">
              <Mail className="text-red-600 mb-3" size={24} />
              <h3 className="italic text-lg mb-2 font-semibold">Email Us</h3>
              <a href="mailto:info@manmal.com" className="font-bold text-lg text-slate-900 hover:text-red-600 transition-colors">
                info@manmal.com
              </a>
            </div>

            <div className="bg-white p-8 border border-slate-100 shadow-sm">
              <MapPin className="text-red-600 mb-3" size={24} />
              <h3 className="italic text-lg mb-2 font-semibold">Visit Us</h3>
              <p className="text-slate-600 font-light">
                22  R VANI VIHAR UTTAM NAGAR<br />
                NEW DELHI  110059, India
              </p>
            </div>
          </div>
        </div>

        {/* FORM */}
        <div className="reveal">
          <h2 className="text-4xl italic mb-8">
            Distributor <span className="text-slate-400">Application</span>
          </h2>
          <form onSubmit={handleSubmit} className="space-y-8 bg-slate-50 p-8 md:p-12 border border-slate-100 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <input 
                name="name" 
                required 
                placeholder="Your Name *" 
                defaultValue={user.displayName || ""}
                className="bg-transparent border-b border-slate-300 py-3 focus:border-red-600 outline-none transition-all font-light" 
              />
              <input 
                name="email" 
                required 
                type="email" 
                placeholder="Your Email *" 
                defaultValue={user.email || ""}
                readOnly
                className="bg-slate-50 border-b border-slate-300 py-3 focus:border-red-600 outline-none transition-all font-light cursor-not-allowed" 
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <input 
                name="phone" 
                required 
                type="tel" 
                placeholder="Phone Number *" 
                className="bg-transparent border-b border-slate-300 py-3 focus:border-red-600 outline-none transition-all font-light" 
              />
              <input 
                name="company" 
                placeholder="Company Name" 
                className="bg-transparent border-b border-slate-300 py-3 focus:border-red-600 outline-none transition-all font-light" 
              />
            </div>
            <input 
              name="location" 
              placeholder="Location / City *" 
              required
              className="w-full bg-transparent border-b border-slate-300 py-3 focus:border-red-600 outline-none transition-all font-light" 
            />
            <textarea 
              name="message" 
              required 
              rows={5} 
              placeholder="Tell us about your business and why you're interested in becoming a distributor... *" 
              className="w-full bg-transparent border-b border-slate-300 py-3 focus:border-red-600 outline-none transition-all font-light resize-none" 
            />
            <button 
              disabled={loading} 
              className="w-full md:w-auto bg-slate-900 text-white px-10 py-5 font-bold tracking-widest text-[10px] hover:bg-red-700 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
            >
              {loading ? "SUBMITTING..." : "SUBMIT APPLICATION"} <Send size={14} />
            </button>
            {status === "success" && (
              <p className="text-green-600 text-[10px] font-bold tracking-widest uppercase">
                Thank you! We will review your application and contact you shortly.
              </p>
            )}
            {status === "error" && (
              <p className="text-red-600 text-[10px] font-bold tracking-widest uppercase">
                Error submitting application. Please try again or contact us directly.
              </p>
            )}
          </form>
        </div>
      </section>

      {/* WHY BECOME A DISTRIBUTOR */}
      <section className="w-full px-6 mt-20">
        <div className="reveal bg-[#1e2433] text-white p-12 md:p-16">
          <h2 className="text-3xl md:text-5xl italic mb-8">Why Partner With Manmal?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl italic mb-4 font-semibold">Premium Product Portfolio</h3>
              <p className="text-slate-300 font-light leading-relaxed">
                Access to our complete range of authentic football jerseys,
                from club teams to national squads.
              </p>
            </div>
            <div>
              <h3 className="text-xl italic mb-4 font-semibold">Competitive Pricing</h3>
              <p className="text-slate-300 font-light leading-relaxed">
                Attractive distributor margins and pricing structures designed to 
                maximize your profitability.
              </p>
            </div>
            <div>
              <h3 className="text-xl italic mb-4 font-semibold">Brand Recognition</h3>
              <p className="text-slate-300 font-light leading-relaxed">
                Partner with a trusted brand known for quality, design, and 
                manufacturing excellence.
              </p>
            </div>
            <div>
              <h3 className="text-xl italic mb-4 font-semibold">Marketing Support</h3>
              <p className="text-slate-300 font-light leading-relaxed">
                Marketing materials, promotional support, and brand assets to 
                help you grow your business.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

