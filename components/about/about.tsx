"use client";

import React, { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  MoveDown,
  Star,
  Award,
  ShieldCheck,
  Soup,
  ChevronRight,
} from "lucide-react";
import { logoImg } from "@/constants";

gsap.registerPlugin(ScrollTrigger);

export default function RedesignedAboutPage() {
  const containerRef = useRef(null);
  const boxRefs = useRef<HTMLDivElement[]>([]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Sophisticated Text reveal
      gsap.from(".reveal-text", {
        y: 40,
        opacity: 0,
        duration: 1.2,
        ease: "power4.out",
        stagger: 0.1,
      });

      // Bento Box Animation
      boxRefs.current.forEach((box) => {
        gsap.from(box, {
          scrollTrigger: {
            trigger: box,
            start: "top 85%",
            toggleActions: "play none none none",
          },
          y: 60,
          opacity: 0,
          scale: 0.98,
          duration: 1,
          ease: "expo.out",
        });
      });

      // Parallax for the main image
      gsap.to(".parallax-img", {
        yPercent: 15,
        ease: "none",
        scrollTrigger: {
          trigger: ".parallax-container",
          scrub: true,
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const addToRefs = (el: HTMLDivElement | null) => {
    if (el && !boxRefs.current.includes(el)) {
      boxRefs.current.push(el);
    }
  };

  return (
    <main ref={containerRef} className="bg-[#f4f4f5] text-slate-900">
      {/* --- HERO SECTION --- */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-white overflow-hidden">
        {/* Subtle Brand Pattern Background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
        </div>

        <div className="relative z-10 text-center space-y-8">
          <Image src={logoImg} alt="logo" className="mx-auto" width={160} height={60} priority />
          <h1 className="reveal-text text-xl md:text-3xl text-black font-bold tracking-[0.4em] uppercase">
            Beyond Quality <span className="opacity-50 ">|</span> Beyond Design
          </h1>
          <p className="reveal-text w-full text-black/80 text-sm md:text-base tracking-wide leading-relaxed">
            In the world of technology and innovation, we provide products that
            match your expectations and earn your trust through world-class
            quality.
          </p>
          <div className="reveal-text pt-10">
            <div className="animate-bounce flex flex-col items-center gap-2 opacity-60">
              <span className="text-[10px] uppercase tracking-widest">
                Scroll to Explore
              </span>
              <MoveDown size={20} />
            </div>
          </div>
        </div>
      </section>

      {/* --- BOXED CONTENT GRID --- */}
      <section className="w-full p-4 md:p-12 -mt-20 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Main Philosophy Box */}
          <div
            ref={addToRefs}
            className="md:col-span-8 bg-white p-10 md:p-20 shadow-xl border border-slate-100 flex flex-col justify-center"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="h-[1px] w-12 bg-red-600"></div>
              <span className="text-red-600 uppercase tracking-widest text-xs font-bold font-sans">
                Our Approach
              </span>
            </div>
            <h3 className="text-4xl md:text-6xl font-medium leading-[1.1] mb-8 text-slate-800">
              The Harmony of <br />
              <span className="italic text-red-600">Man & Machine.</span>
            </h3>
            <p className="text-slate-500 text-lg leading-relaxed font-sans w-full">
              We believe in an innovative approach using Man-Machine
              combination. Each item from BOURGON goes through expert inspection
              to ensure undemanding perfection.
            </p>
          </div>

          {/* Quality Badge Box */}
          <div
            ref={addToRefs}
            className="md:col-span-4 bg-[#2a3142] text-white p-10 flex flex-col justify-between shadow-xl"
          >
            <div className="flex gap-10">
              <Star className="text-red-500" size={40} fill="currentColor" />
              <Star className="text-red-500" size={40} fill="currentColor" />
              <Star className="text-red-500" size={40} fill="currentColor" />
              <Star className="text-red-500" size={40} fill="currentColor" />
              <Star className="text-red-500" size={40} fill="currentColor" />
            </div>
            <div>
              <h4 className="text-3xl mb-4 italic font-bold">
                World Class Quality
              </h4>
              <p className="text-slate-400 text-sm leading-loose font-sans">
                Climbing to global heights as a company that provides food for
                the soul.
              </p>
            </div>
          </div>

          {/* Parallax Image Box */}
          <div
            ref={addToRefs}
            className="md:col-span-12 h-[500px] md:h-[700px] overflow-hidden relative shadow-2xl parallax-container"
          >
            <Image
              src="https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80"
              alt="Dining Table"
              fill
              className="object-cover absolute top-[-10%] parallax-img"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-12 left-12 text-white">
              <p className="uppercase tracking-[0.3em] text-[10px] mb-2 font-sans">
                Expertly Crafted
              </p>
              <h4 className="text-4xl font-light italic">Cooking with Love</h4>
            </div>
          </div>

          {/* Feature Trio */}
          <div
            ref={addToRefs}
            className="md:col-span-4 bg-white p-12 border-b-4 border-red-600 shadow-lg group hover:-translate-y-2 transition-transform duration-500"
          >
            <ShieldCheck size={32} className="text-red-600 mb-6" />
            <h5 className="text-xl font-bold mb-4 uppercase tracking-tight font-sans">
              Rigid & Easy
            </h5>
            <p className="text-slate-500 text-sm leading-relaxed font-sans italic">
              Our products are comfort which makes undemanding dishes unique.
            </p>
          </div>

          <div
            ref={addToRefs}
            className="md:col-span-4 bg-white p-12 border-b-4 border-slate-800 shadow-lg group hover:-translate-y-2 transition-transform duration-500"
          >
            <Soup size={32} className="text-slate-800 mb-6" />
            <h5 className="text-xl font-bold mb-4 uppercase tracking-tight font-sans">
              Food for the Soul
            </h5>
            <p className="text-slate-500 text-sm leading-relaxed font-sans italic">
              Designed to bring smiles to your face with every interaction.
            </p>
          </div>

          <div
            ref={addToRefs}
            className="md:col-span-4 bg-white p-12 border-b-4 border-red-600 shadow-lg group hover:-translate-y-2 transition-transform duration-500"
          >
            <Award size={32} className="text-red-600 mb-6" />
            <h5 className="text-xl font-bold mb-4 uppercase tracking-tight font-sans">
              Best of our Best
            </h5>
            <p className="text-slate-500 text-sm leading-relaxed font-sans italic">
              Our aim is to make the absolute best to ensure complete trust.
            </p>
          </div>

          {/* Contact Box */}
          <div
            ref={addToRefs}
            className="md:col-span-12 bg-white border border-slate-200 p-12 flex flex-col md:flex-row justify-between items-center text-center md:text-left"
          >
            <div>
              <h4 className="text-2xl font-medium text-slate-800 italic">
                Get in touch with Bourgon
              </h4>
              <p className="text-slate-400 font-sans text-sm">
                B-30, Ambedkar Colony, Chhatarpur, New Delhi
              </p>
            </div>
            <a
              href="tel:8800830465"
              className="mt-6 md:mt-0 flex items-center gap-4 bg-slate-900 text-white px-8 py-4 rounded-full font-sans font-bold hover:bg-red-600 transition-colors"
            >
              CUSTOMER CARE: 8800830465
              <ChevronRight size={18} />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
