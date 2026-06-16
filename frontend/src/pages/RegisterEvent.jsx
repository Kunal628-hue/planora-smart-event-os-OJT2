import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { 
    Calendar, MapPin, Clock, UserCheck, ShieldCheck, Mail, Phone, 
    Linkedin, Globe, Heart, ChevronDown, ChevronUp, Loader2, CreditCard,
    ArrowLeft, Download
} from "lucide-react";
import { useDialog } from "../context/DialogContext";

export default function RegisterEvent() {
    const { eventId } = useParams();
    const { showAlert } = useDialog();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [registeredGuest, setRegisteredGuest] = useState(null);
    
    // Form state
    const [form, setForm] = useState({
        name: "",
        email: "",
        whatsapp: "",
        category: "Tech",
        familySize: 1,
        linkedIn: "",
        portfolio: "",
        dietary: "None",
        notes: ""
    });
    const [customResponse, setCustomResponse] = useState("");
    const [consentChecked, setConsentChecked] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [expandedFaq, setExpandedFaq] = useState(null);
    const [surveyResponses, setSurveyResponses] = useState({});
    const [surveySubmitted, setSurveySubmitted] = useState(false);
    const [cookieBannerAccepted, setCookieBannerAccepted] = useState(() => {
        try {
            return localStorage.getItem(`cookie_accepted_${eventId}`) === "true";
        } catch (e) {
            return false;
        }
    });

    // Fetch Event Details (Publicly)
    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/events/${eventId}`);
                if (!res.ok) {
                    throw new Error("Event not found or access is restricted.");
                }
                const data = await res.json();
                setEvent(data);
            } catch (err) {
                console.error("Error loading registration page:", err);
                setError(err.message || "Failed to load event registration portal.");
            } finally {
                setLoading(false);
            }
        };

        if (eventId) fetchEvent();
    }, [eventId]);

    // Parse Template Settings with default fallbacks
    const config = useMemo(() => {
        const defaultConfig = {
            theme: "aero-glass",
            colors: {
                primary: "#06b6d4",
                secondary: "#3b82f6",
                accent: "#38bdf8",
                glow: "#06b6d4"
            },
            font: "Inter",
            logoUrl: "",
            widgets: {
                header: true,
                countdown: true,
                tickets: true,
                speakers: true,
                map: true,
                faq: true,
                form: true
            },
            speakers: [
                { id: 1, name: "Dr. Elena Vance", role: "AI Research Lead, Quantum Labs", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150" },
                { id: 2, name: "Marcus Chen", role: "Principal Engineer, CyberNet", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" }
            ],
            faqs: [
                { id: 1, q: "Is this event online or in-person?", a: "This is a hybrid experience. You can attend physically at the venue or stream virtually via our high-fidelity cyber-portal." },
                { id: 2, q: "Do I get a physical entry badge?", a: "Yes! Fully verified attendees will receive a glowing, high-fidelity digital badge which can be printed or scanned on-site." }
            ],
            fields: {
                whatsapp: true,
                category: true,
                familySize: true,
                dietary: true,
                linkedIn: true,
                portfolio: true,
                notes: true,
                customQuestionEnabled: false,
                customQuestion: "What is your main goal for this event?"
            },
            privacy: {
                requireConsent: false,
                consentText: "I agree to the terms and privacy policy of Planora events.",
                cookieBanner: false
            },
            email: {
                subject: "Registration Confirmed - Pass Issued!",
                body: "Thank you for registering. Your digital entry pass and badge details are attached below."
            },
            survey: {
                enabled: false,
                questions: [
                    "Rate your overall event experience (1-5)",
                    "Any other suggestions or comments?"
                ]
            }
        };

        if (!event || !event.registrationConfig) {
            return defaultConfig;
        }

        const saved = event.registrationConfig;
        return {
            theme: saved.theme || defaultConfig.theme,
            colors: saved.colors || defaultConfig.colors,
            font: saved.font || defaultConfig.font,
            logoUrl: saved.logoUrl !== undefined ? saved.logoUrl : defaultConfig.logoUrl,
            widgets: { ...defaultConfig.widgets, ...saved.widgets },
            speakers: saved.speakers || defaultConfig.speakers,
            faqs: saved.faqs || defaultConfig.faqs,
            fields: { ...defaultConfig.fields, ...saved.fields },
            privacy: { ...defaultConfig.privacy, ...saved.privacy },
            email: { ...defaultConfig.email, ...saved.email },
            survey: { ...defaultConfig.survey, ...saved.survey }
        };
    }, [event]);

    // Days countdown
    const daysLeft = useMemo(() => {
        if (!event || !event.date) return { d: "00", h: "00", m: "00" };
        const diff = new Date(event.date).getTime() - Date.now();
        if (diff <= 0) return { d: "00", h: "00", m: "00" };
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / (1000 * 60)) % 60);
        return {
            d: d.toString().padStart(2, "0"),
            h: h.toString().padStart(2, "0"),
            m: m.toString().padStart(2, "0")
        };
    }, [event]);

    // Handle Form Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (config.privacy.requireConsent && !consentChecked) {
            showAlert("Consent Required", "You must agree to the terms and conditions to proceed.");
            return;
        }

        setSubmitting(true);
        try {
            // Include response to custom question in the notes field so it is visible in the dashboard
            const finalNotes = form.notes + 
                (config.fields.customQuestionEnabled && customResponse ? `\n[${config.fields.customQuestion}]: ${customResponse}` : "");

            const res = await fetch(`${import.meta.env.VITE_API_URL}/guests`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    notes: finalNotes,
                    event: eventId,
                    user: event.user, // Event owner's UID
                    status: "Confirmed" // Pre-confirm registrations from the public page
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Registration failed.");
            }

            const data = await res.json();
            setRegisteredGuest(data);
        } catch (err) {
            console.error("Submit RSVP error:", err);
            showAlert("Registration Failed", err.message || "Failed to register. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#0b0a0e", gap: "1.5rem" }}>
                <div style={{ width: "48px", height: "48px", border: "4px solid #f97316", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                <p style={{ fontWeight: 800, color: "#64748b", letterSpacing: "0.1em", fontSize: "0.8rem", textTransform: "uppercase" }}>Loading Portal Channels...</p>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#0b0a0e", gap: "1.5rem", padding: "2rem", textAlign: "center" }}>
                <div style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", padding: "16px", borderRadius: "50%" }}>
                    <ShieldCheck size={36} />
                </div>
                <h2 style={{ color: "#fff", fontWeight: 900, fontSize: "1.5rem" }}>Registration Restricted</h2>
                <p style={{ color: "#64748b", maxWidth: "450px" }}>{error || "The event you are trying to access does not exist or has been archived."}</p>
                <Link to="/" style={{ textDecoration: "none", color: "#f97316", fontWeight: 800, fontSize: "14px" }}>Return to Planora Platform</Link>
            </div>
        );
    }

    // Styles for templates
    const themeStyles = {
        "quantum-cyber": {
            bg: "#08070d",
            cardBg: "rgba(18, 14, 30, 0.65)",
            border: "rgba(168, 85, 247, 0.15)",
            font: "'Inter', sans-serif",
            accentGradient: `linear-gradient(135deg, ${config.colors.primary} 0%, ${config.colors.secondary} 100%)`,
            glowShadow: `0 0 40px ${config.colors.glow}22`
        },
        "aero-glass": {
            bg: "#050d18",
            cardBg: "rgba(255, 255, 255, 0.03)",
            border: "rgba(255, 255, 255, 0.08)",
            font: "'Outfit', sans-serif",
            accentGradient: `linear-gradient(135deg, ${config.colors.accent} 0%, ${config.colors.primary} 100%)`,
            glowShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)"
        },
        "solar-flare": {
            bg: "#0d0602",
            cardBg: "rgba(30, 12, 4, 0.55)",
            border: "rgba(249, 115, 22, 0.15)",
            font: "'Inter', sans-serif",
            accentGradient: "linear-gradient(135deg, #f97316 0%, #ef4444 100%)",
            glowShadow: "0 0 35px rgba(249, 115, 22, 0.12)"
        },
        "dark-stealth": {
            bg: "#09090b",
            cardBg: "#18181b",
            border: "#27272a",
            font: "'JetBrains Mono', monospace",
            accentGradient: "linear-gradient(135deg, #22c55e 0%, #10b981 100%)",
            glowShadow: "none"
        }
    };

    const currentThemeStyle = themeStyles[config.theme] || themeStyles["quantum-cyber"];

    // Category Color Mapping for Digital Pass
    const categoryColors = {
        "VIP": { color: "#f59e0b", name: "VIP PASS", bg: "rgba(245, 158, 11, 0.15)" },
        "Tech": { color: "#06b6d4", name: "TECH SPECIALIST", bg: "rgba(6, 182, 212, 0.15)" },
        "Business": { color: "#a855f7", name: "BUSINESS DELEGATE", bg: "rgba(168, 85, 247, 0.15)" },
        "Friend": { color: "#10b981", name: "GUEST ACCESS", bg: "rgba(16, 185, 129, 0.15)" },
        "Family": { color: "#ec4899", name: "GUEST ACCESS", bg: "rgba(236, 72, 153, 0.15)" }
    };
    const activeCategory = registeredGuest ? (categoryColors[registeredGuest.category] || { color: config.colors.accent, name: `${registeredGuest.category.toUpperCase()} ACCESS`, bg: "rgba(255,255,255,0.1)" }) : null;

    return (
        <div style={{ 
            background: currentThemeStyle.bg, 
            color: "#fff", 
            fontFamily: config.font === "Outfit" ? "'Outfit', sans-serif" : config.font === "Playfair Display" ? "'Playfair Display', serif" : config.font === "JetBrains Mono" ? "'JetBrains Mono', monospace" : "'Inter', sans-serif",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            position: "relative",
            overflowX: "hidden"
        }}>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;700;900&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=JetBrains+Mono:wght@400;700&display=swap" />
            <style>{`
                input, select, textarea { transition: border-color 0.2s, background 0.2s; }
                input:focus, select:focus, textarea:focus { border-color: ${config.colors.accent} !important; outline: none; background: rgba(255,255,255,0.06) !important; }
                @keyframes pulseGlow {
                    0% { box-shadow: 0 0 20px ${config.colors.accent}1a; }
                    50% { box-shadow: 0 0 35px ${config.colors.accent}44; }
                    100% { box-shadow: 0 0 20px ${config.colors.accent}1a; }
                }
                .glow-btn { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; }
                .glow-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px ${config.colors.accent}44; }
                @media (max-width: 768px) {
                    .split-grid { grid-template-columns: 1fr !important; }
                    .header-title { font-size: 2.2rem !important; }
                }
            `}</style>

            {/* Backdrop mesh glows */}
            <div style={{ position: "absolute", top: "-10%", left: "20%", width: "60%", height: "40%", background: `radial-gradient(circle, ${config.colors.primary}15 0%, transparent 70%)`, pointerEvents: "none", zIndex: 0 }}></div>
            <div style={{ position: "absolute", bottom: "10%", right: "10%", width: "50%", height: "50%", background: `radial-gradient(circle, ${config.colors.accent}0f 0%, transparent 70%)`, pointerEvents: "none", zIndex: 0 }}></div>

            {/* 1. Header widget */}
            {config.widgets.header && (
                <header style={{ 
                    background: `linear-gradient(135deg, ${config.colors.primary}18 0%, rgba(0,0,0,0) 100%)`, 
                    padding: "4rem 2rem 3rem", 
                    textAlign: "center", 
                    borderBottom: `1px solid ${currentThemeStyle.border}`,
                    position: "relative",
                    zIndex: 1
                }}>
                    {config.logoUrl && (
                        <img src={config.logoUrl} alt="Logo" style={{ maxHeight: "50px", objectFit: "contain", marginBottom: "1.5rem", display: "inline-block" }} />
                    )}
                    <br />
                    <span style={{ 
                        display: "inline-block", 
                        background: "rgba(255,255,255,0.06)", 
                        border: `1px solid ${config.colors.primary}33`, 
                        color: "#fff", 
                        fontSize: "11px", 
                        fontWeight: 800, 
                        padding: "6px 14px", 
                        borderRadius: "100px", 
                        textTransform: "uppercase", 
                        letterSpacing: "0.15em" 
                    }}>
                        {event.type}
                    </span>
                    <h1 className="header-title" style={{ 
                        fontSize: "3.2rem", 
                        fontWeight: 900, 
                        margin: "1.5rem 0 1rem", 
                        color: "#fff", 
                        letterSpacing: "-0.04em", 
                        background: `linear-gradient(135deg, #fff 40%, ${config.colors.accent} 100%)`, 
                        WebkitBackgroundClip: "text", 
                        WebkitTextFillColor: "transparent" 
                    }}>
                        {event.name}
                    </h1>
                    <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem", fontSize: "14px", color: "#94a3b8", flexWrap: "wrap" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><Calendar size={16} /> {event.date}</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><MapPin size={16} /> {event.location} ({event.city})</span>
                    </div>
                </header>
            )}

            {/* Main Content Layout */}
            <main style={{ flex: 1, alignSelf: "center", width: "100%", maxWidth: "1200px", margin: "0 auto", padding: "3rem 2rem", position: "relative", zIndex: 1, boxSizing: "border-box" }}>
                {!registeredGuest ? (
                    // ─── REGISTRATION INTAKE STATE ───
                    <div className="split-grid" style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "3rem" }}>
                        
                        {/* Left column: RSVP form */}
                        <div>
                            {config.widgets.form && (
                                <div style={{ 
                                    background: currentThemeStyle.cardBg, 
                                    border: `1px solid ${currentThemeStyle.border}`, 
                                    borderRadius: "24px", 
                                    padding: "2.5rem",
                                    boxShadow: currentThemeStyle.glowShadow,
                                    backdropFilter: "blur(20px)",
                                    WebkitBackdropFilter: "blur(20px)"
                                }}>
                                    <h3 style={{ fontSize: "22px", fontWeight: 800, margin: "0 0 1.5rem", color: "#fff", borderBottom: `1px solid ${currentThemeStyle.border}`, paddingBottom: "12px" }}>
                                        Initialize Registration
                                    </h3>
                                    
                                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                                            <div>
                                                <label style={{ display: "block", fontSize: "11px", color: "rgba(255,255,255,0.45)", fontWeight: 800, textTransform: "uppercase", marginBottom: "8px" }}>Full Name</label>
                                                <input 
                                                    placeholder="Jane Doe" 
                                                    required 
                                                    value={form.name}
                                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                                    style={{ width: "100%", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "12px 14px", color: "#fff", fontSize: "13px", boxSizing: "border-box" }} 
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: "block", fontSize: "11px", color: "rgba(255,255,255,0.45)", fontWeight: 800, textTransform: "uppercase", marginBottom: "8px" }}>Email Address</label>
                                                <input 
                                                    type="email"
                                                    placeholder="jane@example.com" 
                                                    required 
                                                    value={form.email}
                                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                                    style={{ width: "100%", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "12px 14px", color: "#fff", fontSize: "13px", boxSizing: "border-box" }} 
                                                />
                                            </div>
                                        </div>

                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                                            {config.fields.whatsapp && (
                                                <div>
                                                    <label style={{ display: "block", fontSize: "11px", color: "rgba(255,255,255,0.45)", fontWeight: 800, textTransform: "uppercase", marginBottom: "8px" }}>WhatsApp Number</label>
                                                    <input 
                                                        placeholder="+91 XXXXX XXXXX" 
                                                        value={form.whatsapp}
                                                        onChange={e => setForm({ ...form, whatsapp: e.target.value })}
                                                        style={{ width: "100%", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "12px 14px", color: "#fff", fontSize: "13px", boxSizing: "border-box" }} 
                                                    />
                                                </div>
                                            )}
                                            {config.fields.familySize && (
                                                <div>
                                                    <label style={{ display: "block", fontSize: "11px", color: "rgba(255,255,255,0.45)", fontWeight: 800, textTransform: "uppercase", marginBottom: "8px" }}>Number of attendees?</label>
                                                    <input 
                                                        type="number"
                                                        min="1" 
                                                        required
                                                        value={form.familySize}
                                                        onChange={e => setForm({ ...form, familySize: parseInt(e.target.value) || 1 })}
                                                        style={{ width: "100%", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "12px 14px", color: "#fff", fontSize: "13px", boxSizing: "border-box" }} 
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                                            {config.fields.category && (
                                                <div>
                                                    <label style={{ display: "block", fontSize: "11px", color: "rgba(255,255,255,0.45)", fontWeight: 800, textTransform: "uppercase", marginBottom: "8px" }}>Segment Category</label>
                                                    <select 
                                                        value={form.category}
                                                        onChange={e => setForm({ ...form, category: e.target.value })}
                                                        style={{ width: "100%", background: "rgba(10,10,12,0.8)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "12px 14px", color: "#fff", fontSize: "13px", boxSizing: "border-box" }}
                                                    >
                                                        <option>Tech</option>
                                                        <option>Business</option>
                                                        <option>VIP</option>
                                                        <option>General</option>
                                                    </select>
                                                </div>
                                            )}
                                            {config.fields.dietary && (
                                                <div>
                                                    <label style={{ display: "block", fontSize: "11px", color: "rgba(255,255,255,0.45)", fontWeight: 800, textTransform: "uppercase", marginBottom: "8px" }}>Dietary Requirement</label>
                                                    <select 
                                                        value={form.dietary}
                                                        onChange={e => setForm({ ...form, dietary: e.target.value })}
                                                        style={{ width: "100%", background: "rgba(10,10,12,0.8)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "12px 14px", color: "#fff", fontSize: "13px", boxSizing: "border-box" }}
                                                    >
                                                        <option>None</option>
                                                        <option>Vegetarian</option>
                                                        <option>Vegan</option>
                                                        <option>Gluten-Free</option>
                                                    </select>
                                                </div>
                                            )}
                                        </div>

                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                                            {config.fields.linkedIn && (
                                                <div>
                                                    <label style={{ display: "block", fontSize: "11px", color: "rgba(255,255,255,0.45)", fontWeight: 800, textTransform: "uppercase", marginBottom: "8px" }}>LinkedIn Profile (URL)</label>
                                                    <input 
                                                        placeholder="https://linkedin.com/in/username" 
                                                        value={form.linkedIn}
                                                        onChange={e => setForm({ ...form, linkedIn: e.target.value })}
                                                        style={{ width: "100%", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "12px 14px", color: "#fff", fontSize: "13px", boxSizing: "border-box" }} 
                                                    />
                                                </div>
                                            )}
                                            {config.fields.portfolio && (
                                                <div>
                                                    <label style={{ display: "block", fontSize: "11px", color: "rgba(255,255,255,0.45)", fontWeight: 800, textTransform: "uppercase", marginBottom: "8px" }}>Portfolio / Github (URL)</label>
                                                    <input 
                                                        placeholder="https://github.com/username" 
                                                        value={form.portfolio}
                                                        onChange={e => setForm({ ...form, portfolio: e.target.value })}
                                                        style={{ width: "100%", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "12px 14px", color: "#fff", fontSize: "13px", boxSizing: "border-box" }} 
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {config.fields.customQuestionEnabled && (
                                            <div>
                                                <label style={{ display: "block", fontSize: "11px", color: "rgba(255,255,255,0.45)", fontWeight: 800, textTransform: "uppercase", marginBottom: "8px" }}>{config.fields.customQuestion}</label>
                                                <input 
                                                    placeholder="Your response..." 
                                                    required
                                                    value={customResponse}
                                                    onChange={e => setCustomResponse(e.target.value)}
                                                    style={{ width: "100%", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "12px 14px", color: "#fff", fontSize: "13px", boxSizing: "border-box" }} 
                                                />
                                            </div>
                                        )}

                                        {config.fields.notes && (
                                            <div>
                                                <label style={{ display: "block", fontSize: "11px", color: "rgba(255,255,255,0.45)", fontWeight: 800, textTransform: "uppercase", marginBottom: "8px" }}>Notes / Projects description</label>
                                                <textarea 
                                                    placeholder="Describe your project or expectations..." 
                                                    value={form.notes}
                                                    onChange={e => setForm({ ...form, notes: e.target.value })}
                                                    style={{ width: "100%", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "12px 14px", color: "#fff", fontSize: "13px", height: "60px", resize: "none", boxSizing: "border-box" }} 
                                                />
                                            </div>
                                        )}

                                        {config.privacy.requireConsent && (
                                            <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "12px", color: "rgba(255,255,255,0.7)", cursor: "pointer", marginTop: "4px" }}>
                                                <input 
                                                    type="checkbox" 
                                                    required 
                                                    checked={consentChecked} 
                                                    onChange={e => setConsentChecked(e.target.checked)} 
                                                    style={{ accentColor: config.colors.accent, marginTop: "3px" }} 
                                                />
                                                <span>{config.privacy.consentText}</span>
                                            </label>
                                        )}

                                        <button 
                                            type="submit" 
                                            disabled={submitting}
                                            style={{ 
                                                background: currentThemeStyle.accentGradient, 
                                                color: "#fff", 
                                                border: "none", 
                                                padding: "14px", 
                                                borderRadius: "12px", 
                                                fontSize: "14px", 
                                                fontWeight: 800, 
                                                marginTop: "10px",
                                                textTransform: "uppercase",
                                                letterSpacing: "0.05em",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: "8px"
                                            }}
                                            className="glow-btn"
                                        >
                                            {submitting ? (
                                                <>
                                                    <Loader2 size={16} className="animate-spin" />
                                                    Initializing RSVP Sequence...
                                                </>
                                            ) : (
                                                <>
                                                    <UserCheck size={16} />
                                                    Confirm RSVP & Issue Pass
                                                </>
                                            )}
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>

                        {/* Right column: Countdown, speakers, map, faq */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                            {/* 2. Countdown Widget */}
                            {config.widgets.countdown && (
                                <div style={{ 
                                    background: currentThemeStyle.cardBg, 
                                    border: `1px solid ${currentThemeStyle.border}`, 
                                    borderRadius: "20px", 
                                    padding: "1.5rem 2rem", 
                                    textAlign: "center",
                                    boxShadow: currentThemeStyle.glowShadow,
                                    backdropFilter: "blur(20px)",
                                    WebkitBackdropFilter: "blur(20px)"
                                }}>
                                    <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>Sector T-Minus Countdown</div>
                                    <div style={{ display: "flex", justifyContent: "center", gap: "1.75rem" }}>
                                        {[
                                            { val: daysLeft.d, label: "DAYS" },
                                            { val: daysLeft.h, label: "HOURS" },
                                            { val: daysLeft.m, label: "MINS" }
                                        ].map((t, i) => (
                                            <div key={i} style={{ display: "flex", alignItems: "center" }}>
                                                <div>
                                                    <div style={{ fontSize: "2.4rem", fontWeight: 900, color: config.colors.accent, fontFamily: "monospace", letterSpacing: "2px" }}>{t.val}</div>
                                                    <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)", fontWeight: 800, letterSpacing: "0.05em", marginTop: "2px" }}>{t.label}</div>
                                                </div>
                                                {i < 2 && <span style={{ fontSize: "1.75rem", fontWeight: 300, color: "rgba(255,255,255,0.15)", marginLeft: "1.75rem", marginTop: "-14px" }}>:</span>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 4. Speakers Spotlight */}
                            {config.widgets.speakers && config.speakers.length > 0 && (
                                <div>
                                    <h3 style={{ fontSize: "15px", fontWeight: 800, margin: "0 0 1rem", textTransform: "uppercase", letterSpacing: "0.05em", color: config.colors.accent }}>Keynote Speakers</h3>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                        {config.speakers.map(s => (
                                            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: "12px", background: currentThemeStyle.cardBg, border: `1px solid ${currentThemeStyle.border}`, borderRadius: "14px", padding: "12px" }}>
                                                <img src={s.avatar} alt={s.name} style={{ width: "42px", height: "42px", borderRadius: "50%", objectFit: "cover", border: `2px solid ${config.colors.accent}` }} />
                                                <div>
                                                    <div style={{ fontSize: "13px", fontWeight: 800, color: "#fff" }}>{s.name}</div>
                                                    <div style={{ fontSize: "10px", color: "#64748b", marginTop: "2px" }}>{s.role}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 5. Map location */}
                            {config.widgets.map && (
                                <div style={{ background: currentThemeStyle.cardBg, border: `1px solid ${currentThemeStyle.border}`, borderRadius: "20px", padding: "1.5rem" }}>
                                    <div style={{ display: "flex", justifySelf: "space-between", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                                        <div>
                                            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", fontWeight: 800, textTransform: "uppercase" }}>Operational Hub Location</div>
                                            <h4 style={{ fontSize: "14px", fontWeight: 800, margin: "4px 0 0" }}>{event.location}</h4>
                                            <p style={{ fontSize: "10px", color: "#64748b", margin: "2px 0 0" }}>{event.city}, {event.country}</p>
                                        </div>
                                        <MapPin size={20} style={{ color: config.colors.accent }} />
                                    </div>
                                    <div style={{ height: "180px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", position: "relative", overflow: "hidden" }}>
                                        <iframe
                                            title="Event Location Map"
                                            width="100%"
                                            height="100%"
                                            style={{ border: 0, opacity: 0.8, filter: "grayscale(100%) invert(90%) contrast(120%)" }}
                                            loading="lazy"
                                            allowFullScreen
                                            src={`https://maps.google.com/maps?q=${encodeURIComponent((event.location || "") + ", " + (event.city || "") + ", " + (event.country || ""))}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                                        ></iframe>
                                        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((event.location || "") + ", " + (event.city || ""))}`} target="_blank" rel="noreferrer" style={{ position: "absolute", bottom: "8px", right: "8px", fontSize: "9px", background: "rgba(10,10,12,0.85)", backdropFilter: "blur(4px)", padding: "4px 8px", borderRadius: "4px", color: config.colors.accent, fontWeight: 800, textDecoration: "none", textTransform: "uppercase", border: `1px solid ${config.colors.accent}33` }}>Open Maps ↗</a>
                                    </div>
                                </div>
                            )}

                            {/* 6. FAQ Accordion */}
                            {config.widgets.faq && config.faqs.length > 0 && (
                                <div>
                                    <h3 style={{ fontSize: "15px", fontWeight: 800, margin: "0 0 1rem", textTransform: "uppercase", letterSpacing: "0.05em", color: config.colors.accent }}>Briefing (FAQ)</h3>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                        {config.faqs.map(f => (
                                            <div 
                                                key={f.id} 
                                                onClick={() => setExpandedFaq(expandedFaq === f.id ? null : f.id)}
                                                style={{ background: currentThemeStyle.cardBg, border: `1px solid ${currentThemeStyle.border}`, borderRadius: "12px", padding: "14px", cursor: "pointer" }}
                                            >
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                    <span style={{ fontSize: "13px", fontWeight: 700 }}>{f.q}</span>
                                                    {expandedFaq === f.id ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
                                                </div>
                                                {expandedFaq === f.id && (
                                                    <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "10px", lineHeight: "1.5" }}>
                                                        {f.a}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    // ─── REGISTRATION COMPLETED STATE & GLASSMORPHIC PASS BADGE DISPLAY ───
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2.5rem", animation: "fade-up 0.5s ease-out" }}>
                        <div style={{ textAlign: "center", maxWidth: "600px" }}>
                            <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "rgba(16, 185, 129, 0.15)", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
                                <UserCheck size={28} style={{ margin: "auto" }} />
                            </div>
                            <h2 style={{ fontSize: "2rem", fontWeight: 900 }}>Registration Finalized!</h2>
                            <p style={{ color: "#94a3b8", marginTop: "8px", fontSize: "15px", lineHeight: "1.5" }}>
                                Welcome aboard, <strong>{registeredGuest.name}</strong>. We've registered <strong>{registeredGuest.familySize}</strong> attendee(s) for the event. A confirmation email with badge credentials has been sent to <strong>{registeredGuest.email}</strong>.
                            </p>
                        </div>

                        {/* Glassmorphic digital ticket badge card */}
                        <div style={{ display: "flex", flexDirection: "row", gap: "2.5rem", justifyContent: "center", flexWrap: "wrap", width: "100%", maxWidth: "900px" }}>
                            {/* Glassmorphic digital ticket badge card */}
                            <div style={{
                                width: "350px",
                                height: "520px",
                                background: "rgba(10, 10, 12, 0.7)",
                                border: `1px solid ${activeCategory.color}33`,
                                borderRadius: "24px",
                                padding: "2rem",
                                boxShadow: `0 25px 50px -12px ${activeCategory.color}22`,
                                backdropFilter: "blur(20px)",
                                WebkitBackdropFilter: "blur(20px)",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                position: "relative",
                                overflow: "hidden",
                                animation: "pulseGlow 3s infinite"
                            }}>
                                {/* Accent lighting dots */}
                                <div style={{ position: "absolute", top: "-50px", right: "-50px", width: "120px", height: "120px", borderRadius: "50%", background: `${activeCategory.color}15`, filter: "blur(40px)" }}></div>
                                
                                {/* Logo / Header */}
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", fontWeight: 800, letterSpacing: "0.15em" }}>PLANORA PASS</span>
                                    <span style={{ background: activeCategory.bg, color: activeCategory.color, fontSize: "9px", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", padding: "4px 10px", borderRadius: "6px" }}>
                                        {activeCategory.name}
                                    </span>
                                </div>

                                {/* Center Section: Attendee details */}
                                <div style={{ margin: "2rem 0", textAlign: "center" }}>
                                    <p style={{ margin: 0, fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>Admitted Attendee</p>
                                    <h3 style={{ margin: "6px 0 2px", fontSize: "24px", fontWeight: 900, color: "#fff", letterSpacing: "-0.02em" }}>{registeredGuest.name}</h3>
                                    <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>{registeredGuest.email}</p>

                                    <div style={{ width: "40px", height: "2px", background: "rgba(255,255,255,0.08)", margin: "20px auto" }}></div>

                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", textAlign: "left", marginBottom: "16px" }}>
                                        <div style={{ background: "rgba(255,255,255,0.02)", padding: "10px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.04)" }}>
                                            <span style={{ fontSize: "8px", color: "rgba(255,255,255,0.3)", fontWeight: 800, textTransform: "uppercase" }}>Sector Date</span>
                                            <p style={{ margin: "3px 0 0", fontSize: "12px", fontWeight: 700, color: "#fff" }}>{event.date}</p>
                                        </div>
                                        <div style={{ background: "rgba(255,255,255,0.02)", padding: "10px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.04)" }}>
                                            <span style={{ fontSize: "8px", color: "rgba(255,255,255,0.3)", fontWeight: 800, textTransform: "uppercase" }}>Security Code</span>
                                            <p style={{ margin: "3px 0 0", fontSize: "12px", fontWeight: 800, color: activeCategory.color, fontFamily: "monospace" }}>{registeredGuest.entryCode}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Barcode/QR Mock Graphic */}
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "12px", padding: "16px" }}>
                                    {/* Stylish mock cyber barcode */}
                                    <div style={{ display: "flex", gap: "2px", height: "45px", alignItems: "center", background: "#000", padding: "4px 12px", borderRadius: "6px", width: "100%", justifyContent: "center", boxSizing: "border-box" }}>
                                        {[1,3,2,1,4,1,2,3,1,2,1,4,2,1,3,1,2,4,1,2,1,3,1,2,4].map((w, idx) => (
                                            <div key={idx} style={{ width: `${w}px`, height: "100%", background: activeCategory.color, opacity: 0.85 }}></div>
                                        ))}
                                    </div>
                                    <span style={{ fontSize: "8px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.2em", fontWeight: 800 }}>SCANNABLE SECTOR ENTRY PASS</span>
                                </div>

                                {/* Footer info */}
                                <div style={{ display: "flex", justifySelf: "flex-end", justifyContent: "space-between", alignItems: "center", fontSize: "9px", color: "rgba(255,255,255,0.2)" }}>
                                    <span>VENUE: {event.city}</span>
                                    <span>STATUS: VERIFIED</span>
                                </div>
                            </div>

                            {/* Survey Form Panel (if enabled) */}
                            {config.survey.enabled && (
                                <div style={{
                                    width: "350px",
                                    height: "520px",
                                    background: "rgba(10, 10, 12, 0.7)",
                                    border: `1px solid ${currentThemeStyle.border}`,
                                    borderRadius: "24px",
                                    padding: "2.5rem 2rem",
                                    boxShadow: currentThemeStyle.glowShadow,
                                    backdropFilter: "blur(20px)",
                                    WebkitBackdropFilter: "blur(20px)",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between",
                                    boxSizing: "border-box"
                                }}>
                                    {surveySubmitted ? (
                                        <div style={{ textAlign: "center", margin: "auto 0" }}>
                                            <div style={{ width: "50px", height: "50px", borderRadius: "50%", background: "rgba(16, 185, 129, 0.15)", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
                                                <UserCheck size={24} style={{ margin: "auto" }} />
                                            </div>
                                            <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#fff" }}>Feedback Submitted!</h3>
                                            <p style={{ color: "#64748b", fontSize: "12px", marginTop: "8px", lineHeight: "1.5" }}>
                                                Thank you for helping us improve our future events. Your feedback has been recorded.
                                            </p>
                                        </div>
                                    ) : (
                                        <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
                                            <div style={{ marginBottom: "1rem" }}>
                                                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#fff" }}>Quick Feedback</h3>
                                                <p style={{ color: "#64748b", fontSize: "11px", marginTop: "4px" }}>Help us optimize future events by answering these questions:</p>
                                            </div>
                                            <div className="custom-scrollbar" style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1rem", maxHeight: "280px", paddingRight: "4px" }}>
                                                {config.survey.questions.map((q, idx) => (
                                                    <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                                        <label style={{ fontSize: "11px", fontWeight: 700, color: "#cbd5e1" }}>{q}</label>
                                                        <input 
                                                            placeholder="Type your answer here..."
                                                            value={surveyResponses[q] || ""}
                                                            onChange={e => setSurveyResponses({ ...surveyResponses, [q]: e.target.value })}
                                                            style={{ width: "100%", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "10px 12px", color: "#fff", fontSize: "12px", boxSizing: "border-box" }}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                            <button 
                                                onClick={async () => {
                                                    try {
                                                        const surveyText = Object.entries(surveyResponses)
                                                            .map(([q, a]) => `[Survey Question: ${q}]: ${a}`)
                                                            .join("\n");
                                                        
                                                        await fetch(`${import.meta.env.VITE_API_URL}/guests/${registeredGuest._id}`, {
                                                            method: "PATCH",
                                                            headers: { "Content-Type": "application/json" },
                                                            body: JSON.stringify({
                                                                notes: (registeredGuest.notes || "") + "\n\n--- POST-EVENT SURVEY RESPONSE ---\n" + surveyText
                                                            })
                                                        });
                                                        setSurveySubmitted(true);
                                                    } catch (err) {
                                                        console.error("Survey submission failed:", err);
                                                        setSurveySubmitted(true);
                                                    }
                                                }}
                                                style={{ 
                                                    background: currentThemeStyle.accentGradient, 
                                                    color: "#fff", 
                                                    border: "none", 
                                                    padding: "12px", 
                                                    borderRadius: "10px", 
                                                    fontSize: "12px", 
                                                    fontWeight: 800, 
                                                    cursor: "pointer",
                                                    textTransform: "uppercase"
                                                }}
                                            >
                                                Submit Feedback
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Action buttons */}
                        <div style={{ display: "flex", gap: "12px" }}>
                            <button 
                                onClick={() => window.print()}
                                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#cbd5e1", padding: "10px 20px", borderRadius: "10px", fontSize: "13px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
                            >
                                <Download size={15} /> Download / Print Pass
                            </button>
                            <Link 
                                to="/"
                                style={{ background: config.colors.accent, textDecoration: "none", color: "#fff", padding: "10px 24px", borderRadius: "10px", fontSize: "13px", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px" }}
                                className="glow-btn"
                            >
                                <ArrowLeft size={15} /> Exit Portal
                            </Link>
                        </div>
                    </div>
                )}
            </main>

            {/* Public Footer */}
            <footer style={{ 
                marginTop: "auto", 
                padding: "2rem", 
                borderTop: `1px solid ${currentThemeStyle.border}`, 
                background: "rgba(0,0,0,0.3)", 
                textAlign: "center", 
                fontSize: "11px", 
                color: "rgba(255,255,255,0.3)", 
                position: "relative",
                zIndex: 1
            }}>
                Powered by <strong style={{ color: "#fff" }}>Planora Smart Event OS</strong> — Secure blockchain verified ticketing.
            </footer>

            {/* Sticky Cookie Consent Banner */}
            {config.privacy.cookieBanner && !cookieBannerAccepted && (
                <div style={{ 
                    position: "fixed", 
                    bottom: 0, 
                    left: 0,
                    right: 0,
                    background: "rgba(10, 10, 12, 0.95)", 
                    borderTop: `1px solid ${currentThemeStyle.border}`, 
                    padding: "16px 24px", 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center", 
                    zIndex: 1000, 
                    fontSize: "12px", 
                    backdropFilter: "blur(15px)", 
                    WebkitBackdropFilter: "blur(15px)",
                    fontFamily: "'Inter', sans-serif" 
                }}>
                    <span>We use cookies to enhance your event registration experience. By continuing, you agree to our use of cookies.</span>
                    <button 
                        onClick={() => {
                            try {
                                localStorage.setItem(`cookie_accepted_${eventId}`, "true");
                            } catch (e) {}
                            setCookieBannerAccepted(true);
                        }}
                        style={{ 
                            background: config.colors.accent, 
                            border: "none", 
                            color: "#fff", 
                            padding: "6px 16px", 
                            borderRadius: "6px", 
                            fontWeight: 800, 
                            cursor: "pointer" 
                        }}
                    >
                        Accept
                    </button>
                </div>
            )}
        </div>
    );
}
