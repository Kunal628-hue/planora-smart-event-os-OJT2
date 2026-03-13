import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, googleProvider, facebookProvider } from "../../firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";

export default function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSocialLogin = async (providerName) => {
        try {
            setError("");
            setLoading(true);
            const provider = providerName === 'google' ? googleProvider : facebookProvider;
            await signInWithPopup(auth, provider);
            navigate("/dashboard");
        } catch (err) {
            if (err.code === "auth/operation-not-allowed") {
                setError("Social sign-in is not enabled for this provider in your Firebase project. Please enable it in the Firebase Console.");
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
            await signInWithEmailAndPassword(auth, form.email, form.password);
            navigate("/dashboard");
        } catch (err) {
            if (err.code === "auth/operation-not-allowed") {
                setError("Email/Password sign-in is not enabled in your Firebase project. Please enable it in the Firebase Console under Authentication > Sign-in method.");
            } else if (err.code === "auth/invalid-credential") {
                setError("Invalid email or password. If you haven't created an account yet, please sign up first.");
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            {/* Background glow */}
            <div
                style={{
                    position: "absolute",
                    width: 500,
                    height: 500,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)",
                    top: "5%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    filter: "blur(80px)",
                    pointerEvents: "none",
                }}
            />

            <div className="auth-card">
                {/* Logo */}
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "2.5rem" }}>
                    <Link to="/" style={{ display: "block" }}>
                        <img
                            src="/logo-new.svg"
                            alt="Planora Logo"
                            style={{
                                height: "4.5rem",
                                width: "auto",
                                display: "block",
                                filter: "drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3))"
                            }}
                        />
                    </Link>
                </div>

                <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.25rem", color: "var(--text-primary)" }}>Welcome back</h1>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
                    Sign in to your account to continue.
                </p>

                {/* Social Login */}
                <div className="social-group">
                    <button
                        className="social-btn"
                        onClick={() => handleSocialLogin('google')}
                        disabled={loading}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Google
                    </button>
                    <button
                        className="social-btn"
                        onClick={() => handleSocialLogin('facebook')}
                        disabled={loading}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        Facebook
                    </button>
                </div>

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
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.35rem", color: "var(--text-secondary)" }}>
                                Email address
                            </label>
                            <input
                                className="auth-input"
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                autoComplete="email"
                            />
                        </div>

                        <div>
                            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.35rem", color: "var(--text-secondary)" }}>
                                Password
                            </label>
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

                <p style={{ marginTop: "1.25rem", textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    Don't have an account?{" "}
                    <Link to="/signup" style={{ color: "var(--accent-primary)", fontWeight: 600 }}>
                        Sign up free
                    </Link>
                </p>
                <p style={{ marginTop: "0.75rem", textAlign: "center" }}>
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
