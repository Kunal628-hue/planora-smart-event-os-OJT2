import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogoLoader } from "../components/ui/Loader";

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return <LogoLoader text="Authenticating..." />;
    }

    if (!user) {
        // Detailed Diagnostic Log for Debugging
        console.warn(`[Security Analysis] Unauthorized Access Blocked. State: { Auth: false, Loading: ${loading} }`);
        return <Navigate to="/login" replace />;
    }

    return children;
}
