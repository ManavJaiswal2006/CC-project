"use client";

import React, { useState, useRef, useEffect, memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ShoppingCart, User, Menu, X, LogIn, Heart, Briefcase } from "lucide-react";
import { navlinks } from "@/constants/home";
import { logoImg } from "@/constants";
// import SearchModal from "./search";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/app/lib/firebase";
import { useCart } from "@/app/context/CartContext";
import { useProfessionalMode } from "@/app/context/ProfessionalModeContext";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

gsap.registerPlugin(useGSAP);

const navLinks = navlinks;

/* ----------------------------------------
   Memoized Sub Components
---------------------------------------- */

const CartIcon = memo(({ count }: { count: number }) => (
  <Link
    href="/cart"
    className="hover:text-orange-600 transition-colors cursor-pointer relative group"
    aria-label="Cart"
  >
    <ShoppingCart size={22} strokeWidth={1.5} />
    {count > 0 && (
      <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-[#eeeaeae0]">
        {count}
      </span>
    )}
  </Link>
));
CartIcon.displayName = "CartIcon";

const WishlistIcon = memo(({ user }: { user: FirebaseUser | null }) => {
  if (!user) return null;
  return (
    <Link
      href="/wishlist"
      className="hover:text-orange-600 transition-colors cursor-pointer"
      aria-label="Wishlist"
      title="Wishlist"
    >
      <Heart size={22} strokeWidth={1.5} />
    </Link>
  );
});
WishlistIcon.displayName = "WishlistIcon";

const AuthButton = memo(
  ({ user, loading }: { user: FirebaseUser | null; loading: boolean }) => {
    if (loading) {
      return (
        <div className="w-6 h-6 bg-gray-300 rounded-full animate-pulse hidden sm:block" />
      );
    }

    if (user) {
      return (
        <Link
          href="/account"
          className="hover:text-orange-600 transition-colors"
          title="Account"
          aria-label="My Account"
        >
          <User size={22} strokeWidth={1.5} />
        </Link>
      );
    }

    return (
      <Link
        href="/login"
        className="flex items-center gap-1 sm:gap-2 bg-black text-white px-2 sm:px-4 py-2 rounded-md text-xs font-bold tracking-wider hover:bg-orange-600 transition-all uppercase whitespace-nowrap"
      >
        <LogIn size={14} className="shrink-0" />
        <span className="hidden sm:inline">Login</span>
      </Link>
    );
  }
);
AuthButton.displayName = "AuthButton";

const ProfessionalModeToggle = memo(({ userId }: { userId: string | null }) => {
  const { isProfessionalMode, toggleProfessionalMode } = useProfessionalMode();
  const userData = useQuery(
    api.user.getUser,
    userId ? { userId } : "skip"
  );

  // Only show toggle if user is a distributor
  const isDistributor =
    userData?.role === "distributor" || userData?.category === "distributor";

  if (!isDistributor) return null;

  return (
    <button
      onClick={toggleProfessionalMode}
      className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-bold tracking-wider transition-all uppercase whitespace-nowrap ${
        isProfessionalMode
          ? "bg-red-600 text-white hover:bg-red-700"
          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
      }`}
      title={isProfessionalMode ? "Switch to Retail Mode" : "Switch to Professional Mode"}
      aria-label={isProfessionalMode ? "Switch to Retail Mode" : "Switch to Professional Mode"}
    >
      <Briefcase size={14} className="shrink-0" />
      <span className="hidden sm:inline">
        {isProfessionalMode ? "Professional" : "Retail"}
      </span>
    </button>
  );
});
ProfessionalModeToggle.displayName = "ProfessionalModeToggle";

/* ----------------------------------------
   Navbar Component
---------------------------------------- */

const Navbar = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { cartCount } = useCart();
  const pathname = usePathname();
  const userId = user?.uid ?? null;

  const containerRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);

  /* ----------------------------------------
     Firebase Auth Listener (UI only)
  ---------------------------------------- */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /* ----------------------------------------
     GSAP Timeline (created once)
  ---------------------------------------- */
  useGSAP(
    () => {
      if (tl.current) return;

      tl.current = gsap
        .timeline({ paused: true })
        .to(mobileMenuRef.current, {
          maxHeight: 500,
          duration: 0.35,
          ease: "power2.inOut",
        })
        .fromTo(
          ".mobile-link-item",
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.25,
            stagger: 0.06,
            ease: "power1.out",
          },
          "-=0.15"
        );
    },
    { scope: containerRef }
  );

  /* ----------------------------------------
     Mobile Menu Open / Close
  ---------------------------------------- */
  useEffect(() => {
    if (!tl.current) return;

    if (isMobileMenuOpen) {
      tl.current.play();
      document.body.style.overflow = "hidden";
    } else {
      tl.current.reverse();
      document.body.style.overflow = "auto";
    }
  }, [isMobileMenuOpen]);

  /* Cleanup scroll lock on unmount */
  useEffect(() => {
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const toggleMenu = () => setIsMobileMenuOpen((prev) => !prev);

  /* ----------------------------------------
     JSX
  ---------------------------------------- */
  return (
    <header
      ref={containerRef}
      className="sticky top-0 z-50 w-full bg-[#eeeaeae0] backdrop-blur-sm font-sans border-b border-gray-200"
    >
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between py-4 relative">
          {/* Mobile Toggle */}
          <div className="flex md:hidden z-20">
            <button
              onClick={toggleMenu}
              aria-label="Toggle navigation"
              aria-expanded={isMobileMenuOpen}
              className="text-gray-700 hover:text-orange-600 transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Logo */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 sm:w-32 md:w-48">
            <Link href="/" className="flex flex-col items-center">
              <Image
                src={logoImg}
                alt="Bourgon Logo"
                width={180}
                height={60}
                priority
                className="h-auto w-full object-contain"
              />
            </Link>
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 lg:space-x-6 text-gray-700 z-20 ml-auto">
            {/* <SearchModal /> */}
            <WishlistIcon user={user} />
            <ProfessionalModeToggle userId={userId} />
            <AuthButton user={user} loading={loading} />
            <CartIcon count={cartCount} />
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex justify-center pt-2 pb-2">
          <ul className="flex flex-wrap items-center justify-center gap-x-4 lg:gap-x-6 gap-y-2 text-[11px] font-semibold tracking-wider text-gray-700 uppercase">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.name} className="group relative text-sm">
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
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Mobile Menu */}
      <div
        ref={mobileMenuRef}
        className="max-h-0 overflow-hidden bg-[#eeeaeae0] md:hidden shadow-inner"
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
          
          {/* Account/Login in Mobile Menu */}
          <div className="mobile-link-item w-full border-t border-gray-300 pt-4 mt-2">
            {user ? (
              <Link
                href="/account"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block text-sm font-bold tracking-widest uppercase text-gray-700 hover:text-orange-600 py-2 ${
                  pathname === "/account" ? "text-orange-600" : ""
                }`}
              >
                My Account
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block text-sm font-bold tracking-widest uppercase text-gray-700 hover:text-orange-600 py-2 ${
                  pathname === "/login" ? "text-orange-600" : ""
                }`}
              >
                Login
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
