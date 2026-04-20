import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useDialog } from "../../context/DialogContext";
import { UserPlus, Users, Trash2, Mail, Briefcase, Loader2, X, Calendar, Phone, Upload, FileText } from "lucide-react";
import { LogoLoader } from "../../components/ui/Loader";

const API_URL = import.meta.env.VITE_API_URL;

export default function Guests() {
    const { user, events, selectedEventId, syncTimestamp, addNotification, hasFullAccess, hasEditorAccess } = useOutletContext();
    const { showConfirm } = useDialog();
    const [guests, setGuests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newGuest, setNewGuest] = useState({
        name: "",
        email: "",
        category: "Tech",
        status: "Pending",
        eventId: selectedEventId || "",
        whatsapp: "",
        familySize: 1,
        linkedIn: "",
        portfolio: ""
    });

    const fetchData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            let url = `${API_URL}/guests?user=${user.uid}&email=${user.email}`;
            if (selectedEventId) url += `&eventId=${selectedEventId}`;
            const res = await fetch(url);
            const data = await res.json();
            setGuests(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Background polling to capture email RSVP updates
        const pollInterval = setInterval(fetchData, 10000); 
        return () => clearInterval(pollInterval);
    }, [user, selectedEventId, syncTimestamp]);

    useEffect(() => {
        if (selectedEventId) {
            setNewGuest(prev => ({ ...prev, eventId: selectedEventId }));
        }
    }, [selectedEventId]);

    const [bulkLoading, setBulkLoading] = useState(false);
    const [bulkCooldown, setBulkCooldown] = useState(false);

    const handleBulkUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !selectedEventId || bulkCooldown) return;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("eventId", selectedEventId);

        setBulkLoading(true);
        try {
            const response = await fetch(`${API_URL}/guests/bulk-upload`, {
                method: "POST",
                body: formData
            });

            const data = await response.json();
            if (response.ok) {
                addNotification("Bulk Onboarding Complete", data.message);
                fetchData();
            } else if (response.status === 429) {
                addNotification("AI Rate Limit", "The AI engine is busy. Please wait 2 minutes before trying again.");
                // Start a 30-second cooldown to prevent hammering
                setBulkCooldown(true);
                setTimeout(() => setBulkCooldown(false), 30000);
            } else {
                addNotification("Extraction Error", data.message || "Failed to parse file.");
            }
        } catch (err) {
            console.error("Bulk upload failed:", err);
            addNotification("Connection Error", "Failed to reach the server.");
        } finally {
            setBulkLoading(false);
            e.target.value = "";
        }
    };

    const handleCreateGuest = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/guests`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...newGuest,
                    user: user.uid,
                    event: newGuest.eventId
                })
            });
            if (response.ok) {
                const guest = await response.json();
                setShowModal(false);
                
                // --- App-Priority Redirection (Priority for Desktop App) ---
                if (newGuest.whatsapp) {
                    const event = events.find(e => (e.id || e._id) === newGuest.eventId);
                    const senderName = user.displayName || "Management Team Member";
                    const locationText = event?.location ? `\n📍 Venue: ${event.location}\n🗺️ View Map: https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}` : "";
                    const waMessage = encodeURIComponent(`Hi ${newGuest.name}, this is ${senderName}. You're invited to "${event?.name || 'Upcoming Event'}" on Planora!${locationText}\n\nWe've sent more details to your email. See you there!`);
                    
                    // Using api.whatsapp.com gateway which triggers the Desktop App if installed
                    const waUrl = `https://api.whatsapp.com/send?phone=${newGuest.whatsapp.replace(/[^0-9]/g, "")}&text=${waMessage}`;
                    window.open(waUrl, "_blank");
                }

                setNewGuest({
                    name: "",
                    email: "",
                    category: "Tech",
                    status: "Pending",
                    eventId: selectedEventId || "",
                    whatsapp: "",
                    familySize: 1,
                    linkedIn: "",
                    portfolio: ""
                });
                fetchData();
                addNotification("Attendee Onboarded", `${newGuest.name} has been added to the guest registry.`);
            }
        } catch (err) {
            console.error("Failed to add guest:", err);
        }
    };

    const updateStatus = async (guestId, newStatus) => {
        if (!hasEditorAccess) return;
        
        try {
            const response = await fetch(`${API_URL}/guests/${guestId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            });
            if (response.ok) {
                if (newStatus === "Rejected") {
                    setGuests(prev => prev.filter(g => g._id !== guestId));
                    addNotification("Application Rejected", "The applicant has been notified and removed from the directory.");
                } else {
                    setGuests(prev => prev.map(g => g._id === guestId ? { ...g, status: newStatus } : g));
                    addNotification("Status Synchronized", `Attendee RSVP updated to ${newStatus}.`);
                }
            }
        } catch (err) {
            console.error("Failed to update status:", err);
        }
    };

    const handleDeleteGuest = async (guestId) => {
        if (!hasEditorAccess) return;
        const confirmed = await showConfirm("Purge Attendee", "Are you sure you want to permanently remove this attendee from the directory?");
        if (!confirmed) return;
        try {
            const response = await fetch(`${API_URL}/guests/${guestId}`, {
                method: "DELETE"
            });
            if (response.ok) {
                setGuests(guests.filter(g => g._id !== guestId));
                addNotification("Entry Purged", "Attendee has been removed from the directory.");
            }
        } catch (err) {
            console.error("Failed to delete guest:", err);
        }
    };

    const filteredGuests = selectedEventId
        ? guests.filter(g => (g.event?._id || g.event) === selectedEventId)
        : guests;

    return (
        <div className="responsive-container" style={{
            fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
            background: "#fcfdff",
            minHeight: "100vh",
            color: "#0f172a"
        }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "3.5rem", gap: "1.5rem", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: "280px" }}>
                    <h1 style={{ fontSize: "2.75rem", fontWeight: 800, letterSpacing: "-0.04em", margin: "0 0 0.5rem" }}>
                        Attendee <span style={{ color: "#2563eb" }}>Directory</span>
                    </h1>
                    <p style={{ color: "#64748b", fontSize: "1.1rem", fontWeight: 500, margin: 0 }}>
                        Monitor attendance velocity and catering preferences in real-time.
                    </p>
                </div>
                {hasEditorAccess && (
                    <div style={{ display: "flex", gap: "1rem" }}>
                        <label style={{
                            borderRadius: "16px",
                            padding: "1rem 2rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                            background: "#fff",
                            color: bulkCooldown ? "#94a3b8" : "#2563eb",
                            border: "1px solid #e2e8f0",
                            fontWeight: 800,
                            fontSize: "15px",
                            cursor: (bulkLoading || bulkCooldown) ? "default" : "pointer",
                            boxShadow: "0 4px 10px rgba(0,0,0,0.02)",
                            transition: "all 0.2s ease",
                            opacity: (bulkLoading || bulkCooldown) ? 0.6 : 1
                        }}>
                            {bulkLoading ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
                            <span>{bulkCooldown ? "Cooling down..." : bulkLoading ? "Extracting..." : "Bulk Onboarding"}</span>
                            <input 
                                type="file" 
                                accept=".pdf,.xlsx,.xls,.csv" 
                                style={{ display: "none" }} 
                                onChange={handleBulkUpload}
                                disabled={bulkLoading || bulkCooldown || events.length === 0}
                            />
                        </label>

                        <button
                            onClick={() => setShowModal(true)}
                            disabled={events.length === 0}
                            style={{
                                borderRadius: "16px",
                                padding: "1rem 2rem",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.75rem",
                                background: "#2563eb",
                                color: "#fff",
                                border: "none",
                                fontWeight: 800,
                                fontSize: "15px",
                                cursor: "pointer",
                                boxShadow: "0 8px 20px rgba(37, 99, 235, 0.2)",
                                transition: "all 0.2s ease"
                            }}
                        >
                            <UserPlus size={20} strokeWidth={3} />
                            <span>Add Attendee</span>
                        </button>
                    </div>
                )}
            </div>

            {loading ? (
                <LogoLoader text="Analyzing RSVPs..." />
            ) : filteredGuests.length === 0 ? (
                <div style={{
                    padding: "8rem 2rem",
                    textAlign: "center",
                    borderRadius: "40px",
                    background: "#fff",
                    border: "1px solid #f1f5f9",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.02)"
                }}>
                    <div style={{ marginBottom: "2.5rem", display: "flex", justifyContent: "center" }}>
                        <div style={{
                            width: "100px",
                            height: "100px",
                            borderRadius: "32px",
                            background: "#eff6ff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#2563eb"
                        }}>
                            <Users size={48} strokeWidth={2.5} />
                        </div>
                    </div>
                    <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "#0f172a", margin: "0 0 1rem" }}>Guest list is empty</h2>
                    <p style={{ color: "#64748b", margin: "0 auto 2.5rem", maxWidth: "450px", fontSize: "1.1rem", fontWeight: 500, lineHeight: "1.6" }}>
                        {events.length === 0 ? "Identify an event context before adding guests. Create an event first to begin tracking." : "Start populating your attendee list to see analytical growth and rsvp velocity."}
                    </p>
                    {events.length > 0 && hasEditorAccess && (
                        <button
                            onClick={() => setShowModal(true)}
                            style={{
                                background: "#fff",
                                border: "1.5px solid #e2e8f0",
                                padding: "1rem 2rem",
                                borderRadius: "14px",
                                fontWeight: 800,
                                cursor: "pointer"
                            }}
                        >Invite Your First Guest</button>
                    )}
                </div>
            ) : (
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: "1.5rem"
                }}>
                    {filteredGuests.map(guest => (
                        <div key={guest._id} className="guest-card" style={{
                            background: "#fff",
                            padding: "2rem",
                            borderRadius: "32px",
                            border: "1px solid #f1f5f9",
                            position: "relative",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.01)",
                            display: "flex",
                            flexDirection: "column"
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
                                <div style={{
                                    width: "56px",
                                    height: "56px",
                                    borderRadius: "18px",
                                    background: "#f8fafc",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "1.4rem",
                                    color: "#2563eb",
                                    fontWeight: 800,
                                    border: "1px solid #f1f5f9"
                                }}>
                                    {guest.name.charAt(0)}
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.75rem" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                        <div
                                            onClick={() => {
                                                const statusCycle = { "Pending": "Confirmed", "Confirmed": "Declined", "Declined": "Pending" };
                                                const nextStatus = statusCycle[guest.status] || "Pending";
                                                updateStatus(guest._id, nextStatus);
                                            }}
                                            style={{
                                                background: guest.status === "Confirmed" ? "#f0fdf4" : guest.status === "Declined" ? "#fff1f2" : "#f8fafc",
                                                color: guest.status === "Confirmed" ? "#10b981" : guest.status === "Declined" ? "#ef4444" : "#64748b",
                                                cursor: hasEditorAccess ? "pointer" : "default",
                                                border: `1px solid ${guest.status === "Confirmed" ? "#10b98120" : guest.status === "Declined" ? "#ef444420" : "#64748b20"}`,
                                                fontWeight: 800,
                                                padding: "6px 14px",
                                                borderRadius: "100px",
                                                fontSize: "11px",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "6px",
                                                textTransform: "uppercase",
                                                letterSpacing: "0.05em"
                                            }}
                                        >
                                            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "currentColor" }}></div>
                                            {guest.status}
                                        </div>
                                        {hasEditorAccess && (
                                            <button
                                                onClick={() => updateStatus(guest._id, "Rejected")}
                                                title="Reject Application"
                                                style={{
                                                    background: "#fff1f2",
                                                    border: "1px solid #ef444430",
                                                    color: "#ef4444",
                                                    width: "28px",
                                                    height: "28px",
                                                    borderRadius: "8px",
                                                    cursor: "pointer",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    transition: "all 0.2s"
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.background = "#ef444410"}
                                            >
                                                <X size={14} strokeWidth={3} />
                                            </button>
                                        )}
                                    </div>
                                    {hasEditorAccess && (
                                        <button
                                            onClick={() => handleDeleteGuest(guest._id)}
                                            style={{
                                                background: "none",
                                                border: "none",
                                                color: "#94a3b8",
                                                cursor: "pointer",
                                                padding: "0"
                                            }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div style={{ marginBottom: "1.5rem" }}>
                                <h3 style={{ fontWeight: 800, fontSize: "1.35rem", color: "#0f172a", margin: "0 0 0.5rem", letterSpacing: "-0.02em" }}>{guest.name}</h3>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", color: "#64748b", fontSize: "14px", fontWeight: 500 }}>
                                    <Mail size={14} style={{ opacity: 0.8 }} />
                                    {guest.email || "No digital contact"}
                                </div>
                                <div style={{ display: "flex", gap: "1rem", marginTop: "0.6rem" }}>
                                    {guest.linkedIn && (
                                        <a href={guest.linkedIn.startsWith('http') ? guest.linkedIn : `https://${guest.linkedIn}`} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#2563eb", fontSize: "12px", fontWeight: 700, textDecoration: "none" }}>
                                            <Briefcase size={14} />
                                            LinkedIn
                                        </a>
                                    )}
                                    {guest.portfolio && (
                                        <a href={guest.portfolio.startsWith('http') ? guest.portfolio : `https://${guest.portfolio}`} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#64748b", fontSize: "12px", fontWeight: 700, textDecoration: "none" }}>
                                            <Calendar size={14} />
                                            Portfolio
                                        </a>
                                    )}
                                </div>
                                {guest.whatsapp && (
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", color: "#10b981", fontSize: "14px", fontWeight: 700, marginTop: "0.4rem" }}>
                                        <Phone size={14} style={{ opacity: 0.8 }} />
                                        {guest.whatsapp}
                                    </div>
                                )}
                            </div>

                            <div style={{ marginTop: "auto", display: "flex", gap: "0.6rem", flexWrap: "wrap", paddingTop: "1.25rem", borderTop: "1px solid #f1f5f9" }}>
                                <span style={{
                                    padding: "4px 10px",
                                    borderRadius: "8px",
                                    background: "#eff6ff",
                                    fontSize: "11px",
                                    fontWeight: 800,
                                    color: "#2563eb",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em"
                                }}>
                                    {guest.category}
                                </span>
                                {guest.status === "Confirmed" && guest.familySize > 0 && (
                                    <span style={{
                                        padding: "4px 10px",
                                        borderRadius: "8px",
                                        background: "#f0fdf4",
                                        fontSize: "11px",
                                        fontWeight: 800,
                                        color: "#10b981",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.05em",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "4px"
                                    }}>
                                        <Users size={12} />
                                        Party: {guest.familySize}
                                    </span>
                                )}
                                <span style={{
                                    padding: "4px 10px",
                                    borderRadius: "8px",
                                    background: "#f1f5f9",
                                    fontSize: "11px",
                                    fontWeight: 800,
                                    color: "#64748b",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em"
                                }}>
                                    {events.find(e => (e.id || e._id) === guest.event)?.name || "External Context"}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && hasEditorAccess && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, backdropFilter: "blur(8px)", padding: "1rem" }}>
                    <div className="modal-reveal mobile-full-width" style={{ background: "#fff", width: "100%", maxWidth: "560px", maxHeight: "90vh", overflowY: "auto", padding: "2rem", borderRadius: "32px", boxShadow: "0 25px 60px rgba(0,0,0,0.2)", position: "relative" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Users size={22} strokeWidth={2.5} />
                                </div>
                                <div style={{ overflow: "hidden" }}>
                                    <h2 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0, letterSpacing: "-0.03em" }}>Onboard Guest</h2>
                                    <p style={{ color: "#64748b", fontSize: "0.85rem", fontWeight: 500, margin: "2px 0 0" }}>Register a new attendee for analysis.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{ background: "#f1f5f9", border: "none", color: "#64748b", width: "32px", height: "32px", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                            ><X size={18} strokeWidth={3} /></button>
                        </div>
                        <form onSubmit={handleCreateGuest} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "10px", fontWeight: 800, color: "#64748b", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Full Identity</label>
                                    <input style={{ width: "100%", padding: "0.85rem", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "14px", fontWeight: 600 }} placeholder="e.g. Johnathan Doe" value={newGuest.name} onChange={e => setNewGuest({ ...newGuest, name: e.target.value })} required />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "10px", fontWeight: 800, color: "#64748b", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Operational Event</label>
                                    <select
                                        style={{ width: "100%", padding: "0.85rem", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "14px", fontWeight: 700 }}
                                        value={newGuest.eventId}
                                        onChange={e => setNewGuest({ ...newGuest, eventId: e.target.value })}
                                        required
                                    >
                                        {events.map(event => (
                                            <option key={event.id || event._id} value={event.id || event._id}>{event.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "10px", fontWeight: 800, color: "#64748b", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Digital Contact (Email)</label>
                                    <input 
                                        type="email" 
                                        style={{ width: "100%", padding: "0.85rem", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "14px", fontWeight: 600 }} 
                                        placeholder="e.g. guest@example.com" 
                                        value={newGuest.email} 
                                        onChange={e => setNewGuest({ ...newGuest, email: e.target.value })} 
                                    />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "10px", fontWeight: 800, color: "#64748b", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Mobile Contact (WA)</label>
                                    <input 
                                        type="text" 
                                        style={{ width: "100%", padding: "0.85rem", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "14px", fontWeight: 600 }} 
                                        placeholder="e.g. +1234567890" 
                                        value={newGuest.whatsapp} 
                                        onChange={e => setNewGuest({ ...newGuest, whatsapp: e.target.value })} 
                                    />
                                </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.25rem" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "10px", fontWeight: 800, color: "#64748b", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Classification</label>
                                    <select style={{ width: "100%", padding: "0.85rem", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "14px", fontWeight: 700 }} value={newGuest.category} onChange={e => setNewGuest({ ...newGuest, category: e.target.value })}>
                                        <option>Friend</option>
                                        <option>Family</option>
                                        <option>VIP</option>
                                        <option>Business</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "10px", fontWeight: 800, color: "#64748b", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Initial RSVP</label>
                                    <select style={{ width: "100%", padding: "0.85rem", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "14px", fontWeight: 700 }} value={newGuest.status} onChange={e => setNewGuest({ ...newGuest, status: e.target.value })}>
                                        <option>Pending</option>
                                        <option>Confirmed</option>
                                        <option>Declined</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "10px", fontWeight: 800, color: "#64748b", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Party Size</label>
                                    <input 
                                        type="number" 
                                        min="1"
                                        style={{ width: "100%", padding: "0.85rem", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "14px", fontWeight: 700 }} 
                                        value={newGuest.familySize} 
                                        onChange={e => setNewGuest({ ...newGuest, familySize: parseInt(e.target.value) || 1 })} 
                                    />
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
                                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: "0.85rem", borderRadius: "12px", border: "none", background: "#f1f5f9", fontWeight: 800, cursor: "pointer", fontSize: "14px" }}>Cancel</button>
                                <button type="submit" style={{ flex: 1.5, padding: "0.85rem", borderRadius: "12px", border: "none", background: "#2563eb", color: "#fff", fontWeight: 900, cursor: "pointer", boxShadow: "0 8px 20px rgba(37, 99, 235, 0.2)", fontSize: "14px" }}>Confirm Onboarding</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}
