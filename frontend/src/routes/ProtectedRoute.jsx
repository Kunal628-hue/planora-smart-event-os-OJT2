import { Navigate } from "react-router-dom";

/**
 * Protects routes that require authentication.
 * Redirects to /login if no token found in localStorage.
 */
export default function ProtectedRoute({ children }) {
    const token = localStorage.getItem("planora_token");
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return children;
}
