"use client";

import React, { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { 
  Phone, Mail, MapPin, Clock, ChevronDown, Send, Globe, ShieldCheck 
} from "lucide-react";
import { contactFAQ } from "@/constants/contact";

gsap.registerPlugin(ScrollTrigger);

const faqs = contactFAQ;

export default function ConciergePage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const containerRef = useRef(null);

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
    const payload = { name: formData.get("name"), email: formData.get("email"), message: formData.get("message") };

    try {
      const res = await fetch("/api/contact", { method: "POST", body: JSON.stringify(payload) });
      if (res.ok) {
        setStatus("success");
        (e.target as HTMLFormElement).reset();
      } else setStatus("error");
    } catch { setStatus("error"); }
    finally { setLoading(false); }
  };

  return (
    <main ref={containerRef} className="bg-[#fcfcfc] text-slate-900 selection:bg-red-600 selection:text-white pb-20">
      
      {/* HEADER */}
      <section className="pt-32 pb-16 px-6 text-center">
        <h1 className="reveal font-bold text-5xl md:text-7xl italic mb-6">Concierge <span className="text-slate-400">& Care</span></h1>
        <p className="reveal max-w-xl mx-auto text-slate-500 font-light">Expert assistance for a world-class culinary journey.</p>
      </section>

      {/* CONTACT DETAILS BENTO */}
      <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
        <div className="reveal bg-white p-10 border border-slate-100 flex flex-col items-center text-center shadow-sm">
          <Phone className="text-red-600 mb-4" size={24} />
          <h3 className=" italic text-xl mb-2">Speak with Us</h3>
          <a href="tel:8800830465" className="font-bold text-lg">+91 8800830465</a>
        </div>
        <div className="reveal bg-white p-10 border border-slate-100 flex flex-col items-center text-center shadow-sm">
          <Mail className="text-slate-900 mb-4" size={24} />
          <h3 className=" italic text-xl mb-2">Email Inquiries</h3>
          <a href="mailto:care@bourgon.com" className="font-bold text-lg">care@bourgon.com</a>
        </div>
        <div className="reveal bg-white p-10 border border-slate-100 flex flex-col items-center text-center shadow-sm">
          <Clock className="text-red-600 mb-4" size={24} />
          <h3 className=" italic text-xl mb-2">Care Hours</h3>
          <p className="font-bold text-xs tracking-widest uppercase">Mon — Sat | 09AM — 07PM</p>
        </div>
        <div className="reveal md:col-span-3 bg-[#1e2433] text-white p-12 md:p-16 flex flex-col md:flex-row justify-between items-center relative overflow-hidden">
          <div className="z-10">
            <h4 className="text-3xl md:text-5xl italic mb-4">B-30, Ambedkar Colony, <br/> Chhatarpur, New Delhi</h4>
            <button className="text-xs font-bold border-b border-red-500 pb-1 flex items-center gap-2">FIND ON MAPS <Globe size={12}/></button>
          </div>
          <ShieldCheck size={200} className="absolute -right-10 opacity-10 rotate-12" />
        </div>
      </section>

      {/* FORM & FAQ GRID */}
      <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20">
        {/* FORM */}
        <div className="reveal">
          <h2 className="text-4xl  italic mb-8">Send a <span className="text-slate-400">Message</span></h2>
          <form onSubmit={handleSubmit} className="space-y-8 bg-slate-50 p-8 md:p-12 border border-slate-100 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <input name="name" required placeholder="Full Name" className="bg-transparent border-b border-slate-300 py-3 focus:border-red-600 outline-none transition-all font-light" />
              <input name="email" required type="email" placeholder="Email Address" className="bg-transparent border-b border-slate-300 py-3 focus:border-red-600 outline-none transition-all font-light" />
            </div>
            <textarea name="message" required rows={4} placeholder="Your Message..." className="w-full bg-transparent border-b border-slate-300 py-3 focus:border-red-600 outline-none transition-all font-light resize-none" />
            <button disabled={loading} className="w-full md:w-auto bg-slate-900 text-white px-10 py-5 font-bold tracking-widest text-[10px] hover:bg-red-700 transition-all flex items-center justify-center gap-4">
              {loading ? "PROCESSING..." : "SUBMIT INQUIRY"} <Send size={14} />
            </button>
            {status === "success" && <p className="text-green-600 text-[10px] font-bold tracking-widest uppercase">Thank you. We will contact you shortly.</p>}
            {status === "error" && <p className="text-red-600 text-[10px] font-bold tracking-widest uppercase">Error sending message. Please try again.</p>}
          </form>
        </div>

        {/* FAQ */}
        <div className="reveal">
          <h2 className="text-4xl italic mb-8">Service <span className="text-slate-400">FAQs</span></h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white border border-slate-200">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full p-6 text-left flex justify-between items-center group">
                  <span className={`font-medium ${openFaq === i ? "text-red-700" : "group-hover:text-red-600"}`}>{faq.question}</span>
                  <ChevronDown className={`transition-transform ${openFaq === i ? "rotate-180 text-red-600" : ""}`} size={18} />
                </button>
                <div className={`px-6 overflow-hidden transition-all duration-500 ${openFaq === i ? "max-h-40 pb-6 opacity-100" : "max-h-0 opacity-0"}`}>
                  <p className="text-slate-500 text-sm border-t border-slate-50 pt-4">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}