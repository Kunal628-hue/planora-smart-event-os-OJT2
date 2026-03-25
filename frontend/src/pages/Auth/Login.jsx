import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { animate } from "animejs";
import AuthBackground from "../../components/auth/AuthBackground";
import SocialAuth from "../../components/auth/SocialAuth";

export default function Login() {
    const navigate = useNavigate();
    const { loginWithGoogle, loginWithEmail } = useAuth();
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const cardRef = useRef(null);

    useEffect(() => {
        if (!cardRef.current) return;
        animate(cardRef.current, {
            opacity: [0, 1],
            translateY: [30, 0],
            duration: 1000,
            easing: "outExpo",
        });
    }, []);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSocialLogin = async () => {
        try {
            setError("");
            setLoading(true);
            await loginWithGoogle();
            navigate("/dashboard");
        } catch (err) {
            console.error("Social Login Error:", err);
            if (err.code === "auth/operation-not-allowed") {
                setError("Google sign-in is not enabled. Please enable it in the Firebase Console.");
            } else if (err.code === "auth/account-exists-with-different-credential") {
                setError("An account already exists with the same email address but different sign-in credentials. Please try another method.");
            } else if (err.code === "auth/popup-closed-by-user") {
                setError("Sign-in window was closed. Please try again.");
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!form.email || !form.password) {
            setError("Please fill in all fields.");
            return;
        }
        setLoading(true);

        try {
            await loginWithEmail(form.email, form.password);
            navigate("/dashboard");
        } catch (err) {
            if (err.code === "auth/operation-not-allowed") {
                setError("Email/Password sign-in is not enabled. Please enable it in the Firebase Console.");
            } else if (err.code === "auth/invalid-credential") {
                setError("Invalid email or password.");
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page" style={{ position: "relative" }}>
            <AuthBackground />

            <div className="auth-card" ref={cardRef} style={{ opacity: 0, zIndex: 2 }}>
                {/* Logo */}
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "2rem" }}>
                    <Link to="/" style={{ display: "block" }}>
                        <img
                            src="/logo-new.svg"
                            alt="Planora Logo"
                            style={{
                                height: "4rem",
                                width: "auto",
                                display: "block",
                                filter: "drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3))"
                            }}
                        />
                    </Link>
                </div>

                <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.25rem", color: "#ffffff", textAlign: 'center' }}>Welcome back</h1>
                <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.5)", marginBottom: "1.5rem", textAlign: 'center' }}>
                    Sign in to your account to continue.
                </p>

                {/* Social Login */}
                <SocialAuth onLogin={handleSocialLogin} loading={loading} />

                <div className="social-divider">Or continue with</div>

                {error && (
                    <div
                        style={{
                            background: "#fff1f2",
                            border: "1px solid #fecaca",
                            borderRadius: "0.5rem",
                            padding: "0.6rem 1rem",
                            fontSize: "0.85rem",
                            color: "#b91c1c",
                            marginBottom: "1rem",
                        }}
                    >
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.5rem", color: "rgba(255,255,255,0.7)" }}>
                                Email address
                            </label>
                            <input
                                className="auth-input"
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="name@example.com"
                                autoComplete="email"
                            />
                        </div>

                        <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                                <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>
                                    Password
                                </label>
                            </div>
                            <input
                                className="auth-input"
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                autoComplete="current-password"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: "100%", justifyContent: "center", marginTop: "0.25rem", padding: "0.7rem" }}
                        disabled={loading}
                    >
                        {loading ? "Signing in…" : (
                            <>
                                Sign In
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                    <polyline points="12 5 19 12 12 19" />
                                </svg>
                            </>
                        )}
                    </button>
                </form>

                <p style={{ marginTop: "1rem", textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    Don't have an account?{" "}
                    <Link to="/signup" style={{ color: "var(--accent-primary)", fontWeight: 600 }}>
                        Sign up free
                    </Link>
                </p>
                <p style={{ marginTop: "0.5rem", textAlign: "center" }}>
                    <Link to="/" style={{
                        fontSize: "0.8rem",
                        color: "var(--text-muted)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        transition: "color 0.2s"
                    }} onMouseEnter={e => e.currentTarget.style.color = "var(--text-secondary)"} onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12" />
                            <polyline points="12 19 5 12 12 5" />
                        </svg>
                        Back to Planora.io
                    </Link>
                </p>
            </div>
        </div>
    );
}
