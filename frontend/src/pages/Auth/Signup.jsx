import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AuthBackground from "../../components/auth/AuthBackground";
import SocialAuth from "../../components/auth/SocialAuth";

export default function Signup() {
    const navigate = useNavigate();
    const { loginWithGoogle, signupWithEmail } = useAuth();
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSocialLogin = async (provider = 'google') => {
        if (provider !== 'google') {
            setError(`${provider.charAt(0).toUpperCase() + provider.slice(1)} login is coming soon!`);
            return;
        }
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
        <div className="auth-page-new">
            <AuthBackground />
            
            <div className="auth-card-new">
                {/* Switcher */}
                <div className="auth-switcher">
                    <Link to="/login" className="switcher-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3" />
                        </svg>
                        Login
                    </Link>
                    <button className="switcher-btn active">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="8.5" cy="7" r="4" />
                            <line x1="20" y1="8" x2="20" y2="14" />
                            <line x1="23" y1="11" x2="17" y2="11" />
                        </svg>
                        Sign Up
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    <div>
                        <label className="auth-label-new">Full name</label>
                        <input
                            className="auth-input-new"
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Jane Doe"
                        />
                    </div>

                    <div>
                        <label className="auth-label-new">Work email</label>
                        <input
                            className="auth-input-new"
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="name@company.com"
                        />
                    </div>

                    <div>
                        <label className="auth-label-new">Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                className="auth-input-new"
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Min. 8 characters"
                            />
                            <svg 
                                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', cursor: 'pointer' }}
                                width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            >
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                        </div>
                    </div>

                    {error && (
                        <div className="auth-error-new">{error}</div>
                    )}

                    <button type="submit" className="auth-submit-btn" disabled={loading}>
                        {loading ? "Creating account..." : "Create Account"}
                    </button>
                </form>

                <p style={{ marginTop: "1.25rem", fontSize: "0.75rem", color: "#6b7280", textAlign: "center", lineHeight: 1.5 }}>
                    By signing up you agree to our <span style={{ color: "#111827", fontWeight: 600 }}>Terms</span> and <span style={{ color: "#111827", fontWeight: 600 }}>Privacy</span>.
                </p>

                <div className="auth-divider-new">
                    <span>OR</span>
                </div>

                <SocialAuth onLogin={handleSocialLogin} loading={loading} />

                <div className="auth-footer-new">
                    <Link to="/" style={{ color: '#6b7280', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5M12 19l-7-7 7-7"/>
                        </svg>
                        Back to Planora
                    </Link>
                </div>
            </div>

            <style>{`
                .auth-page-new {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    padding: 1.5rem;
                    overflow: hidden;
                }
                .auth-card-new {
                    background: #ffffff;
                    border: 1px solid #e5e7eb;
                    border-radius: 2rem;
                    padding: 2.5rem;
                    width: 100%;
                    max-width: 440px;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
                    z-index: 1;
                }
                .auth-switcher {
                    display: flex;
                    background: #f9fafb;
                    padding: 4px;
                    border-radius: 0.75rem;
                    margin-bottom: 2rem;
                }
                .switcher-btn {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 8px;
                    border-radius: 0.6rem;
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: #6b7280;
                    transition: all 0.2s;
                    text-decoration: none;
                }
                .switcher-btn.active {
                    background: #ffffff;
                    color: #111827;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }
                .auth-label-new {
                    display: block;
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: #374151;
                    margin-bottom: 0.5rem;
                }
                .auth-input-new {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    background: #fff;
                    border: 1px solid #d1d5db;
                    border-radius: 0.75rem;
                    font-size: 1rem;
                    color: #111827;
                    transition: border-color 0.2s;
                }
                .auth-input-new:focus {
                    border-color: #111827;
                    outline: none;
                }
                .auth-submit-btn {
                    width: 100%;
                    padding: 0.85rem;
                    background: #1f2937;
                    color: #ffffff;
                    border-radius: 0.75rem;
                    font-size: 1rem;
                    font-weight: 700;
                    transition: background 0.2s;
                    margin-top: 0.5rem;
                }
                .auth-submit-btn:hover {
                    background: #111827;
                }
                .auth-divider-new {
                    position: relative;
                    text-align: center;
                    margin: 1.75rem 0;
                }
                .auth-divider-new::before {
                    content: "";
                    position: absolute;
                    top: 50%;
                    left: 0;
                    right: 0;
                    height: 1px;
                    background: #e5e7eb;
                }
                .auth-divider-new span {
                    position: relative;
                    background: #fff;
                    padding: 0 1rem;
                    color: #9ca3af;
                    font-size: 0.75rem;
                    font-weight: 600;
                }
                .auth-error-new {
                    background: #fff1f2;
                    border: 1px solid #fecaca;
                    color: #b91c1c;
                    padding: 0.75rem;
                    border-radius: 0.75rem;
                    font-size: 0.85rem;
                }
                .auth-footer-new {
                    margin-top: 2rem;
                    text-align: center;
                    font-size: 0.9rem;
                    color: #4b5563;
                }
            `}</style>
        </div>
    );
}
