import { useState, useEffect, useMemo } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { 
    Sparkles, Palette, Layers, Monitor, Tablet, Phone, Eye, Save, Send, 
    Plus, Trash2, HelpCircle, MapPin, Calendar, Clock, Check, RefreshCw, 
    ChevronDown, ChevronUp, ChevronRight, UserPlus, ShieldAlert
} from "lucide-react";

export default function RegistrationBuilder() {
    const { user, events, selectedEventId, addNotification, hasEditorAccess } = useOutletContext();
    const navigate = useNavigate();

    const [activeEventDetails, setActiveEventDetails] = useState(null);

    // Find the active event and merge with fetched backend configuration details
    const activeEvent = useMemo(() => {
        const listEvent = events.find(e => (e.id || e._id) === selectedEventId) || null;
        if (!activeEventDetails) return listEvent;
        return { ...listEvent, ...activeEventDetails };
    }, [events, selectedEventId, activeEventDetails]);

    // State for Builder Configuration
    const [selectedTheme, setSelectedTheme] = useState("quantum-cyber");
    const [colors, setColors] = useState({
        primary: "#a855f7",     // Primary Gradient (e.g. purple)
        secondary: "#ec4899",   // Secondary Gradient (e.g. pink)
        accent: "#06b6d4",      // Accent Color (e.g. cyan)
        glow: "#a855f7"         // Glow/Shadow Color
    });

    const [widgets, setWidgets] = useState({
        header: true,
        countdown: true,
        tickets: true,
        speakers: true,
        map: true,
        faq: true,
        form: true
    });

    const [speakers, setSpeakers] = useState([
        { id: 1, name: "Dr. Elena Vance", role: "AI Research Lead, Quantum Labs", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150" },
        { id: 2, name: "Marcus Chen", role: "Principal Engineer, CyberNet", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" },
        { id: 3, name: "Sarah Jenkins", role: "Futurist & Author, Tech Horizon", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150" }
    ]);

    const [faqs, setFaqs] = useState([
        { id: 1, q: "Is this event online or in-person?", a: "This is a hybrid experience. You can attend physically at the venue or stream virtually via our high-fidelity cyber-portal." },
        { id: 2, q: "Do I get a physical entry badge?", a: "Yes! Fully verified attendees will receive a glowing, high-fidelity digital badge which can be printed or scanned on-site." }
    ]);

    // NEW Cvent-style Stepper Configuration States
    const [selectedFont, setSelectedFont] = useState("Inter");
    const [logoUrl, setLogoUrl] = useState("");
    const [fields, setFields] = useState({
        whatsapp: true,
        category: true,
        familySize: true,
        dietary: true,
        linkedIn: true,
        portfolio: true,
        notes: true,
        customQuestionEnabled: false,
        customQuestion: "What is your main goal for this event?"
    });
    const [privacy, setPrivacy] = useState({
        requireConsent: false,
        consentText: "I agree to the terms and privacy policy of Planora events.",
        cookieBanner: false
    });
    const [emailConfig, setEmailConfig] = useState({
        subject: "Registration Confirmed - Pass Issued!",
        body: "Thank you for registering. Your digital entry pass and badge details are attached below."
    });
    const [survey, setSurvey] = useState({
        enabled: false,
        questions: [
            "Rate your overall event experience (1-5)",
            "Any other suggestions or comments?"
        ]
    });

    // Editor UI State
    const [device, setDevice] = useState("desktop"); // "desktop" | "tablet" | "mobile"
    const [isSaving, setIsSaving] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [previewMode, setPreviewMode] = useState(false); // hides sidebar for full preview
    const [expandedFaq, setExpandedFaq] = useState(null);
    const [activeWizardStep, setActiveWizardStep] = useState("theme"); // "theme" | "website" | "registration" | "privacy" | "email" | "survey"
    const [activeThemeSubTab, setActiveThemeSubTab] = useState("colors"); // "colors" | "fonts" | "logos"

    // Load configuration directly from active event details fetched from the API
    useEffect(() => {
        const loadEventConfig = async () => {
            if (!selectedEventId) return;
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/events/${selectedEventId}`);
                if (res.ok) {
                    const data = await res.json();
                    setActiveEventDetails(data);
                    
                    if (data.registrationConfig) {
                        const config = data.registrationConfig;
                        if (config.theme) setSelectedTheme(config.theme);
                        if (config.colors) setColors(config.colors);
                        if (config.widgets) setWidgets(config.widgets);
                        if (config.speakers) setSpeakers(config.speakers);
                        if (config.faqs) setFaqs(config.faqs);
                        
                        // Set advanced stepper features
                        if (config.font) setSelectedFont(config.font);
                        if (config.logoUrl !== undefined) setLogoUrl(config.logoUrl);
                        if (config.fields) setFields(config.fields);
                        if (config.privacy) setPrivacy(config.privacy);
                        if (config.email) setEmailConfig(config.email);
                        if (config.survey) setSurvey(config.survey);
                    } else {
                        // Reset to default presets if no config exists yet for this event
                        setSelectedTheme("quantum-cyber");
                        setColors({
                            primary: "#a855f7",
                            secondary: "#ec4899",
                            accent: "#06b6d4",
                            glow: "#a855f7"
                        });
                        setWidgets({
                            header: true,
                            countdown: true,
                            tickets: true,
                            speakers: true,
                            map: true,
                            faq: true,
                            form: true
                        });
                        setSpeakers([
                            { id: 1, name: "Dr. Elena Vance", role: "AI Research Lead, Quantum Labs", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150" },
                            { id: 2, name: "Marcus Chen", role: "Principal Engineer, CyberNet", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" },
                            { id: 3, name: "Sarah Jenkins", role: "Futurist & Author, Tech Horizon", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150" }
                        ]);
                        setFaqs([
                            { id: 1, q: "Is this event online or in-person?", a: "This is a hybrid experience. You can attend physically at the venue or stream virtually via our high-fidelity cyber-portal." },
                            { id: 2, q: "Do I get a physical entry badge?", a: "Yes! Fully verified attendees will receive a glowing, high-fidelity digital badge which can be printed or scanned on-site." }
                        ]);
                        setSelectedFont("Inter");
                        setLogoUrl("");
                        setFields({
                            whatsapp: true,
                            category: true,
                            familySize: true,
                            dietary: true,
                            linkedIn: true,
                            portfolio: true,
                            notes: true,
                            customQuestionEnabled: false,
                            customQuestion: "What is your main goal for this event?"
                        });
                        setPrivacy({
                            requireConsent: false,
                            consentText: "I agree to the terms and privacy policy of Planora events.",
                            cookieBanner: false
                        });
                        setEmailConfig({
                            subject: "Registration Confirmed - Pass Issued!",
                            body: "Thank you for registering. Your digital entry pass and badge details are attached below."
                        });
                        setSurvey({
                            enabled: false,
                            questions: [
                                "Rate your overall event experience (1-5)",
                                "Any other suggestions or comments?"
                            ]
                        });
                    }
                }
            } catch (err) {
                console.error("Failed to load event config:", err);
            }
        };
        loadEventConfig();
    }, [selectedEventId]);

    // Handle Speakers/FAQ mutations
    const addSpeaker = () => {
        setSpeakers([...speakers, { id: Date.now(), name: "New Speaker", role: "Role & Affiliation", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150" }]);
    };

    const removeSpeaker = (id) => {
        setSpeakers(speakers.filter(s => s.id !== id));
    };

    const updateSpeaker = (id, field, val) => {
        setSpeakers(speakers.map(s => s.id === id ? { ...s, [field]: val } : s));
    };

    const addFaq = () => {
        setFaqs([...faqs, { id: Date.now(), q: "New Question?", a: "Answer text goes here." }]);
    };

    const removeFaq = (id) => {
        setFaqs(faqs.filter(f => f.id !== id));
    };

    const updateFaq = (id, field, val) => {
        setFaqs(faqs.map(f => f.id === id ? { ...f, [field]: val } : f));
    };

    const addSurveyQuestion = () => {
        setSurvey({ ...survey, questions: [...survey.questions, "New Question?"] });
    };

    const removeSurveyQuestion = (index) => {
        const updated = [...survey.questions];
        updated.splice(index, 1);
        setSurvey({ ...survey, questions: updated });
    };

    const updateSurveyQuestion = (index, val) => {
        const updated = [...survey.questions];
        updated[index] = val;
        setSurvey({ ...survey, questions: updated });
    };

    const handleSave = async (silent = false) => {
        if (!activeEvent || !hasEditorAccess) return;
        setIsSaving(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/events/${activeEvent.id || activeEvent._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    registrationConfig: {
                        theme: selectedTheme,
                        colors,
                        widgets,
                        speakers,
                        faqs,
                        font: selectedFont,
                        logoUrl,
                        fields,
                        privacy,
                        email: emailConfig,
                        survey
                    }
                })
            });

            if (response.ok) {
                const data = await response.json();
                setActiveEventDetails(data);
                if (!silent) addNotification("Design Saved", "Your registration configuration has been synchronized successfully.", "success");
            } else {
                throw new Error("Failed to save configuration");
            }
        } catch (err) {
            console.error("Save error:", err);
            addNotification("Save Failed", "Could not sync template configuration.", "warning");
        } finally {
            setIsSaving(false);
        }
    };

    const handlePublish = async () => {
        if (!activeEvent || !hasEditorAccess) return;
        setIsPublishing(true);
        // Automatically save first
        await handleSave(true);
        
        // Mock publication trigger
        setTimeout(() => {
            setIsPublishing(false);
            addNotification("Microsite Published Live", `Registration portal for "${activeEvent.name}" is now live!`, "success");
        }, 1200);
    };

    // Calculate dates/times for countdown mockup
    const daysLeft = useMemo(() => {
        if (!activeEvent || !activeEvent.date) return { d: "00", h: "00", m: "00" };
        const diff = new Date(activeEvent.date).getTime() - Date.now();
        if (diff <= 0) return { d: "00", h: "00", m: "00" };
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / (1000 * 60)) % 60);
        return {
            d: d.toString().padStart(2, "0"),
            h: h.toString().padStart(2, "0"),
            m: m.toString().padStart(2, "0")
        };
    }, [activeEvent]);

    if (!activeEvent) {
        return (
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "80vh", gap: "1rem" }}>
                <ShieldAlert size={48} color="#ef4444" />
                <h2 style={{ color: "#fff", fontWeight: 800 }}>No Event Context Selected</h2>
                <p style={{ color: "#64748b" }}>Please select or create an event from the sidebar dropdown first.</p>
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
            accentGradient: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
            glowShadow: `0 0 40px ${colors.glow}22`
        },
        "aero-glass": {
            bg: "#050d18",
            cardBg: "rgba(255, 255, 255, 0.03)",
            border: "rgba(255, 255, 255, 0.08)",
            font: "'Outfit', sans-serif",
            accentGradient: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.primary} 100%)`,
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

    const currentThemeStyle = themeStyles[selectedTheme] || themeStyles["quantum-cyber"];

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 72px)", color: "#fff", fontFamily: "'Inter', sans-serif" }}>
            <style>{`
                .builder-btn { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; }
                .builder-btn:hover { transform: translateY(-1px); }
                .active-tab { border-bottom: 2px solid #f97316; color: #fff !important; }
                .widget-toggle { appearance: none; width: 40px; height: 20px; background: #27272a; border-radius: 20px; position: relative; cursor: pointer; transition: background 0.3s; outline: none; }
                .widget-toggle:checked { background: #f97316; }
                .widget-toggle::before { content: ''; position: absolute; width: 16px; height: 16px; border-radius: 50%; background: #fff; top: 2px; left: 2px; transition: transform 0.3s; }
                .widget-toggle:checked::before { transform: translateX(20px); }
                .device-frame-desktop { width: 100%; border-radius: 16px; }
                .device-frame-tablet { width: 768px; border-radius: 24px; margin: 0 auto; }
                .device-frame-mobile { width: 375px; border-radius: 32px; margin: 0 auto; }
                .theme-card { transition: all 0.2s; border: 2px solid transparent; cursor: pointer; }
                .theme-card:hover { transform: scale(1.02); }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3f3f46; }
                @keyframes pulseGlow {
                    0% { box-shadow: 0 0 15px rgba(168, 85, 247, 0.2); }
                    50% { box-shadow: 0 0 25px rgba(168, 85, 247, 0.4); }
                    100% { box-shadow: 0 0 15px rgba(168, 85, 247, 0.2); }
                }
            `}</style>

            {/* Top Toolbar */}
            <div style={{ display: "flex", justifySelf: "flex-start", justifyContent: "space-between", alignItems: "center", padding: "0.85rem 1.5rem", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", background: "rgba(9, 9, 11, 0.6)", backdropFilter: "blur(10px)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(249, 115, 22, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#f97316" }}>
                        <Sparkles size={18} style={{ margin: "auto" }} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: "14px", fontWeight: 800, margin: 0, letterSpacing: "-0.01em" }}>Registration Designer</h2>
                        <p style={{ fontSize: "11px", color: "#64748b", margin: 0 }}>Design a futuristic registration portal for <strong>{activeEvent.name}</strong></p>
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    {/* Device Switcher */}
                    <div style={{ display: "flex", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "2px" }}>
                        {[
                            { id: "desktop", icon: <Monitor size={15} /> },
                            { id: "tablet", icon: <Tablet size={15} /> },
                            { id: "mobile", icon: <Phone size={15} /> }
                        ].map(d => (
                            <button 
                                key={d.id}
                                onClick={() => setDevice(d.id)}
                                style={{
                                    border: "none",
                                    background: device === d.id ? "rgba(255,255,255,0.08)" : "transparent",
                                    color: device === d.id ? "#fff" : "#64748b",
                                    padding: "6px 10px",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center"
                                }}
                            >
                                {d.icon}
                            </button>
                        ))}
                    </div>

                    <button 
                        onClick={() => setPreviewMode(!previewMode)}
                        style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", padding: "8px 12px", borderRadius: "8px", color: "#cbd5e1", fontSize: "12px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                    >
                        <Eye size={14} />
                        {previewMode ? "Editor View" : "Full Preview"}
                    </button>

                    <button 
                        onClick={() => handleSave(false)}
                        disabled={isSaving}
                        style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", padding: "8px 14px", borderRadius: "8px", color: "#cbd5e1", fontSize: "12px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                        className="builder-btn"
                    >
                        {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                        Save Config
                    </button>

                    <button 
                        onClick={handlePublish}
                        disabled={isPublishing}
                        style={{ background: "linear-gradient(135deg, #10b981, #059669)", border: "none", padding: "8px 16px", borderRadius: "8px", color: "#fff", fontSize: "12px", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)" }}
                        className="builder-btn"
                    >
                        {isPublishing ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                        Publish Microsite
                    </button>

                    <a 
                        href={`/register/${activeEvent.id || activeEvent._id}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ background: "rgba(6, 182, 212, 0.15)", border: "1px solid rgba(6, 182, 212, 0.3)", padding: "8px 16px", borderRadius: "8px", color: "#06b6d4", fontSize: "12px", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", textDecoration: "none" }}
                        className="builder-btn"
                    >
                        <Eye size={14} />
                        View Live Portal ↗
                    </a>
                </div>
            </div>

            {/* Horizontal Cvent-style Wizard Stepper Bar */}
            <div style={{ 
                background: "rgba(10, 10, 14, 0.9)",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                padding: "0.75rem 2rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
                zIndex: 20
            }}>
                <div style={{ fontSize: "10px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Choose your templates
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", overflowX: "auto", paddingBottom: "2px" }} className="custom-scrollbar">
                    {[
                        { id: "theme", label: "Theme", desc: "Colors, Fonts & Branding" },
                        { id: "website", label: "Website", desc: "Widgets & Content Layout" },
                        { id: "registration", label: "Registration", desc: "Form Fields & Settings" },
                        { id: "privacy", label: "Data Privacy", desc: "Terms & Consents" },
                        { id: "email", label: "Email", desc: "Invitations & Confirmations" },
                        { id: "survey", label: "Survey", desc: "Feedback Questionnaires" }
                    ].map((step, idx) => {
                        const isCurrent = activeWizardStep === step.id;
                        return (
                            <div 
                                key={step.id}
                                onClick={() => setActiveWizardStep(step.id)}
                                style={{ 
                                    display: "flex", 
                                    alignItems: "center", 
                                    gap: "8px", 
                                    cursor: "pointer", 
                                    padding: "6px 12px", 
                                    borderRadius: "8px",
                                    background: isCurrent ? "rgba(249, 115, 22, 0.08)" : "transparent",
                                    border: isCurrent ? "1px solid rgba(249, 115, 22, 0.2)" : "1px solid transparent",
                                    transition: "all 0.2s"
                                }}
                            >
                                <div style={{ 
                                    width: "20px", 
                                    height: "20px", 
                                    borderRadius: "50%", 
                                    background: isCurrent ? "#f97316" : "rgba(255, 255, 255, 0.1)", 
                                    color: isCurrent ? "#fff" : "#94a3b8", 
                                    display: "flex", 
                                    alignItems: "center", 
                                    justifyContent: "center", 
                                    fontSize: "10px", 
                                    fontWeight: 900 
                                }}>
                                    {idx + 1}
                                </div>
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                    <span style={{ fontSize: "12px", fontWeight: 700, color: isCurrent ? "#fff" : "#94a3b8" }}>{step.label}</span>
                                    <span style={{ fontSize: "9px", color: isCurrent ? "rgba(249, 115, 22, 0.7)" : "#64748b", whiteSpace: "nowrap" }}>{step.desc}</span>
                                </div>
                                {idx < 5 && <ChevronRight size={12} color="#333" style={{ marginLeft: "8px" }} />}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Split Screen Panel */}
            <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
                {/* Left Panel - Editor Controls */}
                {!previewMode && (
                    <div className="custom-scrollbar" style={{ width: "380px", borderRight: "1px solid rgba(255,255,255,0.08)", background: "rgba(9, 9, 11, 0.45)", display: "flex", flexDirection: "column", overflowY: "auto" }}>
                        {/* Editor Controls Body */}
                        <div style={{ padding: "1.5rem", flex: 1 }}>
                            
                            {/* STEP 1: THEME */}
                            {activeWizardStep === "theme" && (
                                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                                    {/* Cvent-style Sub Tabs: Colors, Fonts, Logos */}
                                    <div style={{ display: "flex", background: "rgba(0,0,0,0.2)", borderRadius: "8px", padding: "3px" }}>
                                        {[
                                            { id: "colors", label: "Colors" },
                                            { id: "fonts", label: "Fonts" },
                                            { id: "logos", label: "Logos" }
                                        ].map(sub => (
                                            <button
                                                key={sub.id}
                                                onClick={() => setActiveThemeSubTab(sub.id)}
                                                style={{
                                                    flex: 1,
                                                    border: "none",
                                                    background: activeThemeSubTab === sub.id ? "rgba(255,255,255,0.08)" : "transparent",
                                                    color: activeThemeSubTab === sub.id ? "#fff" : "#64748b",
                                                    padding: "6px 0",
                                                    fontSize: "11px",
                                                    fontWeight: 700,
                                                    borderRadius: "6px",
                                                    cursor: "pointer"
                                                }}
                                            >
                                                {sub.label}
                                            </button>
                                        ))}
                                    </div>

                                    {activeThemeSubTab === "colors" && (
                                        <>
                                            <div>
                                                <h3 style={{ fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>Theme Presets</h3>
                                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                                    {[
                                                        { id: "quantum-cyber", name: "Quantum Cyber", desc: "Neon cyberpunk elements", preview: "linear-gradient(135deg, #7c3aed, #db2777)" },
                                                        { id: "aero-glass", name: "Aero Glass", desc: "Frosted mesh glassmorphism", preview: "linear-gradient(135deg, #06b6d4, #3b82f6)" },
                                                        { id: "solar-flare", name: "Solar Flare", desc: "Vibrant solar energy gradient", preview: "linear-gradient(135deg, #f97316, #ef4444)" },
                                                        { id: "dark-stealth", name: "Stealth Mono", desc: "Matte black & terminal green", preview: "linear-gradient(135deg, #18181b, #10b981)" }
                                                    ].map(t => (
                                                        <div 
                                                            key={t.id}
                                                            onClick={() => setSelectedTheme(t.id)}
                                                            className="theme-card"
                                                            style={{
                                                                background: "rgba(255,255,255,0.02)",
                                                                border: `2px solid ${selectedTheme === t.id ? '#f97316' : 'rgba(255,255,255,0.06)'}`,
                                                                borderRadius: "12px",
                                                                padding: "10px",
                                                                position: "relative"
                                                            }}
                                                        >
                                                            <div style={{ height: "40px", background: t.preview, borderRadius: "6px", marginBottom: "8px" }}></div>
                                                            <div style={{ fontSize: "11px", fontWeight: 800, color: "#fff" }}>{t.name}</div>
                                                            <div style={{ fontSize: "9px", color: "#64748b", marginTop: "2px" }}>{t.desc}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1.5rem" }}>
                                                <h3 style={{ fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>Custom Color Palette</h3>
                                                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                                    {[
                                                        { key: "primary", label: "Gradient Start" },
                                                        { key: "secondary", label: "Gradient End" },
                                                        { key: "accent", label: "Interactive Accent" },
                                                        { key: "glow", label: "Backdrop Glow" }
                                                    ].map(c => (
                                                        <div key={c.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                            <span style={{ fontSize: "12px", color: "#cbd5e1" }}>{c.label}</span>
                                                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                                <span style={{ fontFamily: "monospace", fontSize: "11px", color: "#64748b" }}>{colors[c.key]?.toUpperCase()}</span>
                                                                <div style={{ position: "relative", width: "24px", height: "24px", borderRadius: "50%", background: colors[c.key], border: "2px solid #fff", cursor: "pointer", overflow: "hidden" }}>
                                                                    <input 
                                                                        type="color" 
                                                                        value={colors[c.key]}
                                                                        onChange={(e) => setColors({ ...colors, [c.key]: e.target.value })}
                                                                        style={{ position: "absolute", top: -5, left: -5, width: 40, height: 40, cursor: "pointer", opacity: 0 }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {activeThemeSubTab === "fonts" && (
                                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                            <h3 style={{ fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Typography Fonts</h3>
                                            <p style={{ fontSize: "10px", color: "#64748b", margin: 0 }}>Select the visual typeface styling for your registration portal.</p>
                                            
                                            {[
                                                { id: "Inter", name: "Inter (Sans-Serif)", style: "'Inter', sans-serif" },
                                                { id: "Outfit", name: "Outfit (Modern Round)", style: "'Outfit', sans-serif" },
                                                { id: "Playfair Display", name: "Playfair Display (Elegant Serif)", style: "'Playfair Display', serif" },
                                                { id: "JetBrains Mono", name: "JetBrains Mono (Console)", style: "'JetBrains Mono', monospace" }
                                            ].map(f => (
                                                <div 
                                                    key={f.id}
                                                    onClick={() => setSelectedFont(f.id)}
                                                    style={{ 
                                                        background: "rgba(255,255,255,0.02)", 
                                                        border: `1px solid ${selectedFont === f.id ? '#f97316' : 'rgba(255,255,255,0.06)'}`, 
                                                        padding: "12px", 
                                                        borderRadius: "10px", 
                                                        cursor: "pointer",
                                                        fontFamily: f.style
                                                    }}
                                                >
                                                    <div style={{ fontSize: "14px", color: "#fff" }}>Aa Bb Cc Dd</div>
                                                    <div style={{ fontSize: "10px", color: "#64748b", marginTop: "4px" }}>{f.name}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {activeThemeSubTab === "logos" && (
                                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                            <h3 style={{ fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Brand Logo</h3>
                                            <p style={{ fontSize: "10px", color: "#64748b", margin: 0 }}>Provide a logo URL image to customize headers on the attendee portal.</p>
                                            <input 
                                                placeholder="https://example.com/logo.png"
                                                value={logoUrl}
                                                onChange={e => setLogoUrl(e.target.value)}
                                                style={{ width: "100%", background: "#09090b", border: "1px solid #27272a", color: "#fff", padding: "10px", borderRadius: "8px", fontSize: "12px" }}
                                            />
                                            {logoUrl && (
                                                <div style={{ background: "rgba(255,255,255,0.02)", padding: "1rem", borderRadius: "10px", border: "1px dashed rgba(255,255,255,0.06)", display: "flex", justifyContent: "center" }}>
                                                    <img src={logoUrl} alt="Logo Preview" style={{ maxHeight: "40px", objectFit: "contain" }} onError={(e) => e.target.style.display = "none"} />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* STEP 2: WEBSITE */}
                            {activeWizardStep === "website" && (
                                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                                    <div>
                                        <h3 style={{ fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>Toggle Layout Widgets</h3>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                            {[
                                                { key: "header", label: "Event Header Banner", desc: "Hero event title and brand header block" },
                                                { key: "countdown", label: "Countdown Timer", desc: "Futuristic real-time countdown clock" },
                                                { key: "form", label: "Cyber Registration Form", desc: "Attendee registration form intake widget" },
                                                { key: "speakers", label: "Speakers Spotlight", desc: "Profile block of keynote speakers" },
                                                { key: "map", label: "Venue Map Block", desc: "Map widget with venue metadata" },
                                                { key: "faq", label: "FAQ Accordion", desc: "Event Q&A info panel" }
                                            ].map(w => (
                                                <div key={w.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.03)", padding: "10px", borderRadius: "10px" }}>
                                                    <div style={{ flex: 1, paddingRight: "10px" }}>
                                                        <div style={{ fontSize: "12px", fontWeight: 700 }}>{w.label}</div>
                                                        <div style={{ fontSize: "9px", color: "#64748b", marginTop: "2px" }}>{w.desc}</div>
                                                    </div>
                                                    <input 
                                                        type="checkbox"
                                                        checked={widgets[w.key]}
                                                        onChange={(e) => setWidgets({ ...widgets, [w.key]: e.target.checked })}
                                                        className="widget-toggle"
                                                        style={{ marginTop: "4px" }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {widgets.speakers && (
                                        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1.5rem" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                                                <h3 style={{ fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Speakers Spotlight</h3>
                                                <button onClick={addSpeaker} style={{ background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.2)", color: "#f97316", padding: "4px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}><Plus size={10} /> Add Speaker</button>
                                            </div>
                                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                                {speakers.map((s, idx) => (
                                                    <div key={s.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "10px", position: "relative" }}>
                                                        <button onClick={() => removeSpeaker(s.id)} style={{ position: "absolute", top: "10px", right: "10px", border: "none", background: "none", color: "#ef4444", cursor: "pointer" }}><Trash2 size={12} /></button>
                                                        <div style={{ fontSize: "10px", fontWeight: 800, color: "#f97316", marginBottom: "6px" }}>Speaker #{idx + 1}</div>
                                                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                                            <input placeholder="Full Name" value={s.name} onChange={e => updateSpeaker(s.id, "name", e.target.value)} style={{ background: "#09090b", border: "1px solid #27272a", color: "#fff", padding: "6px 8px", borderRadius: "6px", fontSize: "11px" }} />
                                                            <input placeholder="Role & Company" value={s.role} onChange={e => updateSpeaker(s.id, "role", e.target.value)} style={{ background: "#09090b", border: "1px solid #27272a", color: "#fff", padding: "6px 8px", borderRadius: "6px", fontSize: "11px" }} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {widgets.faq && (
                                        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1.5rem" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                                                <h3 style={{ fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>FAQ Briefings</h3>
                                                <button onClick={addFaq} style={{ background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.2)", color: "#f97316", padding: "4px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}><Plus size={10} /> Add FAQ</button>
                                            </div>
                                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                                {faqs.map((f, idx) => (
                                                    <div key={f.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "10px", position: "relative" }}>
                                                        <button onClick={() => removeFaq(f.id)} style={{ position: "absolute", top: "10px", right: "10px", border: "none", background: "none", color: "#ef4444", cursor: "pointer" }}><Trash2 size={12} /></button>
                                                        <div style={{ fontSize: "10px", fontWeight: 800, color: "#f97316", marginBottom: "6px" }}>FAQ #{idx + 1}</div>
                                                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                                            <input placeholder="Question" value={f.q} onChange={e => updateFaq(f.id, "q", e.target.value)} style={{ background: "#09090b", border: "1px solid #27272a", color: "#fff", padding: "6px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 600 }} />
                                                            <textarea placeholder="Answer text" value={f.a} onChange={e => updateFaq(f.id, "a", e.target.value)} style={{ background: "#09090b", border: "1px solid #27272a", color: "#fff", padding: "6px 8px", borderRadius: "6px", fontSize: "11px", height: "50px", resize: "none" }} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* STEP 3: REGISTRATION */}
                            {activeWizardStep === "registration" && (
                                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                                    <div>
                                        <h3 style={{ fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>Attendee Form Fields</h3>
                                        <p style={{ fontSize: "10px", color: "#64748b", margin: "0 0 1rem" }}>Select which fields are shown to the attendees on the registration form.</p>
                                        
                                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                            {[
                                                { key: "whatsapp", label: "Phone / WhatsApp Number" },
                                                { key: "category", label: "Segment Category Select" },
                                                { key: "familySize", label: "Attendees Group Size" },
                                                { key: "dietary", label: "Dietary Preference Selector" },
                                                { key: "linkedIn", label: "LinkedIn URL Profile" },
                                                { key: "portfolio", label: "Portfolio / GitHub URL" },
                                                { key: "notes", label: "Notes / Project Comments" }
                                            ].map(fld => (
                                                <label key={fld.key} style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.03)", padding: "10px", borderRadius: "8px", cursor: "pointer" }}>
                                                    <input 
                                                        type="checkbox"
                                                        checked={fields[fld.key]}
                                                        onChange={(e) => setFields({ ...fields, [fld.key]: e.target.checked })}
                                                        style={{ accentColor: "#f97316" }}
                                                    />
                                                    <span style={{ fontSize: "12px", color: "#cbd5e1" }}>{fld.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1.5rem" }}>
                                        <h3 style={{ fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>Custom Form Question</h3>
                                        <label style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px", cursor: "pointer" }}>
                                            <input 
                                                type="checkbox"
                                                checked={fields.customQuestionEnabled}
                                                onChange={(e) => setFields({ ...fields, customQuestionEnabled: e.target.checked })}
                                                style={{ accentColor: "#f97316" }}
                                            />
                                            <span style={{ fontSize: "12px", fontWeight: 700 }}>Enable Custom Question</span>
                                        </label>
                                        
                                        {fields.customQuestionEnabled && (
                                            <input 
                                                placeholder="E.g., How did you hear about us?"
                                                value={fields.customQuestion}
                                                onChange={(e) => setFields({ ...fields, customQuestion: e.target.value })}
                                                style={{ width: "100%", background: "#09090b", border: "1px solid #27272a", color: "#fff", padding: "8px 10px", borderRadius: "8px", fontSize: "11px" }}
                                            />
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* STEP 4: DATA PRIVACY */}
                            {activeWizardStep === "privacy" && (
                                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                                    <div>
                                        <h3 style={{ fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>Legal & Privacy Terms</h3>
                                        <p style={{ fontSize: "10px", color: "#64748b", margin: "0 0 1rem" }}>Enforce compliance and agreements at the checkout/submit portal.</p>
                                        
                                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                            <label style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.03)", padding: "10px", borderRadius: "8px", cursor: "pointer" }}>
                                                <input 
                                                    type="checkbox"
                                                    checked={privacy.requireConsent}
                                                    onChange={(e) => setPrivacy({ ...privacy, requireConsent: e.target.checked })}
                                                    style={{ accentColor: "#f97316" }}
                                                />
                                                <span style={{ fontSize: "12px", fontWeight: 700 }}>Require Terms Agreement Checkbox</span>
                                            </label>

                                            {privacy.requireConsent && (
                                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                                    <span style={{ fontSize: "10px", color: "#64748b" }}>Consent Text:</span>
                                                    <textarea 
                                                        value={privacy.consentText}
                                                        onChange={(e) => setPrivacy({ ...privacy, consentText: e.target.value })}
                                                        style={{ width: "100%", background: "#09090b", border: "1px solid #27272a", color: "#fff", padding: "8px 10px", borderRadius: "8px", fontSize: "11px", height: "60px", resize: "none" }}
                                                    />
                                                </div>
                                            )}

                                            <label style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.03)", padding: "10px", borderRadius: "8px", cursor: "pointer" }}>
                                                <input 
                                                    type="checkbox"
                                                    checked={privacy.cookieBanner}
                                                    onChange={(e) => setPrivacy({ ...privacy, cookieBanner: e.target.checked })}
                                                    style={{ accentColor: "#f97316" }}
                                                />
                                                <span style={{ fontSize: "12px", fontWeight: 700 }}>Enable Cookie Consent Banner</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 5: EMAIL */}
                            {activeWizardStep === "email" && (
                                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                                    <div>
                                        <h3 style={{ fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>Confirmation Email Template</h3>
                                        <p style={{ fontSize: "10px", color: "#64748b", margin: "0 0 1rem" }}>Customize the email dispatched automatically to attendees upon registration.</p>
                                        
                                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                                <span style={{ fontSize: "11px", fontWeight: 700, color: "#cbd5e1" }}>Subject Line:</span>
                                                <input 
                                                    value={emailConfig.subject}
                                                    onChange={(e) => setEmailConfig({ ...emailConfig, subject: e.target.value })}
                                                    style={{ width: "100%", background: "#09090b", border: "1px solid #27272a", color: "#fff", padding: "8px 10px", borderRadius: "8px", fontSize: "11px" }}
                                                />
                                            </div>

                                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                                <span style={{ fontSize: "11px", fontWeight: 700, color: "#cbd5e1" }}>Body Welcome Message:</span>
                                                <textarea 
                                                    value={emailConfig.body}
                                                    onChange={(e) => setEmailConfig({ ...emailConfig, body: e.target.value })}
                                                    style={{ width: "100%", background: "#09090b", border: "1px solid #27272a", color: "#fff", padding: "8px 10px", borderRadius: "8px", fontSize: "11px", height: "120px", resize: "none" }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 6: SURVEY */}
                            {activeWizardStep === "survey" && (
                                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                                    <div>
                                        <h3 style={{ fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>Post-Event Survey Feedback</h3>
                                        <p style={{ fontSize: "10px", color: "#64748b", margin: "0 0 1rem" }}>Deploy optional survey forms for attendees to submit feedback post-event.</p>
                                        
                                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                            <label style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.03)", padding: "10px", borderRadius: "8px", cursor: "pointer" }}>
                                                <input 
                                                    type="checkbox"
                                                    checked={survey.enabled}
                                                    onChange={(e) => setSurvey({ ...survey, enabled: e.target.checked })}
                                                    style={{ accentColor: "#f97316" }}
                                                />
                                                <span style={{ fontSize: "12px", fontWeight: 700 }}>Enable Post-Event Survey</span>
                                            </label>

                                            {survey.enabled && (
                                                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1rem", display: "flex", flexDirection: "column", gap: "12px" }}>
                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                        <span style={{ fontSize: "11px", fontWeight: 700, color: "#cbd5e1" }}>Survey Questions:</span>
                                                        <button onClick={addSurveyQuestion} style={{ background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.2)", color: "#f97316", padding: "2px 6px", borderRadius: "4px", fontSize: "9px", fontWeight: 800, cursor: "pointer" }}><Plus size={8} /> Add</button>
                                                    </div>

                                                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                                        {survey.questions.map((q, qidx) => (
                                                            <div key={qidx} style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                                                                <input 
                                                                    value={q}
                                                                    onChange={(e) => updateSurveyQuestion(qidx, e.target.value)}
                                                                    style={{ flex: 1, background: "#09090b", border: "1px solid #27272a", color: "#fff", padding: "6px 8px", borderRadius: "6px", fontSize: "11px" }}
                                                                />
                                                                <button onClick={() => removeSurveyQuestion(qidx)} style={{ border: "none", background: "none", color: "#ef4444", cursor: "pointer" }}><Trash2 size={12} /></button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                )}

                {/* Right Panel - Live Preview Canvas */}
                <div style={{ flex: 1, background: "#09090b", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", overflow: "auto", backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px)", backgroundSize: "24px 24px" }}>
                    <div 
                        className={`device-frame-${device}`} 
                        style={{ 
                            background: currentThemeStyle.bg, 
                            border: "1px solid rgba(255,255,255,0.08)", 
                            height: device === "desktop" ? "100%" : "calc(100vh - 180px)",
                            display: "flex",
                            flexDirection: "column",
                            overflowY: "auto",
                            position: "relative",
                            boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
                            fontFamily: selectedFont === "Outfit" ? "'Outfit', sans-serif" : selectedFont === "Playfair Display" ? "'Playfair Display', serif" : selectedFont === "JetBrains Mono" ? "'JetBrains Mono', monospace" : "'Inter', sans-serif"
                        }}
                    >
                        {/* Dynamic Floating Backdrop Glow */}
                        <div style={{ position: "absolute", top: "-10%", left: "30%", width: "40%", height: "40%", background: `radial-gradient(circle, ${colors.primary}11 0%, transparent 70%)`, pointerEvents: "none", zIndex: 0 }}></div>
                        <div style={{ position: "absolute", bottom: "-10%", right: "20%", width: "50%", height: "50%", background: `radial-gradient(circle, ${colors.accent}0a 0%, transparent 70%)`, pointerEvents: "none", zIndex: 0 }}></div>

                        {/* Top builder watermark */}
                        <div style={{ display: "flex", justifySelf: "flex-start", justifyContent: "space-between", padding: "8px 16px", borderBottom: `1px solid ${currentThemeStyle.border}`, background: "rgba(0,0,0,0.2)", backdropFilter: "blur(5px)", zIndex: 10, fontSize: "9px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.05em", fontWeight: 700 }}>
                            <span>PREVIEW PORTAL — {activeWizardStep?.toUpperCase()}</span>
                            <span style={{ color: colors.accent, fontWeight: 900 }}>Powered by Planora IQ™</span>
                        </div>

                        {/* Import Google Fonts dynamically for Preview */}
                        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;700;900&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=JetBrains+Mono:wght@400;700&display=swap" />

                        {activeWizardStep === "email" ? (
                            /* ─── EMAIL TEMPLATE PREVIEW ─── */
                            <div style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem", width: "100%", boxSizing: "border-box", zIndex: 1 }}>
                                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", overflow: "hidden" }}>
                                    <div style={{ background: "rgba(255,255,255,0.04)", padding: "10px 16px", fontSize: "11px", display: "flex", flexDirection: "column", gap: "4px", borderBottom: "1px solid rgba(255,255,255,0.06)", fontFamily: "'Inter', sans-serif" }}>
                                        <div><strong style={{ color: "#64748b" }}>From:</strong> Planora Invitations &lt;noreply@planoraim.com&gt;</div>
                                        <div><strong style={{ color: "#64748b" }}>To:</strong> Jane Doe &lt;jane@example.com&gt;</div>
                                        <div><strong style={{ color: "#64748b" }}>Subject:</strong> {emailConfig.subject || "Registration Confirmed!"}</div>
                                    </div>
                                    <div style={{ padding: "2.5rem 1.5rem", background: "#f8fafc", color: "#1e293b", fontFamily: "'Outfit', sans-serif" }}>
                                        {/* Redesigned email content preview */}
                                        <div style={{ maxWidth: "480px", margin: "0 auto", background: "#ffffff", borderRadius: "20px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.03)" }}>
                                            {/* Mesh Header */}
                                            <div style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600')", backgroundSize: "cover", backgroundPosition: "center", padding: "35px 20px", textAlign: "center", position: "relative" }}>
                                                <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(255,255,255,0.7)" }}></div>
                                                <span style={{ position: "relative", zIndex: 5, background: "#ffffff", border: "1px solid rgba(0,0,0,0.06)", color: "#0f172a", padding: "4px 10px", borderRadius: "100px", fontSize: "9px", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" }}>Official Invitation</span>
                                                <h3 style={{ position: "relative", zIndex: 5, color: "#0f172a", fontSize: "20px", fontWeight: 900, margin: "8px 0 0 0", letterSpacing: "-0.02em" }}>{eventData.title || "InnovExpo 2027"}</h3>
                                            </div>
                                            
                                            <div style={{ padding: "25px 20px" }}>
                                                <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 12px 0" }}>Hello <strong>Jane Doe</strong>,</p>
                                                <div style={{ fontSize: "14px", color: "#334155", lineHeight: "1.6", whiteSpace: "pre-wrap", margin: "0 0 25px 0" }}>
                                                    {emailConfig.body || "You are cordially invited to attend our upcoming event. Your attendee details and entry badge are attached below."}
                                                </div>

                                                {/* Physical Badge Ticket Mockup */}
                                                <div style={{ maxWidth: "290px", margin: "20px auto", background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 8px 20px rgba(0,0,0,0.03)", overflow: "hidden", textAlign: "center" }}>
                                                    <div style={{ padding: "15px 15px 8px 15px" }}>
                                                        <div style={{ width: "35px", height: "6px", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "10px", margin: "0 auto 10px auto" }}></div>
                                                        <p style={{ margin: 0, fontSize: "8px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>EVENT ACCESS BADGE</p>
                                                        <h4 style={{ margin: "4px 0 2px 0", fontSize: "15px", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.01em" }}>{eventData.title || "InnovExpo 2027"}</h4>
                                                        <p style={{ margin: 0, fontSize: "9px", fontWeight: 800, color: "#ec4899", textTransform: "uppercase" }}>{eventData.date || "May 13th - 16th, 2027"} &bull; {eventData.city || "San Francisco, CA"}</p>
                                                    </div>
                                                    
                                                    {/* Ticket Perforated Line */}
                                                    <div style={{ position: "relative", height: "1px", borderTop: "2px dashed #e2e8f0", margin: "5px 0" }}>
                                                        <div style={{ position: "absolute", left: "-8px", top: "-8px", width: "15px", height: "15px", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "50%" }}></div>
                                                        <div style={{ position: "absolute", right: "-8px", top: "-8px", width: "15px", height: "15px", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "50%" }}></div>
                                                    </div>

                                                    {/* Bottom Marble Part */}
                                                    <div style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600')", backgroundSize: "cover", backgroundPosition: "center", padding: "20px 15px", textAlign: "center" }}>
                                                        <h5 style={{ margin: "0 0 4px 0", fontSize: "16px", fontWeight: 900, color: "#0f172a" }}>Jane Doe</h5>
                                                        <span style={{ display: "inline-block", background: colors.accent || "#ec4899", color: "#ffffff", fontSize: "8px", fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase", padding: "3px 10px", borderRadius: "100px", boxShadow: "0 3px 6px rgba(0,0,0,0.1)" }}>VIP PASS</span>
                                                        
                                                        {/* Barcode */}
                                                        <div style={{ marginTop: "18px", display: "inline-block", background: "rgba(255,255,255,0.9)", padding: "8px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.05)" }}>
                                                            <div style={{ display: "flex", gap: "2px", height: "20px", alignItems: "center", justifyContent: "center", marginBottom: "4px", opacity: 0.8 }}>
                                                                {[1,2,3,1,2,1,4,1,2,3,1,2,1,3].map((w, i) => <div key={i} style={{ height: "100%", background: "#0f172a", width: `${w}px` }}></div>)}
                                                            </div>
                                                            <div style={{ fontFamily: "monospace", fontSize: "9px", fontWeight: 800, color: "#475569" }}>TECH-CONF-77</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div style={{ display: "flex", justifyContent: "center", gap: "8px", margin: "20px 0" }}>
                                                    <button style={{ background: "#10b981", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 10px rgba(16,185,129,0.15)" }}>Confirm Attend</button>
                                                    <button style={{ background: "#ef4444", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 10px rgba(239,68,68,0.15)" }}>Decline Invite</button>
                                                </div>

                                                <div style={{ textAlign: "center", borderTop: "1px solid #f1f5f9", paddingTop: "15px", marginTop: "20px" }}>
                                                    <span style={{ color: "#2563eb", fontSize: "12px", fontWeight: 700, textDecoration: "underline", cursor: "pointer" }}>View Live Access Pass & Badge Details</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : activeWizardStep === "survey" ? (
                            /* ─── SURVEY FORM PREVIEW ─── */
                            <div style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem", width: "100%", boxSizing: "border-box", zIndex: 1 }}>
                                <div style={{ background: currentThemeStyle.cardBg, border: `1px solid ${currentThemeStyle.border}`, borderRadius: "16px", padding: "2rem", boxShadow: currentThemeStyle.glowShadow }}>
                                    <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                                        <span style={{ background: "rgba(255,255,255,0.05)", color: colors.accent, fontSize: "10px", fontWeight: 800, padding: "4px 10px", borderRadius: "100px", textTransform: "uppercase" }}>Post-Event Feedback</span>
                                        <h2 style={{ fontSize: "20px", fontWeight: 900, margin: "8px 0 4px" }}>Event Survey</h2>
                                        <p style={{ fontSize: "11px", color: "#64748b", margin: 0 }}>Help us improve future events by answering a few short questions.</p>
                                    </div>
                                    
                                    {!survey.enabled ? (
                                        <div style={{ textAlign: "center", padding: "2rem 0", color: "#64748b", fontSize: "12px" }}>
                                            The post-event survey is currently disabled. Toggle it on in the sidebar editor to configure feedback questions.
                                        </div>
                                    ) : (
                                        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                                            {survey.questions.map((q, idx) => (
                                                <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                                    <label style={{ fontSize: "12px", fontWeight: 700, color: "#cbd5e1" }}>{idx + 1}. {q}</label>
                                                    <input 
                                                        placeholder="Type your response here..." 
                                                        disabled
                                                        style={{ width: "100%", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "8px 12px", color: "#fff", fontSize: "12px" }}
                                                    />
                                                </div>
                                            ))}
                                            <button disabled style={{ background: currentThemeStyle.accentGradient, color: "#fff", border: "none", padding: "10px", borderRadius: "8px", fontSize: "12px", fontWeight: 800, cursor: "not-allowed", textTransform: "uppercase" }}>
                                                Submit Survey Responses
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            /* ─── LANDING PORTAL PREVIEW ─── */
                            <>
                                {/* 1. Header widget */}
                                {widgets.header && (
                                    <div style={{ background: `linear-gradient(135deg, ${colors.primary}22 0%, ${colors.secondary}05 100%)`, padding: "3rem 2rem", textAlign: "center", borderBottom: `1px solid ${currentThemeStyle.border}`, position: "relative", zIndex: 1 }}>
                                        {logoUrl && (
                                            <img src={logoUrl} alt="Logo" style={{ maxHeight: "40px", objectFit: "contain", marginBottom: "1.25rem" }} />
                                        )}
                                        <span style={{ display: "inline-block", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: "10px", fontWeight: 800, padding: "4px 10px", borderRadius: "100px", textTransform: "uppercase", letterSpacing: "0.15em" }}>
                                            {activeEvent.type}
                                        </span>
                                        <h1 style={{ fontSize: "2.2rem", fontWeight: 900, margin: "1rem 0 0.5rem", color: "#fff", letterSpacing: "-0.03em", background: `linear-gradient(135deg, #fff 30%, ${colors.accent} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                                            {activeEvent.name}
                                        </h1>
                                        <p style={{ fontSize: "0.95rem", color: "#94a3b8", maxWidth: "600px", margin: "0 auto" }}>
                                            Experience the future of events. Connect, discover, and build alongside leading industry professionals.
                                        </p>
                                    </div>
                                )}

                                <div style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "2rem", position: "relative", zIndex: 1 }}>
                                    
                                    {/* 2. Countdown Widget */}
                                    {widgets.countdown && (
                                        <div style={{ 
                                            background: currentThemeStyle.cardBg, 
                                            border: `1px solid ${currentThemeStyle.border}`, 
                                            borderRadius: "16px", 
                                            padding: "1.25rem 2rem", 
                                            textAlign: "center",
                                            boxShadow: currentThemeStyle.glowShadow
                                        }}>
                                            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>Sector T-Minus Countdown</div>
                                            <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem" }}>
                                                {[
                                                    { val: daysLeft.d, label: "DAYS" },
                                                    { val: daysLeft.h, label: "HOURS" },
                                                    { val: daysLeft.m, label: "MINS" }
                                                ].map((t, i) => (
                                                    <div key={i} style={{ display: "flex", alignItems: "center" }}>
                                                        <div>
                                                            <div style={{ fontSize: "2rem", fontWeight: 900, color: colors.accent, fontFamily: "monospace", letterSpacing: "2px" }}>{t.val}</div>
                                                            <div style={{ fontSize: "8px", color: "rgba(255,255,255,0.3)", fontWeight: 800, letterSpacing: "0.05em", marginTop: "2px" }}>{t.label}</div>
                                                        </div>
                                                        {i < 2 && <span style={{ fontSize: "1.5rem", fontWeight: 300, color: "rgba(255,255,255,0.15)", marginLeft: "1.5rem", marginTop: "-12px" }}>:</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* 3. RSVP Form widget */}
                                    {widgets.form && (
                                        <div style={{ 
                                            background: currentThemeStyle.cardBg, 
                                            border: `1px solid ${currentThemeStyle.border}`, 
                                            borderRadius: "20px", 
                                            padding: "2rem",
                                            boxShadow: currentThemeStyle.glowShadow,
                                            position: "relative",
                                            overflow: "hidden"
                                        }}>
                                            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "4px", background: currentThemeStyle.accentGradient }}></div>
                                            <h3 style={{ fontSize: "18px", fontWeight: 800, margin: "0 0 1.25rem", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
                                                <UserPlus size={18} style={{ color: colors.accent }} /> Cyber-Registration
                                            </h3>
                                            
                                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                                    <div>
                                                        <label style={{ display: "block", fontSize: "10px", color: "rgba(255,255,255,0.4)", fontWeight: 800, textTransform: "uppercase", marginBottom: "6px" }}>Full Name</label>
                                                        <input placeholder="Jane Doe" disabled style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "10px 12px", color: "#fff", fontSize: "12px", boxSizing: "border-box" }} />
                                                    </div>
                                                    <div>
                                                        <label style={{ display: "block", fontSize: "10px", color: "rgba(255,255,255,0.4)", fontWeight: 800, textTransform: "uppercase", marginBottom: "6px" }}>Email Address</label>
                                                        <input placeholder="jane@example.com" disabled style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "10px 12px", color: "#fff", fontSize: "12px", boxSizing: "border-box" }} />
                                                    </div>
                                                </div>

                                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                                    {fields.whatsapp && (
                                                        <div>
                                                            <label style={{ display: "block", fontSize: "10px", color: "rgba(255,255,255,0.4)", fontWeight: 800, textTransform: "uppercase", marginBottom: "6px" }}>WhatsApp Number</label>
                                                            <input placeholder="+91 XXXXX XXXXX" disabled style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "10px 12px", color: "#fff", fontSize: "12px", boxSizing: "border-box" }} />
                                                        </div>
                                                    )}
                                                    {fields.familySize && (
                                                        <div>
                                                            <label style={{ display: "block", fontSize: "10px", color: "rgba(255,255,255,0.4)", fontWeight: 800, textTransform: "uppercase", marginBottom: "6px" }}>Attendees count</label>
                                                            <input type="number" min="1" defaultValue="1" disabled style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "10px 12px", color: "#fff", fontSize: "12px", boxSizing: "border-box" }} />
                                                        </div>
                                                    )}
                                                </div>

                                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                                    {fields.category && (
                                                        <div>
                                                            <label style={{ display: "block", fontSize: "10px", color: "rgba(255,255,255,0.4)", fontWeight: 800, textTransform: "uppercase", marginBottom: "6px" }}>Attendee Segment</label>
                                                            <select disabled style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "10px 12px", color: "#fff", fontSize: "12px", outline: "none", boxSizing: "border-box" }}>
                                                                <option>Tech</option>
                                                                <option>Business</option>
                                                                <option>VIP</option>
                                                            </select>
                                                        </div>
                                                    )}
                                                    {fields.dietary && (
                                                        <div>
                                                            <label style={{ display: "block", fontSize: "10px", color: "rgba(255,255,255,0.4)", fontWeight: 800, textTransform: "uppercase", marginBottom: "6px" }}>Dietary Prefs</label>
                                                            <select disabled style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "10px 12px", color: "#fff", fontSize: "12px", outline: "none", boxSizing: "border-box" }}>
                                                                <option>None</option>
                                                                <option>Vegetarian</option>
                                                                <option>Vegan</option>
                                                            </select>
                                                        </div>
                                                    )}
                                                </div>

                                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                                    {fields.linkedIn && (
                                                        <div>
                                                            <label style={{ display: "block", fontSize: "10px", color: "rgba(255,255,255,0.4)", fontWeight: 800, textTransform: "uppercase", marginBottom: "6px" }}>LinkedIn Profile</label>
                                                            <input placeholder="https://linkedin.com/in/" disabled style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "10px 12px", color: "#fff", fontSize: "12px", boxSizing: "border-box" }} />
                                                        </div>
                                                    )}
                                                    {fields.portfolio && (
                                                        <div>
                                                            <label style={{ display: "block", fontSize: "10px", color: "rgba(255,255,255,0.4)", fontWeight: 800, textTransform: "uppercase", marginBottom: "6px" }}>Portfolio / GitHub</label>
                                                            <input placeholder="https://github.com/" disabled style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "10px 12px", color: "#fff", fontSize: "12px", boxSizing: "border-box" }} />
                                                        </div>
                                                    )}
                                                </div>

                                                {fields.customQuestionEnabled && (
                                                    <div>
                                                        <label style={{ display: "block", fontSize: "10px", color: "rgba(255,255,255,0.4)", fontWeight: 800, textTransform: "uppercase", marginBottom: "6px" }}>{fields.customQuestion}</label>
                                                        <input placeholder="Response..." disabled style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "10px 12px", color: "#fff", fontSize: "12px", boxSizing: "border-box" }} />
                                                    </div>
                                                )}

                                                {fields.notes && (
                                                    <div>
                                                        <label style={{ display: "block", fontSize: "10px", color: "rgba(255,255,255,0.4)", fontWeight: 800, textTransform: "uppercase", marginBottom: "6px" }}>Special Notes</label>
                                                        <textarea placeholder="Write notes..." disabled style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "8px 12px", color: "#fff", fontSize: "12px", resize: "none", height: "40px", boxSizing: "border-box" }} />
                                                    </div>
                                                )}

                                                <button disabled style={{ background: currentThemeStyle.accentGradient, color: "#fff", border: "none", padding: "12px", borderRadius: "10px", fontSize: "12px", fontWeight: 800, cursor: "not-allowed", marginTop: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                                    Confirm RSVP & Issue Pass
                                                </button>

                                                {privacy.requireConsent && (
                                                    <label style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "10px", color: "rgba(255,255,255,0.6)", cursor: "pointer", marginTop: "4px" }}>
                                                        <input type="checkbox" required checked disabled style={{ accentColor: colors.accent, marginTop: "2px" }} />
                                                        <span>{privacy.consentText}</span>
                                                    </label>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* 4. Speakers Widget */}
                                    {widgets.speakers && speakers.length > 0 && (
                                        <div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem" }}>
                                                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: colors.accent }}></div>
                                                <h3 style={{ fontSize: "14px", fontWeight: 800, margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>Featured Speakers</h3>
                                            </div>
                                            <div style={{ display: "grid", gridTemplateColumns: device === "mobile" ? "1fr" : "1fr 1fr 1fr", gap: "1rem" }}>
                                                {speakers.map(s => (
                                                    <div 
                                                        key={s.id} 
                                                        style={{ 
                                                            background: currentThemeStyle.cardBg, 
                                                            border: `1px solid ${currentThemeStyle.border}`, 
                                                            borderRadius: "12px", 
                                                            padding: "1rem", 
                                                            textAlign: "center"
                                                        }}
                                                    >
                                                        <img 
                                                            src={s.avatar} 
                                                            alt={s.name}
                                                            style={{ width: "50px", height: "50px", borderRadius: "50%", objectFit: "cover", border: `2px solid ${colors.accent}`, margin: "0 auto 8px" }}
                                                        />
                                                        <div style={{ fontSize: "12px", fontWeight: 800, color: "#fff" }}>{s.name}</div>
                                                        <div style={{ fontSize: "9px", color: "#64748b", marginTop: "2px", lineHeight: "1.4" }}>{s.role}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* 5. Map widget */}
                                    {widgets.map && (
                                        <div style={{ 
                                            background: currentThemeStyle.cardBg, 
                                            border: `1px solid ${currentThemeStyle.border}`, 
                                            borderRadius: "16px", 
                                            padding: "1.25rem 1.5rem"
                                        }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                                                <div>
                                                    <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>Operational Sector</div>
                                                    <h4 style={{ fontSize: "13px", fontWeight: 800, margin: "4px 0 0" }}>{activeEvent.location}</h4>
                                                    <p style={{ fontSize: "9px", color: "#64748b", margin: "2px 0 0" }}>{activeEvent.city}, {activeEvent.country}</p>
                                                </div>
                                                <MapPin size={18} style={{ color: colors.accent }} />
                                            </div>
                                            {/* Real Google Map Embed Preview */}
                                            <div style={{ height: "140px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "10px", position: "relative", overflow: "hidden" }}>
                                                <iframe
                                                    title="Event Location Map Preview"
                                                    width="100%"
                                                    height="100%"
                                                    style={{ border: 0, opacity: 0.8, filter: "grayscale(100%) invert(90%) contrast(120%)" }}
                                                    loading="lazy"
                                                    src={`https://maps.google.com/maps?q=${encodeURIComponent((activeEvent.location || "") + ", " + (activeEvent.city || "") + ", " + (activeEvent.country || ""))}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                                                ></iframe>
                                                <span style={{ position: "absolute", bottom: "8px", right: "8px", fontSize: "8px", background: "rgba(10,10,12,0.85)", backdropFilter: "blur(4px)", padding: "2px 6px", borderRadius: "4px", color: colors.accent, fontWeight: 800, textTransform: "uppercase", border: `1px solid ${colors.accent}33` }}>CYBER-GRID NAV ACTIVE</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* 6. FAQ widget */}
                                    {widgets.faq && faqs.length > 0 && (
                                        <div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem" }}>
                                                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: colors.accent }}></div>
                                                <h3 style={{ fontSize: "14px", fontWeight: 800, margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>Operational Briefing (FAQ)</h3>
                                            </div>
                                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                                {faqs.map(f => (
                                                    <div 
                                                        key={f.id}
                                                        onClick={() => setExpandedFaq(expandedFaq === f.id ? null : f.id)}
                                                        style={{ 
                                                            background: currentThemeStyle.cardBg, 
                                                            border: `1px solid ${currentThemeStyle.border}`, 
                                                            borderRadius: "10px", 
                                                            padding: "12px", 
                                                            cursor: "pointer",
                                                            transition: "background 0.2s"
                                                        }}
                                                    >
                                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                            <span style={{ fontSize: "12px", fontWeight: 700, color: "#fff" }}>{f.q}</span>
                                                            {expandedFaq === f.id ? <ChevronUp size={14} color="#64748b" /> : <ChevronDown size={14} color="#64748b" />}
                                                        </div>
                                                        {expandedFaq === f.id && (
                                                            <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "8px", lineHeight: "1.4" }}>
                                                                {f.a}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                </div>

                                {/* Public Footer */}
                                <div style={{ marginTop: "auto", padding: "1.5rem 2rem", borderTop: `1px solid ${currentThemeStyle.border}`, background: "rgba(0,0,0,0.3)", textAlign: "center", fontSize: "9px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.05em" }}>
                                    © {new Date().getFullYear()} {activeEvent.name} — ALL SYSTEM CHANNELS RESERVED.
                                </div>
                            </>
                        )}

                        {/* Sticky Cookie Banner Preview */}
                        {privacy.cookieBanner && (activeWizardStep !== "email" && activeWizardStep !== "survey") && (
                            <div style={{ position: "sticky", bottom: 0, background: "rgba(10,10,12,0.95)", borderTop: `1px solid ${currentThemeStyle.border}`, padding: "10px 16px", display: "flex", justifySelf: "flex-end", justifyContent: "space-between", alignItems: "center", zIndex: 50, fontSize: "10px", backdropFilter: "blur(10px)", fontFamily: "'Inter', sans-serif" }}>
                                <span>We use cookies to enhance your event registration experience.</span>
                                <button style={{ background: colors.accent, border: "none", color: "#fff", padding: "4px 10px", borderRadius: "4px", fontWeight: 800, cursor: "pointer" }}>Accept</button>
                            </div>
                        )}

                    </div>
                </div>
            </div>

        </div>
    );
}
