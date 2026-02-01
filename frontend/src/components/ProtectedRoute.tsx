import { Navigate } from "react-router-dom";
import { useEffect } from "react";

interface ProtectedRouteProps {
    children: JSX.Element;
    allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    useEffect(() => {
        // Prevent history manipulation for protected routes
        if (allowedRoles && allowedRoles.includes(role || "")) {
            // Push new state to prevent back navigation
            window.history.pushState(null, "", window.location.href);
        }
    }, [role, allowedRoles]);

    // ❌ Not logged in
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // ❌ Logged in but wrong role
    if (allowedRoles && !allowedRoles.includes(role || "")) {
        // Role-specific redirects
        if (role === "technician") {
            return <Navigate to="/mechanic" replace />;
        } else if (role === "admin") {
            return <Navigate to="/admin" replace />;
        } else if (role === "customer") {
            return <Navigate to="/my-bookings" replace />;
        } else {
            return <Navigate to="/services" replace />;
        }
    }

    // ✅ Allowed
    return children;
};

export default ProtectedRoute;
