import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { animate } from "animejs";
import AuthBackground from "../../components/auth/AuthBackground";
import SocialAuth from "../../components/auth/SocialAuth";

export default function Signup() {
    const navigate = useNavigate();
    const { loginWithGoogle, signupWithEmail } = useAuth();
    const [form, setForm] = useState({ name: "", email: "", password: "" });
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
            console.error("Social Signup Error:", err);
            if (err.code === "auth/operation-not-allowed") {
                setError("Google sign-up is not enabled. Please enable it in the Firebase Console.");
            } else if (err.code === "auth/account-exists-with-different-credential") {
                setError("An account already exists with the same email address but different sign-in credentials. Please try another method.");
            } else if (err.code === "auth/popup-closed-by-user") {
                setError("Sign-up window was closed. Please try again.");
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
        if (!form.name || !form.email || !form.password) {
            setError("Please fill in all fields.");
            return;
        }
        if (form.password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }
        setLoading(true);

        try {
            await signupWithEmail(form.email, form.password, form.name);
            navigate("/dashboard");
        } catch (err) {
            if (err.code === "auth/operation-not-allowed") {
                setError("Email/Password sign-up is not enabled. Please enable it in the Firebase Console.");
            } else if (err.code === "auth/email-already-in-use") {
                setError("This email is already registered. Please sign in instead.");
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

                <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.25rem", color: "#ffffff" }}>Create your account</h1>
                <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", marginBottom: "1.5rem" }}>
                    Start your 14-day free trial. No credit card required.
                </p>

                {/* Social Auth Components */}
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
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div style={{ gridColumn: "span 2" }}>
                            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.35rem", color: "rgba(255,255,255,0.5)" }}>
                                Full name
                            </label>
                            <input
                                className="auth-input"
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Jane Doe"
                                autoComplete="name"
                            />
                        </div>

                        <div>
                            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.35rem", color: "rgba(255,255,255,0.5)" }}>
                                Work email
                            </label>
                            <input
                                className="auth-input"
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="you@company.com"
                                autoComplete="email"
                            />
                        </div>

                        <div>
                            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.35rem", color: "rgba(255,255,255,0.5)" }}>
                                Password
                            </label>
                            <input
                                className="auth-input"
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Min. 8 characters"
                                autoComplete="new-password"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: "100%", justifyContent: "center", marginTop: "0.25rem", padding: "0.7rem" }}
                        disabled={loading}
                    >
                        {loading ? "Creating account…" : (
                            <>
                                Create Account
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                    <polyline points="12 5 19 12 12 19" />
                                </svg>
                            </>
                        )}
                    </button>
                </form>

                <p
                    style={{
                        marginTop: "1rem",
                        fontSize: "0.75rem",
                        color: "var(--text-muted)",
                        textAlign: "center",
                        lineHeight: 1.5,
                    }}
                >
                    By signing up you agree to our{" "}
                    <span style={{ color: "var(--accent-primary)", fontWeight: 600 }}>Terms</span> and{" "}
                    <span style={{ color: "var(--accent-primary)", fontWeight: 600 }}>Privacy</span>.
                </p>

                <p style={{ marginTop: "1rem", textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    Already have an account?{" "}
                    <Link to="/login" style={{ color: "var(--accent-primary)", fontWeight: 600 }}>
                        Sign in
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
