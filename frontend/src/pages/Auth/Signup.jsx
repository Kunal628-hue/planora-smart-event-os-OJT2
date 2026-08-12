import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AuthBackground from "../../components/auth/AuthBackground";
import SocialAuth from "../../components/auth/SocialAuth";

export default function Signup() {
    const navigate = useNavigate();
    const { loginWithGoogle, signupWithEmail, user } = useAuth();
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            navigate("/dashboard");
        }
    }, [user, navigate]);

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
            setError(err.message);
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
            if (err.code === "auth/email-already-in-use") {
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

            <Link to="/" className="auth-page-logo">
                <img
                    src="/logo-new.svg"
                    alt="Planora"
                />
            </Link>

            <div className="auth-container">
                <div className="auth-card-split">
                    {/* Left Side: Info */}
                    <div className="auth-info-side">
                        <div className="auth-badge-pill">
                            <span className="badge-pulse"></span>
                            <span>GET STARTED FREE</span>
                        </div>

                        <h1 className="auth-title">
                            Join <span className="title-gradient">Planora</span> Today
                        </h1>
                        <p className="auth-subtitle">
                            Unlock AI-assisted event creation, smart guest management, and seamless vendor coordination.
                        </p>

                        <div className="feature-list">
                            <div className="feature-item">
                                <div className="feature-icon icon-glow-orange">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                                    </svg>
                                </div>
                                <div className="feature-text">
                                    <h3>Instant AI Setup</h3>
                                    <p>Generate full event structures in seconds with AI prompt engine.</p>
                                </div>
                            </div>

                            <div className="feature-item">
                                <div className="feature-icon icon-glow-cyan">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                    </svg>
                                </div>
                                <div className="feature-text">
                                    <h3>Enterprise Security</h3>
                                    <p>Bank-grade encryption protecting all your event & guest data.</p>
                                </div>
                            </div>
                        </div>

                        <div className="auth-stat-box">
                            <div className="stat-pill">✨ Free Tier Included</div>
                            <div className="stat-pill">🚀 No Credit Card Needed</div>
                        </div>
                    </div>

                    {/* Right Side: Form */}
                    <div className="auth-form-side">
                        <div className="auth-form-container">
                            <h2 className="form-heading">Create Account</h2>
                            <p className="form-subheading">Get started with your free Planora OS account</p>

                            <SocialAuth onLogin={handleSocialLogin} loading={loading} />

                            <div className="auth-divider-new">
                                <span>OR SIGN UP WITH EMAIL</span>
                            </div>

                            <form onSubmit={handleSubmit} className="auth-form">
                                <div className="form-group">
                                    <label className="auth-label-new">Full Name</label>
                                    <div className="input-icon-wrapper">
                                        <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                            <circle cx="12" cy="7" r="4"/>
                                        </svg>
                                        <input
                                            className="auth-input-new"
                                            type="text"
                                            name="name"
                                            value={form.name}
                                            onChange={handleChange}
                                            placeholder="John Doe"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="auth-label-new">Email address</label>
                                    <div className="input-icon-wrapper">
                                        <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                            <polyline points="22,6 12,13 2,6"/>
                                        </svg>
                                        <input
                                            className="auth-input-new"
                                            type="email"
                                            name="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            placeholder="name@example.com"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="auth-label-new">Password</label>
                                    <div className="input-icon-wrapper">
                                        <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                        </svg>
                                        <input
                                            className="auth-input-new"
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={form.password}
                                            onChange={handleChange}
                                            placeholder="Min. 8 characters"
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle-btn"
                                            onClick={() => setShowPassword(!showPassword)}
                                            tabIndex={-1}
                                        >
                                            {showPassword ? (
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                                                    <line x1="1" y1="1" x2="23" y2="23"/>
                                                </svg>
                                            ) : (
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                                    <circle cx="12" cy="12" r="3"/>
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {error && (
                                    <div className="auth-error-new">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                                        </svg>
                                        <span>{error}</span>
                                    </div>
                                )}

                                <button type="submit" className="auth-submit-btn" disabled={loading}>
                                    {loading ? (
                                        <span className="btn-loading-spinner"></span>
                                    ) : (
                                        <>
                                            <span>Create Free Account</span>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                                            </svg>
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="auth-footer-links">
                                <p>Already have an account? <Link to="/login">Sign in</Link></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .auth-page-new {
                    min-height: 100vh;
                    background: #060608;
                    display: flex;
                    flex-direction: column;
                    padding: 2rem;
                    color: white;
                    font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif;
                    overflow-x: hidden;
                    overflow-y: auto;
                    position: relative;
                    box-sizing: border-box;
                }
                :global(html), :global(body) {
                    background: #060608 !important;
                    margin: 0;
                    padding: 0;
                }
                .auth-page-logo {
                    position: fixed;
                    top: 2rem;
                    left: 2.5rem;
                    z-index: 50;
                    transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .auth-page-logo img {
                    height: 2.2rem;
                    width: auto;
                    filter: invert(72%) sepia(99%) saturate(400%) hue-rotate(5deg) brightness(110%) contrast(110%) drop-shadow(0 0 16px rgba(255, 140, 0, 0.4));
                }
                .auth-page-logo:hover {
                    transform: scale(1.05);
                }
                .auth-container {
                    width: 100%;
                    max-width: 920px;
                    z-index: 10;
                    margin: auto;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                    animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .auth-card-split {
                    background: rgba(13, 13, 17, 0.75);
                    backdrop-filter: blur(32px);
                    -webkit-backdrop-filter: blur(32px);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 28px;
                    display: grid;
                    grid-template-columns: 1.1fr 1fr;
                    overflow: hidden;
                    box-shadow: 0 30px 90px -15px rgba(0, 0, 0, 0.8), 0 0 60px rgba(255, 90, 31, 0.05);
                    position: relative;
                }
                .auth-card-split::before {
                    content: "";
                    position: absolute;
                    inset: -1px;
                    border-radius: 29px;
                    padding: 1.5px;
                    background: linear-gradient(
                        135deg, 
                        rgba(255, 90, 31, 0.6) 0%, 
                        rgba(0, 242, 254, 0.4) 40%, 
                        rgba(112, 0, 255, 0.5) 70%, 
                        rgba(255, 153, 0, 0.6) 100%
                    );
                    background-size: 200% auto;
                    animation: aurora-border 6s linear infinite;
                    -webkit-mask: 
                        linear-gradient(#fff 0 0) content-box, 
                        linear-gradient(#fff 0 0);
                    -webkit-mask-composite: xor;
                    mask-composite: exclude;
                    pointer-events: none;
                }
                @keyframes aurora-border {
                    0% { background-position: 0% 50%; }
                    100% { background-position: 200% 50%; }
                }
                .auth-info-side {
                    padding: 3.25rem;
                    background: linear-gradient(180deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.005) 100%);
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    border-right: 1px solid rgba(255, 255, 255, 0.06);
                }
                .auth-badge-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.35rem 0.85rem;
                    background: rgba(255, 90, 31, 0.1);
                    border: 1px solid rgba(255, 90, 31, 0.25);
                    border-radius: 100px;
                    font-size: 0.72rem;
                    font-weight: 700;
                    letter-spacing: 0.08em;
                    color: #ff8a5c;
                    width: fit-content;
                    margin-bottom: 1.5rem;
                }
                .badge-pulse {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: #ff5a1f;
                    box-shadow: 0 0 10px #ff5a1f;
                    animation: pulseDot 2s infinite;
                }
                @keyframes pulseDot {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.4); opacity: 0.5; }
                }
                .auth-title {
                    font-size: 2.1rem;
                    font-weight: 800;
                    margin-bottom: 0.75rem;
                    letter-spacing: -0.04em;
                    color: #ffffff;
                    line-height: 1.2;
                }
                .title-gradient {
                    background: linear-gradient(135deg, #ffffff 0%, #ff8a5c 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .auth-subtitle {
                    font-size: 0.925rem;
                    color: rgba(255, 255, 255, 0.55);
                    line-height: 1.55;
                    margin: 0 0 2.25rem 0;
                }
                .feature-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1.4rem;
                }
                .feature-item {
                    display: flex;
                    gap: 1.15rem;
                    align-items: flex-start;
                }
                .feature-icon {
                    width: 42px;
                    height: 42px;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                .icon-glow-orange {
                    background: rgba(255, 90, 31, 0.12);
                    border: 1px solid rgba(255, 90, 31, 0.25);
                    color: #ff8a5c;
                    box-shadow: 0 0 20px rgba(255, 90, 31, 0.15);
                }
                .icon-glow-cyan {
                    background: rgba(0, 242, 254, 0.1);
                    border: 1px solid rgba(0, 242, 254, 0.22);
                    color: #00f2fe;
                    box-shadow: 0 0 20px rgba(0, 242, 254, 0.12);
                }
                .feature-text h3 {
                    font-size: 0.975rem;
                    font-weight: 700;
                    margin: 0 0 0.2rem 0;
                    color: #ffffff;
                }
                .feature-text p {
                    font-size: 0.85rem;
                    color: rgba(255, 255, 255, 0.45);
                    margin: 0;
                    line-height: 1.45;
                }
                .auth-stat-box {
                    display: flex;
                    gap: 0.75rem;
                    margin-top: 2.25rem;
                    padding-top: 1.5rem;
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                }
                .stat-pill {
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: rgba(255, 255, 255, 0.5);
                    background: rgba(255, 255, 255, 0.03);
                    padding: 0.4rem 0.75rem;
                    border-radius: 8px;
                    border: 1px solid rgba(255, 255, 255, 0.06);
                }
                .auth-form-side {
                    padding: 3.25rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(10, 10, 14, 0.85);
                }
                .auth-form-container {
                    width: 100%;
                    max-width: 320px;
                }
                .form-heading {
                    font-size: 1.5rem;
                    font-weight: 800;
                    color: #ffffff;
                    margin: 0 0 0.35rem 0;
                    letter-spacing: -0.02em;
                }
                .form-subheading {
                    font-size: 0.84rem;
                    color: rgba(255, 255, 255, 0.45);
                    margin: 0 0 1.5rem 0;
                }
                .auth-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.1rem;
                }
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.45rem;
                }
                .auth-label-new {
                    font-size: 0.8125rem;
                    font-weight: 600;
                    color: rgba(255, 255, 255, 0.65);
                    letter-spacing: 0.01em;
                }
                .input-icon-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                .input-icon {
                    position: absolute;
                    left: 1rem;
                    color: rgba(255, 255, 255, 0.3);
                    pointer-events: none;
                    transition: color 0.2s;
                }
                .auth-input-new {
                    width: 100%;
                    padding: 0.8rem 1rem 0.8rem 2.75rem;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 14px;
                    font-size: 0.9375rem;
                    color: white;
                    transition: all 0.25s ease;
                    box-sizing: border-box;
                }
                .auth-input-new:focus {
                    border-color: #ff5a1f;
                    outline: none;
                    background: rgba(255, 255, 255, 0.06);
                    box-shadow: 0 0 0 4px rgba(255, 90, 31, 0.15);
                }
                .auth-input-new:focus + .input-icon,
                .input-icon-wrapper:focus-within .input-icon {
                    color: #ff8a5c;
                }
                .password-toggle-btn {
                    position: absolute;
                    right: 0.85rem;
                    background: none;
                    border: none;
                    color: rgba(255, 255, 255, 0.35);
                    cursor: pointer;
                    padding: 0.25rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: color 0.2s;
                }
                .password-toggle-btn:hover {
                    color: rgba(255, 255, 255, 0.8);
                }
                .auth-error-new {
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                    padding: 0.75rem 1rem;
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    border-radius: 12px;
                    color: #fca5a5;
                    font-size: 0.825rem;
                    font-weight: 500;
                }
                .auth-submit-btn {
                    width: 100%;
                    padding: 0.9rem;
                    background: linear-gradient(135deg, #ff5a1f 0%, #ff7844 100%);
                    color: white;
                    border: none;
                    border-radius: 14px;
                    font-size: 0.9375rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                    margin-top: 0.35rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    box-shadow: 0 8px 24px rgba(255, 90, 31, 0.3);
                }
                .auth-submit-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 12px 30px rgba(255, 90, 31, 0.45);
                    background: linear-gradient(135deg, #ff6a33 0%, #ff8855 100%);
                }
                .auth-submit-btn:active:not(:disabled) {
                    transform: translateY(0);
                }
                .auth-submit-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                .btn-loading-spinner {
                    width: 18px;
                    height: 18px;
                    border: 2.5px solid rgba(255, 255, 255, 0.3);
                    border-top-color: #ffffff;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .auth-divider-new {
                    position: relative;
                    text-align: center;
                    margin: 1.4rem 0;
                }
                .auth-divider-new::before {
                    content: "";
                    position: absolute;
                    top: 50%;
                    left: 0;
                    right: 0;
                    height: 1px;
                    background: rgba(255, 255, 255, 0.08);
                }
                .auth-divider-new span {
                    position: relative;
                    background: #0a0a0e;
                    padding: 0 0.85rem;
                    color: rgba(255, 255, 255, 0.3);
                    font-size: 0.7rem;
                    font-weight: 700;
                    letter-spacing: 0.08em;
                }
                .auth-footer-links {
                    text-align: center;
                    font-size: 0.875rem;
                    margin-top: 1.5rem;
                    color: rgba(255, 255, 255, 0.5);
                }
                .auth-footer-links a {
                    color: #ff8a5c;
                    text-decoration: none;
                    font-weight: 600;
                    transition: color 0.2s;
                }
                .auth-footer-links a:hover {
                    color: #ff9d75;
                    text-decoration: underline;
                }
                @media (max-width: 900px) {
                    .auth-page-new { padding: 1.25rem; }
                    .auth-page-logo { top: 1.25rem; left: 1.25rem; }
                    .auth-card-split { grid-template-columns: 1fr; }
                    .auth-info-side { display: none; }
                    .auth-form-side { padding: 2.25rem 1.5rem; }
                }
            `}</style>
        </div>
    );
}
