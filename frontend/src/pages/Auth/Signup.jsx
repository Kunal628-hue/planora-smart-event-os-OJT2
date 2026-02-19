import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Signup() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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
        await new Promise((r) => setTimeout(r, 900));
        localStorage.setItem("planora_token", "demo_token_" + Date.now());
        setLoading(false);
        navigate("/dashboard");
    };

    return (
        <div className="auth-page">
            <div
                style={{
                    position: "absolute",
                    width: 500,
                    height: 500,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)",
                    top: "5%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    filter: "blur(80px)",
                    pointerEvents: "none",
                }}
            />

            <div className="auth-card">
                {/* Logo */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "2rem" }}>
                    <div
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: "10px",
                            background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 800,
                            fontSize: "1rem",
                            color: "#fff",
                            boxShadow: "0 0 18px rgba(139,92,246,0.4)",
                        }}
                    >
                        P
                    </div>
                    <span style={{ fontFamily: "Outfit,sans-serif", fontWeight: 700, fontSize: "1.15rem" }}>Planora</span>
                </div>

                <h1 style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: "0.4rem" }}>Create your account</h1>
                <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "2rem" }}>
                    Start your 14-day free trial. No credit card required.
                </p>

                {error && (
                    <div
                        style={{
                            background: "rgba(239,68,68,0.1)",
                            border: "1px solid rgba(239,68,68,0.3)",
                            borderRadius: "0.5rem",
                            padding: "0.75rem 1rem",
                            fontSize: "0.85rem",
                            color: "#fca5a5",
                            marginBottom: "1.25rem",
                        }}
                    >
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
                    <div>
                        <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "0.4rem", color: "var(--text-secondary)" }}>
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
                        <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "0.4rem", color: "var(--text-secondary)" }}>
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
                        <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "0.4rem", color: "var(--text-secondary)" }}>
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

                    <button
                        type="submit"
                        className="btn-primary"
                        style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem" }}
                        disabled={loading}
                    >
                        {loading ? "Creating account…" : "Create Account →"}
                    </button>
                </form>

                <p
                    style={{
                        marginTop: "1.25rem",
                        fontSize: "0.75rem",
                        color: "var(--text-muted)",
                        textAlign: "center",
                        lineHeight: 1.6,
                    }}
                >
                    By signing up you agree to our{" "}
                    <span style={{ color: "#a78bfa" }}>Terms of Service</span> and{" "}
                    <span style={{ color: "#a78bfa" }}>Privacy Policy</span>.
                </p>

                <p style={{ marginTop: "1.25rem", textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    Already have an account?{" "}
                    <Link to="/login" style={{ color: "#a78bfa", fontWeight: 600 }}>
                        Sign in
                    </Link>
                </p>
                <p style={{ marginTop: "0.6rem", textAlign: "center" }}>
                    <Link to="/" style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        ← Back to Planora.io
                    </Link>
                </p>
            </div>
        </div>
    );
}
