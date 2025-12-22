import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ContactCarePage from "@/components/contact/contact";
import React from "react";

function page() {
  return (
    <ProtectedRoute>
      <ContactCarePage />
    </ProtectedRoute>
  );
}

export default page;
