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
        <div className="auth-page-new">
            <AuthBackground />
            
            <div className="auth-card-new" ref={cardRef} style={{ opacity: 0 }}>
                {/* Switcher */}
                <div className="auth-switcher">
                    <button className="switcher-btn active">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3" />
                        </svg>
                        Login
                    </button>
                    <Link to="/signup" className="switcher-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="8.5" cy="7" r="4" />
                            <line x1="20" y1="8" x2="20" y2="14" />
                            <line x1="23" y1="11" x2="17" y2="11" />
                        </svg>
                        Sign Up
                    </Link>
                </div>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    <div>
                        <label className="auth-label-new">Email address</label>
                        <input
                            className="auth-input-new"
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="Enter your email address"
                        />
                    </div>

                    <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                            <label className="auth-label-new" style={{ marginBottom: 0 }}>Password</label>
                            <Link to="/forgot-password" style={{ fontSize: "0.8rem", color: "#111827", fontWeight: 600, textDecoration: 'none' }}>
                                Forgot password?
                            </Link>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <input
                                className="auth-input-new"
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
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
                        {loading ? "Logging in..." : "Log In"}
                    </button>
                </form>

                <div className="auth-divider-new">
                    <span>OR</span>
                </div>

                <SocialAuth onLogin={handleSocialLogin} loading={loading} />

                <div className="auth-footer-new">
                    Don't have an account yet? <Link to="/signup" style={{ color: '#111827', fontWeight: 700, textDecoration: 'underline' }}>Sign up</Link>
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
