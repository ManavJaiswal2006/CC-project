// Razorpay utility functions

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const loadRazorpayScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay script"));
    document.body.appendChild(script);
  });
};

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  handler: (response: RazorpayResponse) => void;
  modal: {
    ondismiss: () => void;
  };
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export const openRazorpay = (options: RazorpayOptions) => {
  if (!window.Razorpay) {
    throw new Error("Razorpay script not loaded");
  }

  // Razorpay options with theme to ensure proper visibility
  const razorpayOptions: any = {
    ...options,
    theme: {
      color: "#000000",
    },
  };

  const razorpay = new window.Razorpay(razorpayOptions);
  
  // Inject styles to fix text visibility in Razorpay modal
  // Note: Razorpay loads in an iframe, but we can still inject styles
  // that may affect the parent page styling that could interfere
  const injectRazorpayStyles = () => {
    const styleId = "razorpay-fix-styles";
    if (document.getElementById(styleId)) return;
    
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      /* Prevent our global styles from affecting Razorpay iframe content */
      iframe[src*="razorpay"],
      iframe[id*="razorpay"] {
        color-scheme: light;
      }
    `;
    document.head.appendChild(style);
  };

  injectRazorpayStyles();
  
  razorpay.open();
  return razorpay;
};

