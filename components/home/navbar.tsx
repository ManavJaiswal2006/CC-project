"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { Search, ShoppingCart, User, Menu, X, LogIn } from "lucide-react";
import { navlinks } from "@/constants/home";
import { logoImg } from "@/constants";
import SearchModal from "./search";

// --- FIREBASE IMPORTS ---
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/app/lib/firebase";

gsap.registerPlugin(useGSAP);

const navLinks = navlinks;

const Navbar = () => {
  // --- STATE ---
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true); // Prevents flicker
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- REFS ---
  const containerRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const pathname = usePathname();

  // --- 1. FIREBASE AUTH LISTENER (The Fix) ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- 2. GSAP ANIMATION SETUP ---
  useGSAP(
    () => {
      tl.current = gsap
        .timeline({ paused: true })
        .to(mobileMenuRef.current, {
          height: "auto",
          duration: 0.3,
          ease: "power2.inOut",
        })
        .fromTo(
          ".mobile-link-item",
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.2,
            stagger: 0.05,
            ease: "power1.out",
          },
          "-=0.1"
        );
    },
    { scope: containerRef }
  );

  // --- 3. HANDLE MENU TOGGLE ---
  useGSAP(
    () => {
      if (tl.current) {
        if (isMobileMenuOpen) {
          tl.current.play();
          document.body.style.overflow = "hidden";
        } else {
          tl.current.reverse();
          document.body.style.overflow = "auto";
        }
      }
    },
    { dependencies: [isMobileMenuOpen] }
  );

  const toggleMenu = () => setIsMobileMenuOpen((prev) => !prev);

  return (
    <header
      ref={containerRef}
      className="sticky top-0 z-50 w-full bg-[#eeeaeae0] backdrop-blur-sm font-sans border-b border-gray-200"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between py-4 relative">
          
          {/* Mobile Toggle Button */}
          <div className="flex md:hidden z-20">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-orange-600 transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Logo Centered */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Link href="/" className="flex flex-col items-center">
              <Image
                src={logoImg}
                alt="Bourgon Logo"
                width={180}
                height={60}
                className="h-auto md:pt-5 w-24 md:w-48 object-contain"
                priority
              />
            </Link>
          </div>

          {/* Right Icons Section */}
          <div className="flex items-center space-x-4 sm:space-x-6 text-gray-700 z-20 ml-auto">
            <SearchModal />

            {/* --- AUTH LOGIC START --- */}
            {loading ? (
               // Optional: Placeholder while checking login status
               <div className="w-6 h-6 bg-gray-300 rounded-full animate-pulse hidden sm:block" />
            ) : user ? (
              // OPTION A: User is logged in -> Show Account Icon
              <Link
                href="/account"
                className="hover:text-orange-600 transition-colors hidden sm:block cursor-pointer"
                title="Account"
              >
                <User size={22} strokeWidth={1.5} />
              </Link>
            ) : (
              // OPTION B: User is NOT logged in -> Show Login Button
              <Link
                href="/login"
                className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md text-xs font-bold tracking-wider hover:bg-orange-600 transition-all uppercase"
              >
                <LogIn size={14} /> 
                <span className="hidden sm:inline">Login</span>
              </Link>
            )}
            {/* --- AUTH LOGIC END --- */}

            <Link
              href="/cart"
              className="hover:text-orange-600 transition-colors cursor-pointer"
            >
              <ShoppingCart size={22} strokeWidth={1.5} />
            </Link>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex justify-center pb-4 pt-2">
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] font-semibold tracking-wider text-gray-700 uppercase">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.name} className="group relative">
                  <Link
                    href={link.href}
                    className={`py-2 transition-colors hover:text-gray-900 block ${
                      isActive ? "text-orange-600" : ""
                    }`}
                  >
                    {link.name}
                    <span
                      className={`absolute bottom-0 left-0 h-0.5 bg-orange-600 transition-all duration-300 ease-out group-hover:w-full ${
                        isActive ? "w-full" : "w-0"
                      }`}
                    ></span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* --- Mobile Menu Overlay --- */}
      <div
        ref={mobileMenuRef}
        className="h-0 overflow-hidden bg-[#eeeaeae0] md:hidden shadow-inner"
      >
        <nav className="px-4 pt-4 pb-6 space-y-4 flex flex-col items-center">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`mobile-link-item block text-sm font-bold tracking-widest uppercase text-gray-700 hover:text-orange-600 py-2 ${
                  isActive ? "text-orange-600" : ""
                }`}
              >
                {link.name}
              </Link>
            );
          })}

          {/* Mobile Auth Links */}
          <div className="mobile-link-item pt-4 border-t border-gray-300 w-full flex justify-center space-x-8 sm:hidden text-gray-600">
            {user ? (
               // Mobile: Show Account
              <Link
                href="/account"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 hover:text-orange-600"
              >
                <User size={18} /> Account
              </Link>
            ) : (
               // Mobile: Show Login
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 text-black hover:text-orange-600 font-bold uppercase tracking-widest text-xs"
              >
                <LogIn size={18} /> Login
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;