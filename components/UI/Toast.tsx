"use client";

import { useEffect, useState, useRef } from "react";
import { CheckCircle, X } from "lucide-react";

interface Toast {
  id: string;
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

let toastListeners: ((toasts: Toast[]) => void)[] = [];
let toasts: Toast[] = [];

function notify() {
  toastListeners.forEach((listener) => listener([...toasts]));
}

export function showToast(
  message: string,
  type: "success" | "error" | "info" = "success",
  duration: number = 3000
) {
  const id = Math.random().toString(36).substring(7);
  const toast: Toast = { id, message, type, duration };
  toasts = [...toasts, toast];
  notify();

  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    notify();
  }, duration);
}

export function ToastContainer() {
  const [toastList, setToastList] = useState<Toast[]>([]);
  const listenerRef = useRef<((toasts: Toast[]) => void) | null>(null);

  useEffect(() => {
    // Create listener function
    const listener = (newToasts: Toast[]) => {
      setToastList(newToasts);
    };
    
    // Store reference to listener
    listenerRef.current = listener;
    
    // Clear any existing listeners to prevent duplicates
    // This ensures only the latest container instance is active
    // (handles React Strict Mode double-mounting in development)
    toastListeners = [];
    
    // Add this listener
    toastListeners.push(listener);
    
    // Initialize with current toasts
    listener([...toasts]);
    
    return () => {
      // Remove listener on cleanup
      if (listenerRef.current) {
        toastListeners = toastListeners.filter((l) => l !== listenerRef.current);
        listenerRef.current = null;
      }
    };
  }, []);

  if (toastList.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 pointer-events-none">
      {toastList.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

function ToastItem({ toast }: { toast: Toast }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  const bgColor =
    toast.type === "success"
      ? "bg-green-50 border-green-200"
      : toast.type === "error"
      ? "bg-red-50 border-red-200"
      : "bg-blue-50 border-blue-200";

  const textColor =
    toast.type === "success"
      ? "text-green-800"
      : toast.type === "error"
      ? "text-red-800"
      : "text-blue-800";

  const iconColor =
    toast.type === "success"
      ? "text-green-600"
      : toast.type === "error"
      ? "text-red-600"
      : "text-blue-600";

  return (
    <div
      className={`
        ${bgColor} border rounded-lg shadow-lg p-4 min-w-[300px] max-w-md
        pointer-events-auto
        transform transition-all duration-300 ease-out
        ${isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
      `}
    >
      <div className="flex items-start gap-3">
        {toast.type === "success" && (
          <CheckCircle className={`${iconColor} shrink-0 mt-0.5`} size={20} />
        )}
        <p className={`${textColor} text-sm font-medium flex-1`}>
          {toast.message}
        </p>
        <button
          onClick={() => {
            toasts = toasts.filter((t) => t.id !== toast.id);
            notify();
          }}
          className={`${textColor} hover:opacity-70 transition-opacity shrink-0`}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

