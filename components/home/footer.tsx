"use client";

import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { footerData } from "@/constants";

export default function PremiumFooter() {
  const isExternal = (href: string) =>
    href.startsWith("http") || href.startsWith("mailto") || href.startsWith("tel");

  return (
    <footer className="bg-[#0a0a0a] text-white border-t border-white/5">
      <div className="w-full px-4 sm:px-6 lg:px-12 pt-12 sm:pt-16 md:pt-24 pb-8 sm:pb-10 md:pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-12 md:gap-16 mb-12 sm:mb-16 md:mb-24">

          {/* Brand Identity */}
          <div className="lg:col-span-5 space-y-8">
            <div className="footer-item">
              <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">
                {footerData.brand.name}
                <span className={footerData.brand.dotColor}>.</span>
              </h2>
              <p className="text-[10px] uppercase tracking-[0.5em] text-zinc-500 font-bold">
                {footerData.brand.tagline}
              </p>
            </div>

            <p className="footer-item text-zinc-400 font-light leading-relaxed w-full">
              {footerData.brand.description}
            </p>
          </div>

          {/* Dynamic Sections */}
          {footerData.sections.map((section) => (
            <div
              key={section.title}
              className={
                section.title === footerData.sections[0].title
                  ? "lg:col-span-4 space-y-8"
                  : "lg:col-span-3 space-y-8"
              }
            >
              <h4 className="footer-item text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-500">
                {section.title}
              </h4>

              <div className="space-y-6">
                {/* Standard Items */}
                {section.items?.map((item) =>
                  isExternal(item.href) ? (
                    <a
                      key={item.text}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="footer-item flex gap-4 group items-center"
                    >
                      <item.icon size={18} className="text-red-600 shrink-0" />
                      <span className="text-zinc-400 group-hover:text-white transition-colors duration-300 font-light">
                        {item.text}
                      </span>
                    </a>
                  ) : (
                    <Link
                      key={item.text}
                      href={item.href}
                      className="footer-item flex gap-4 group items-center"
                    >
                      <item.icon size={18} className="text-red-600 shrink-0" />
                      <span className="text-zinc-400 group-hover:text-white transition-colors duration-300 font-light">
                        {item.text}
                      </span>
                    </Link>
                  )
                )}

                {/* Eminence Numbers */}
                {section.numbers?.map((num) => (
                  <Link
                    key={num.label}
                    href={num.href}
                    className="footer-item block text-xl font-bold tracking-tight hover:text-red-600 transition-colors"
                  >
                    {num.label}
                  </Link>
                ))}

                {/* Social Icons */}
                {section.socials && (
                  <div className="footer-item flex gap-6 pt-4">
                    {section.socials.map((soc) =>
                      isExternal(soc.href) ? (
                        <a
                          key={soc.href}
                          href={soc.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-red-600 transition-colors"
                        >
                          <soc.icon size={20} />
                        </a>
                      ) : (
                        <Link
                          key={soc.href}
                          href={soc.href}
                          className="hover:text-red-600 transition-colors"
                        >
                          <soc.icon size={20} />
                        </Link>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-8 sm:pt-10 md:pt-12 flex flex-col md:flex-row md:row-reverse justify-between items-center gap-6 sm:gap-8">
          <div className="footer-item flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">
            {footerData.bottomBar.links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="hover:text-white transition-colors whitespace-nowrap"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <p className="footer-item text-[10px] uppercase tracking-widest text-zinc-600 text-center md:text-left">
            {footerData.bottomBar.copyright}
          </p>

          <button
            aria-label="Scroll to top"
            onClick={() =>
              window.scrollTo({ top: 0, behavior: "smooth" })
            }
            className="footer-item w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all duration-500 shrink-0"
          >
            <ArrowUp size={16} />
          </button>
        </div>
      </div>
    </footer>
  );
}
