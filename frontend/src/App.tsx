import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

import ProtectedRoute from "@/components/ProtectedRoute";

import Index from "./pages/Index";
import Services from "./pages/Services";
import MyBookings from "./pages/MyBookings";
import MechanicDashboard from "./pages/MechanicDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Settings from "./pages/Settings";
import FAQHelpCenter from "./pages/FAQHelpCenter";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token && role === "technician" && location.pathname !== "/mechanic") {
      navigate("/mechanic", { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <Routes>
          {/* 🌐 PUBLIC ROUTES */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* 🌐 PUBLIC - Anyone can view, but must login to book */}
          <Route path="/services" element={<Services />} />

          {/* 👤 CUSTOMER ONLY */}
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <MyBookings />
              </ProtectedRoute>
            }
          />

          {/* 🔧 TECHNICIAN ONLY */}
          <Route
            path="/mechanic"
            element={
              <ProtectedRoute allowedRoles={["technician"]}>
                <MechanicDashboard />
              </ProtectedRoute>
            }
          />

          {/* 🛡️ ADMIN ONLY */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* ⚙️ CUSTOMERS AND ADMINS ONLY */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute allowedRoles={["customer", "admin"]}>
                <Settings />
              </ProtectedRoute>
            }
          />

          {/* 💬 PUBLIC - FAQ & Help Center */}
          <Route path="/faq-help" element={<FAQHelpCenter />} />

          {/* ❌ 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
