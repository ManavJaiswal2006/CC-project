"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MoveUpRight, Plus, ArrowDown } from "lucide-react";
import { brandSectionData, featureBanner, heroBento, heroData } from "@/constants/home";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function RedesignedHero() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const heroTl = gsap.timeline({ defaults: { ease: "expo.out" } });

      // 1. Cinematic Curtain Entrance
      heroTl
        .from(".hero-image-wrapper", {
          clipPath: "inset(0% 100% 0% 0%)",
          duration: 2.5,
          ease: "expo.inOut",
        })
        .from(".reveal-up", {
          y: 120,
          opacity: 0,
          duration: 1.8,
          stagger: 0.1,
        }, "-=1.8")
        .from(".nav-line", {
          scaleX: 0,
          transformOrigin: "left",
          duration: 1.5,
        }, "-=1.2");

      // 2. Liquid Bento Scroll
      gsap.utils.toArray<HTMLElement>(".bento-item").forEach((item) => {
        gsap.from(item, {
          y: 100,
          opacity: 0,
          scale: 0.98,
          scrollTrigger: {
            trigger: item,
            start: "top bottom",
            end: "top center",
            scrub: 2, // High scrub for liquid feel
          },
        });
      });

      // 3. Image Parallax
      gsap.to(".parallax-img", {
        yPercent: 20,
        ease: "none",
        scrollTrigger: {
          trigger: ".parallax-img",
          scrub: true,
        },
      });
        },
    { scope: containerRef }
  );

  return (
    <main ref={containerRef} className="bg-white text-zinc-900 selection:bg-orange-100">
      {/* Subtle Top Navigation Line */}
      <div className="nav-line fixed top-0 left-0 w-full h-[1px] bg-zinc-200 z-50" />

      <div className="w-full px-6 lg:px-12">
        
        {/* ================= HERO SECTION ================= */}
        <section className="relative min-h-screen flex flex-col pt-5 pb-20">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 gap-10">
            <div className="w-full">
              <div className="overflow-hidden mb-4">
                <p className="reveal-up text-orange-600 font-bold tracking-[0.3em] uppercase text-[10px]">
                  {heroData.subtitle}
                </p>
              </div>
              <h1 className="reveal-up text-5xl sm:text-6xl md:text-7xl lg:text-[8.5vw] font-black leading-[0.9] sm:leading-[0.8] uppercase tracking-tighter break-words">
                {heroData.title.map((line, i) => (
                  <span key={i} className="block overflow-hidden pb-1 sm:pb-2">
                    <span className="inline-block">{line}</span>
                  </span>
                ))}
              </h1>
            </div>
            
            <div className="w-full lg:w-[40vw] space-y-6 sm:space-y-8">
              <p className="reveal-up text-zinc-500 text-base sm:text-lg leading-relaxed font-light">
                {heroData.description}
              </p>
              <div className="reveal-up">
                <Link href={heroData.buttonLink} className="group flex items-center gap-4 sm:gap-8 py-2 border-b border-zinc-900 w-fit">
                  <span className="font-bold uppercase tracking-widest text-xs whitespace-nowrap">
                    {heroData.buttonText}
                  </span>
                  <MoveUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform shrink-0" />
                </Link>
              </div>
            </div>
          </div>

          <div className="hero-image-wrapper relative w-full h-[40vh] sm:h-[50vh] md:h-[60vh] lg:h-[65vh] overflow-hidden rounded-sm bg-zinc-100">
             <Image 
                src={heroData.mainImage} 
                alt="Main" 
                fill 
                className="parallax-img object-cover scale-125" 
                priority 
             />
             <div className="absolute bottom-4 right-4 sm:bottom-10 sm:right-10 flex flex-col items-center gap-2 sm:gap-4 text-white mix-blend-difference">
                <span className="uppercase text-[9px] tracking-[0.5em] [writing-mode:vertical-lr] hidden sm:block">Scroll</span>
                <ArrowDown size={14} className="animate-bounce"  />
             </div>
          </div>
        </section>

        {/* ================= BENTO GALLERY ================= */}
        <section className="py-12 sm:py-16 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 auto-rows-[250px] sm:auto-rows-[300px] md:auto-rows-[400px]">
            <BentoCard data={heroBento[0]} className="md:col-span-8 md:row-span-2" />
            <BentoCard data={heroBento[1]} className="md:col-span-4 md:row-span-1" />
            <BentoCard data={heroBento[2]} className="md:col-span-4 md:row-span-2" />
            <BentoCard data={heroBento[3]} className="md:col-span-4 md:row-span-1" />
            <BentoCard data={heroBento[4]} className="md:col-span-4 md:row-span-1" />
          </div>
        </section>

        {/* ================= EDITORIAL STORY ================= */}
        <section className="brand-section pb-30 border-t border-zinc-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
            <div className="sticky top-20">
              <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-12">
                {brandSectionData.title}
              </h2>
              <div className="space-y-8 text-zinc-500 text-xl font-light leading-relaxed w-full">
                {brandSectionData.paragraphs.map((p, i) => (
                  <p key={i} className="hover:text-zinc-900 transition-colors duration-700">{p}</p>
                ))}
              </div>
            </div>
            
            <div className="space-y-20 pt-20">
              <div className="relative group overflow-hidden rounded-sm aspect-[4/5] bg-zinc-50 border border-zinc-100">
                <Image 
                  src={brandSectionData.imageSrc} 
                  alt="Story" 
                  fill 
                  className="object-cover transition-transform duration-[3s] group-hover:scale-105" 
                />
              </div>
              <div className="flex justify-between items-center border-t border-zinc-200 pt-8">
                <span className="text-[10px] uppercase tracking-widest font-bold">Heritage Series 01</span>
                <Link href="/about" className="p-4 rounded-full border border-zinc-200 hover:bg-zinc-900 hover:text-white transition-all">
                  <Plus size={20} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ================= MINIMAL FOOTER BANNER ================= */}
        <section className="relative h-[50vh] sm:h-[60vh] md:h-[70vh] w-full flex items-center justify-center overflow-hidden mb-12 rounded-sm bg-zinc-50 border border-zinc-100">
           <Image src={featureBanner.imageSrc} alt="Banner" fill className="object-cover opacity-20 grayscale" />
           <div className="relative z-10 text-center space-y-6 sm:space-y-8 md:space-y-12 px-4">
              <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-[8vw] font-black uppercase tracking-tighter text-zinc-900 break-words">
                {featureBanner.title}
              </h2>
              <Link href="/shop" className="px-6 sm:px-10 md:px-12 py-3 sm:py-4 md:py-5 bg-zinc-900 text-white font-bold uppercase tracking-[0.3em] text-[10px] hover:scale-105 hover:bg-orange-600 cursor-pointer transition-transform active:scale-95 whitespace-nowrap inline-block">
                {featureBanner.buttonText}
              </Link>
           </div>
        </section>
      </div>
    </main>
  );
}

interface BentoCardData {
  href: string;
  imageSrc: string;
  title: string;
  subtitle: string;
}

function BentoCard({ data, className }: { data: BentoCardData; className: string }) {
  return (
    <Link href={data.href} className={`bento-item group relative overflow-hidden bg-zinc-100 rounded-sm border border-transparent hover:border-zinc-200 transition-colors ${className}`}>
      <Image 
        src={data.imageSrc} 
        alt={data.title} 
        fill 
        className="object-cover transition-transform duration-[2s] ease-out group-hover:scale-110" 
      />
      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-700" />
      
      {/* Floating Info Overlay */}
      <div className="absolute bottom-0 left-0 w-full p-8 flex justify-between items-end translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 bg-gradient-to-t from-black/80 to-transparent">
         <div>
            <span className="block text-[9px] font-bold uppercase tracking-widest text-orange-600 mb-1">{data.subtitle}</span>
            <h3 className="text-2xl font-black uppercase tracking-tighter text-white">{data.title}</h3>
         </div>
         <div className="w-10 h-10 rounded-full border border-white flex items-center justify-center">
            <MoveUpRight size={14} stroke="white"/>
         </div>
      </div>
    </Link>
  );
}