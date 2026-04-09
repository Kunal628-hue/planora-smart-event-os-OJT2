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
                        <h1 className="auth-title">Create account</h1>
                        
                        <div className="feature-list">
                            <div className="feature-item">
                                <div className="feature-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                                    </svg>
                                </div>
                                <div className="feature-text">
                                    <h3>Free access</h3>
                                    <p>Core event tools available at no initial cost.</p>
                                </div>
                            </div>

                            <div className="feature-item">
                                <div className="feature-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                                    </svg>
                                </div>
                                <div className="feature-text">
                                    <h3>Enterprise Security</h3>
                                    <p>Your data is protected by global standards.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Form */}
                    <div className="auth-form-side">
                        <div className="auth-form-container">
                            <SocialAuth onLogin={handleSocialLogin} loading={loading} />

                            <div className="auth-divider-new">
                                <span>OR</span>
                            </div>

                            <form onSubmit={handleSubmit} className="auth-form">
                                <div className="form-group" style={{ marginBottom: '0.65rem' }}>
                                    <label className="auth-label-new">Full Name</label>
                                    <input
                                        className="auth-input-new"
                                        type="text"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="Jane Doe"
                                        style={{ padding: '0.6rem 1rem' }}
                                    />
                                </div>

                                <div className="form-group" style={{ marginBottom: '0.65rem' }}>
                                    <label className="auth-label-new">Email address</label>
                                    <input
                                        className="auth-input-new"
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="name@company.com"
                                        style={{ padding: '0.6rem 1rem' }}
                                    />
                                </div>

                                <div className="form-group" style={{ marginBottom: '0.65rem' }}>
                                    <label className="auth-label-new">Password</label>
                                    <input
                                        className="auth-input-new"
                                        type="password"
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        placeholder="Min. 8 characters"
                                        style={{ padding: '0.6rem 1rem' }}
                                    />
                                </div>

                                {error && (
                                    <div className="auth-error-new" style={{ padding: '0.4rem', marginBottom: '0.5rem' }}>{error}</div>
                                )}

                                <button type="submit" className="auth-submit-btn" disabled={loading} style={{ padding: '0.8rem' }}>
                                    {loading ? "Creating..." : "Create Account"}
                                </button>
                            </form>

                            <div className="auth-footer-links" style={{ marginTop: '1.25rem' }}>
                                <p style={{ margin: 0 }}>Already have an account? <Link to="/login">Sign in</Link></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .auth-page-new {
                    min-height: 100vh;
                    background: #070707;
                    display: flex;
                    flex-direction: column;
                    padding: 2.5rem;
                    color: white;
                    font-family: 'Inter', -apple-system, sans-serif;
                    overflow-x: hidden;
                    overflow-y: auto;
                    position: relative;
                    box-sizing: border-box;
                }
                /* Hide white edges on scroll */
                :global(html), :global(body) {
                    background: #070707 !important;
                    margin: 0;
                    padding: 0;
                }
                .auth-page-logo {
                    position: fixed;
                    top: 2.5rem;
                    left: 2.5rem;
                    z-index: 50;
                    transition: transform 0.2s;
                }
                .auth-page-logo img {
                    height: 2.2rem;
                    width: auto;
                    filter: invert(72%) sepia(99%) saturate(400%) hue-rotate(5deg) brightness(110%) contrast(110%) drop-shadow(0 0 12px rgba(255, 215, 0, 0.4));
                }
                .auth-page-logo:hover {
                    transform: scale(1.05);
                }
                .auth-container {
                    width: 100%;
                    max-width: 860px;
                    z-index: 10;
                    margin: auto;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                }
                .auth-card-split {
                    background: #0d0d0d;
                    border: 1px solid rgba(255, 255, 255, 0.04);
                    border-radius: 28px;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    overflow: hidden;
                    box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.9);
                    position: relative;
                }
                /* Vibrant Colorful Rainbow Border */
                .auth-card-split::before {
                    content: "";
                    position: absolute;
                    inset: -2px;
                    border-radius: 30px;
                    padding: 2px;
                    background: linear-gradient(
                        90deg, 
                        #00f2fe 0%, 
                        #4facfe 20%, 
                        #7000ff 40%, 
                        #ff006a 60%, 
                        #ff9900 80%,
                        #00f2fe 100%
                    );
                    background-size: 200% auto;
                    animation: aurora-border 4s linear infinite;
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
                @media (max-width: 900px) {
                    .auth-page-new {
                        padding: 1.5rem;
                    }
                    .auth-page-logo {
                        top: 1.5rem;
                        left: 1.5rem;
                    }
                    .auth-card-split {
                        grid-template-columns: 1fr;
                        max-height: none;
                    }
                    .auth-info-side { display: none; }
                }
                .auth-info-side {
                    padding: 3rem;
                    background: rgba(255, 255, 255, 0.012);
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    border-right: 1px solid rgba(255, 255, 255, 0.04);
                }
                .auth-title {
                    font-size: 2rem;
                    font-weight: 800;
                    margin-bottom: 2rem;
                    letter-spacing: -0.04em;
                    color: #ffffff;
                }
                .feature-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }
                .feature-item {
                    display: flex;
                    gap: 1.25rem;
                    align-items: flex-start;
                }
                .feature-icon {
                    width: 38px;
                    height: 38px;
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: rgba(255, 255, 255, 0.8);
                }
                .feature-text h3 {
                    font-size: 1rem;
                    font-weight: 600;
                    margin-bottom: 0.25rem;
                    color: #ffffff;
                }
                .feature-text p {
                    font-size: 0.875rem;
                    color: rgba(255, 255, 255, 0.45);
                    margin: 0;
                    line-height: 1.4;
                }
                .auth-form-side {
                    padding: 3rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #0a0a0a;
                }
                .auth-form-container {
                    width: 100%;
                    max-width: 300px;
                }
                .auth-label-new {
                    display: block;
                    font-size: 0.8125rem;
                    font-weight: 500;
                    color: rgba(255, 255, 255, 0.5);
                    margin-bottom: 0.5rem;
                }
                .auth-input-new {
                    width: 100%;
                    padding: 0.7rem 1rem;
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 12px;
                    font-size: 0.9375rem;
                    color: white;
                    transition: all 0.2s;
                }
                .auth-input-new:focus {
                    border-color: #00d1ff;
                    outline: none;
                    background: rgba(255, 255, 255, 0.04);
                }
                .auth-submit-btn {
                    width: 100%;
                    padding: 0.85rem;
                    background: #ff5a1f;
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-size: 0.9375rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                    margin-top: 0.5rem;
                }
                .auth-submit-btn:hover { background: #ff7844; transform: translateY(-1px); }
                .auth-divider-new {
                    position: relative;
                    text-align: center;
                    margin: 1.5rem 0;
                }
                .auth-divider-new::before {
                    content: "";
                    position: absolute;
                    top: 50%;
                    left: 0;
                    right: 0;
                    height: 1px;
                    background: rgba(255, 255, 255, 0.05);
                }
                .auth-divider-new span {
                    position: relative;
                    background: #0a0a0a;
                    padding: 0 0.75rem;
                    color: rgba(255, 255, 255, 0.2);
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .auth-footer-links {
                    text-align: center;
                    font-size: 0.875rem;
                }
                .auth-footer-links a {
                    color: #ff5a1f;
                    text-decoration: none;
                    font-weight: 500;
                }
            `}</style>
        </div>
    );
}
