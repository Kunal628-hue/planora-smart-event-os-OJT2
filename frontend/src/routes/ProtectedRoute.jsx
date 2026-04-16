import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
    const { user, loading, isOtpVerified } = useAuth();

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "var(--bg-base)" }}>
                <div style={{ width: "40px", height: "40px", border: "4px solid var(--accent-primary)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
            </div>
        );
    }

    if (!user || !isOtpVerified) {
        // Detailed Diagnostic Log for Debugging
        console.warn(`[Security Analysis] Unauthorized Access Blocked. State: { Auth: ${!!user}, Verified: ${isOtpVerified}, Loading: ${loading} }`);
        return <Navigate to="/login" replace />;
    }

    return children;
}
