"use client";

import { AnimatePresence, motion } from "framer-motion";
import React, { ReactNode, createContext, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ModalContextType { open: boolean; setOpen: (open: boolean) => void; }
const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  return <ModalContext.Provider value={{ open, setOpen }}>{children}</ModalContext.Provider>;
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) throw new Error("useModal must be used within a ModalProvider");
  return context;
};

export function Modal({ children }: { children: ReactNode }) { return <ModalProvider>{children}</ModalProvider>; }

export const ModalTrigger = ({ children, className = "", keyboardShortcut = false }: any) => {
  const { setOpen } = useModal();
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (keyboardShortcut && (e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setOpen(true); }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [keyboardShortcut, setOpen]);
  return <button onClick={() => setOpen(true)} className={className}>{children}</button>;
};

export const ModalBody = ({ children, className = "" }: { children: ReactNode; className?: string }) => {
  const { open, setOpen } = useModal();
  const modalRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = open ? "hidden" : "auto";
  }, [open]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 flex items-center justify-center z-[999]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-white/80" // White themed backdrop
          />

          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className={`relative w-full max-w-3xl bg-white border border-zinc-200 shadow-xl overflow-hidden mx-4 ${className}`}
          >
            <div className="absolute top-0 left-0 w-full h-[3px] bg-red-600" />
            <button onClick={() => setOpen(false)} className="absolute top-6 right-6 text-zinc-300 hover:text-red-600 transition-colors">
              <X size={18} />
            </button>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export const ModalContent = ({ children, className = "" }: any) => (
  <div className={`p-8 ${className}`}>{children}</div>
);