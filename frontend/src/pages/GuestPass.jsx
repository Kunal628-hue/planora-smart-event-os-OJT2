import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Calendar, MapPin, CheckCircle2, XCircle, Sparkles, Navigation, QrCode, ShieldCheck, User } from "lucide-react";

export default function GuestPass() {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [actionSuccess, setActionSuccess] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5002/api";

    useEffect(() => {
        const fetchPassData = async () => {
            try {
                const response = await fetch(`${API_URL}/guests/pass-data/${id}`);
                if (!response.ok) throw new Error("Guest pass not found");
                const resData = await response.json();
                setData(resData);
            } catch (err) {
                console.error("Failed to load pass:", err);
                setError("Unable to load digital access pass.");
            } finally {
                setLoading(false);
            }
        };
        fetchPassData();
    }, [id, API_URL]);

    const handleRsvp = async (newStatus) => {
        setActionLoading(true);
        try {
            const response = await fetch(`${API_URL}/guests/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            });
            if (response.ok) {
                setData(prev => ({
                    ...prev,
                    guest: { ...prev.guest, status: newStatus }
                }));
                setActionSuccess(`RSVP status updated to ${newStatus}!`);
            } else {
                alert("Failed to update status. Please try again.");
            }
        } catch (err) {
            console.error("RSVP error:", err);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#09090b", color: "#fff" }}>
                <Sparkles className="animate-spin" size={32} style={{ color: "#f97316", marginBottom: "1rem" }} />
                <p style={{ fontWeight: 600, color: "#a1a1aa" }}>Initializing Access Pass...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#09090b", color: "#fff", padding: "2rem", textAlign: "center" }}>
                <div style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", padding: "1rem", borderRadius: "50%", marginBottom: "1rem" }}>
                    <XCircle size={40} />
                </div>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 800, margin: "0 0 0.5rem 0" }}>Pass Unavailable</h2>
                <p style={{ color: "#a1a1aa", maxWidth: "400px" }}>The requested digital event pass could not be retrieved. Please verify your invitation link.</p>
            </div>
        );
    }

    const { guest, event } = data;
    const venueName = event.location || event.city || "Venue TBD";
    const mapsUrl = venueName && venueName !== "Venue TBD" 
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venueName)}`
        : "";

    const categoryColors = {
        "VIP": { bg: "rgba(244, 63, 94, 0.15)", border: "rgba(244, 63, 94, 0.3)", text: "#f43f5e", label: "VIP ACCESS" },
        "Tech": { bg: "rgba(37, 99, 235, 0.15)", border: "rgba(37, 99, 235, 0.3)", text: "#3b82f6", label: "TECH DELEGATE" },
        "Business": { bg: "rgba(124, 58, 237, 0.15)", border: "rgba(124, 58, 237, 0.3)", text: "#a855f7", label: "EXECUTIVE PASS" },
        "Friend": { bg: "rgba(16, 185, 129, 0.15)", border: "rgba(16, 185, 129, 0.3)", text: "#10b981", label: "GUEST ACCESS" },
        "Family": { bg: "rgba(234, 88, 12, 0.15)", border: "rgba(234, 88, 12, 0.3)", text: "#f97316", label: "FAMILY PASS" }
    };
    const catStyle = categoryColors[guest.category] || { bg: "rgba(249, 115, 22, 0.15)", border: "rgba(249, 115, 22, 0.3)", text: "#f97316", label: `${guest.category.toUpperCase()} PASS` };

    return (
        <div style={{ minHeight: "100vh", background: "#09090b", color: "#f4f4f5", display: "flex", flexDirection: "column", alignItems: "center", padding: "2rem 1rem", fontFamily: "sans-serif" }}>
            
            {/* Top Brand Header */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2rem" }}>
                <Sparkles size={20} style={{ color: "#f97316" }} />
                <span style={{ fontSize: "1.1rem", fontWeight: 900, letterSpacing: "-0.03em", color: "#fff" }}>Planora OS</span>
                <span style={{ fontSize: "10px", background: "rgba(249, 115, 22, 0.12)", color: "#f97316", padding: "2px 8px", borderRadius: "100px", fontWeight: 800 }}>PASS PORTAL</span>
            </div>

            {/* DIGITAL BADGE CARD */}
            <div style={{
                width: "100%",
                maxWidth: "420px",
                background: "#121214",
                borderRadius: "28px",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                boxShadow: "0 25px 60px rgba(0,0,0,0.8)",
                overflow: "hidden",
                position: "relative"
            }}>
                {/* Header Strip */}
                <div style={{ background: "linear-gradient(135deg, #18181b 0%, #09090b 100%)", padding: "2rem 1.5rem 1.5rem 1.5rem", borderBottom: "1px dashed rgba(255, 255, 255, 0.15)", textAlign: "center" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: catStyle.bg, border: `1px solid ${catStyle.border}`, color: catStyle.text, padding: "4px 12px", borderRadius: "100px", fontSize: "10px", fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1rem" }}>
                        <ShieldCheck size={12} />
                        {catStyle.label}
                    </div>
                    <h1 style={{ fontSize: "1.6rem", fontWeight: 900, margin: "0 0 0.5rem 0", color: "#fff", letterSpacing: "-0.02em" }}>
                        {event.title}
                    </h1>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", color: "rgba(255,255,255,0.6)", fontSize: "13px", fontWeight: 600 }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <Calendar size={14} style={{ color: "#f97316" }} />
                            {event.date || "Upcoming"}
                        </span>
                    </div>
                </div>

                {/* Body Content */}
                <div style={{ padding: "2rem 1.5rem", textAlign: "center" }}>
                    <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem auto", color: "#f97316" }}>
                        <User size={30} />
                    </div>

                    <h2 style={{ fontSize: "1.4rem", fontWeight: 900, margin: "0 0 0.25rem 0", color: "#fff" }}>
                        {guest.name}
                    </h2>
                    <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", margin: "0 0 1.5rem 0", fontWeight: 600 }}>
                        Attendee Passcode & Verify Token
                    </p>

                    {/* Entry Code Box */}
                    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "1rem", marginBottom: "1.5rem" }}>
                        <p style={{ fontSize: "10px", fontWeight: 800, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 6px 0" }}>ENTRY PASSCODE</p>
                        <div style={{ fontFamily: "monospace", fontSize: "1.4rem", fontWeight: 900, color: "#f97316", letterSpacing: "0.2em" }}>
                            {guest.entryCode}
                        </div>
                    </div>

                    {/* VENUE & GOOGLE MAPS BLOCK */}
                    <div style={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "1.25rem", textAlign: "left", marginBottom: "1.5rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#f97316", fontSize: "11px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
                            <MapPin size={14} />
                            Venue Location
                        </div>
                        <p style={{ fontSize: "14px", fontWeight: 700, color: "#fff", margin: "0 0 0.85rem 0", lineHeight: 1.4 }}>
                            {venueName}
                        </p>
                        {mapsUrl ? (
                            <a
                                href={mapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    background: "rgba(37, 99, 235, 0.12)",
                                    border: "1px solid rgba(37, 99, 235, 0.3)",
                                    color: "#60a5fa",
                                    padding: "8px 14px",
                                    borderRadius: "10px",
                                    fontSize: "12px",
                                    fontWeight: 700,
                                    textDecoration: "none",
                                    transition: "all 0.2s"
                                }}
                            >
                                <Navigation size={14} />
                                Open Directions on Google Maps &rarr;
                            </a>
                        ) : (
                            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>Venue address details pending.</span>
                        )}
                    </div>

                    {/* RSVP STATUS & BUTTONS */}
                    <div style={{ marginBottom: "1rem" }}>
                        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", fontWeight: 600, marginBottom: "0.75rem" }}>
                            Current RSVP Status: <strong style={{ color: guest.status === "Confirmed" ? "#10b981" : guest.status === "Declined" ? "#ef4444" : "#f59e0b" }}>{guest.status}</strong>
                        </p>

                        <div style={{ display: "flex", gap: "10px" }}>
                            <button
                                onClick={() => handleRsvp("Confirmed")}
                                disabled={actionLoading}
                                style={{
                                    flex: 1,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "6px",
                                    padding: "0.85rem",
                                    borderRadius: "12px",
                                    border: "none",
                                    background: "#10b981",
                                    color: "#fff",
                                    fontWeight: 800,
                                    fontSize: "13px",
                                    cursor: "pointer",
                                    boxShadow: "0 4px 14px rgba(16, 185, 129, 0.3)"
                                }}
                            >
                                <CheckCircle2 size={16} />
                                Confirm
                            </button>

                            <button
                                onClick={() => handleRsvp("Declined")}
                                disabled={actionLoading}
                                style={{
                                    flex: 1,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "6px",
                                    padding: "0.85rem",
                                    borderRadius: "12px",
                                    border: "1px solid rgba(239, 68, 68, 0.4)",
                                    background: "rgba(239, 68, 68, 0.1)",
                                    color: "#f87171",
                                    fontWeight: 800,
                                    fontSize: "13px",
                                    cursor: "pointer"
                                }}
                            >
                                <XCircle size={16} />
                                Decline
                            </button>
                        </div>
                    </div>

                    {actionSuccess && (
                        <p style={{ fontSize: "12px", color: "#10b981", fontWeight: 700, margin: "0.5rem 0 0 0" }}>{actionSuccess}</p>
                    )}
                </div>

                {/* Footer */}
                <div style={{ background: "#18181b", padding: "1rem", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                    <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", margin: 0 }}>
                        Official Digital Entry Pass &bull; Planora Smart Event OS
                    </p>
                </div>
            </div>
        </div>
    );
}
