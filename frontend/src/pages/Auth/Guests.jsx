import { useState, useEffect, useMemo, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { useDialog } from "../../context/DialogContext";
import { 
    UserPlus, Users, Trash2, Mail, Briefcase, Loader2, X, 
    Calendar, Phone, Upload, Search, ChevronDown, 
    ChevronLeft, ChevronRight, Download, MoreHorizontal,
    TrendingUp, PieChart, CreditCard, Grid3X3
} from "lucide-react";
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import { useUpload } from "../../context/UploadContext";

const API_URL = import.meta.env.VITE_API_URL;

export default function Guests() {
    const { user, events, selectedEventId, syncTimestamp, addNotification, hasFullAccess, hasEditorAccess } = useOutletContext();
    const { showConfirm } = useDialog();
    const { startUpload, completeUpload, cancelUpload } = useUpload();
    
    // State
    const [guests, setGuests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showBadges, setShowBadges] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [segmentFilter, setSegmentFilter] = useState("All Segments");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const [newGuest, setNewGuest] = useState({
        name: "",
        email: "",
        category: "Tech",
        status: "Pending",
        eventId: selectedEventId || "",
        whatsapp: "",
        familySize: 1,
        linkedIn: "",
        portfolio: "",
        dietary: "None",
        notes: ""
    });

    const [bulkLoading, setBulkLoading] = useState(false);
    const [bulkCooldown, setBulkCooldown] = useState(false);

    const activeEvent = useMemo(() => {
        return events.find(e => (e.id || e._id) === selectedEventId) || null;
    }, [events, selectedEventId]);

    // Classification helper to restrict badges to professional events only
    const isProfessionalEvent = useMemo(() => {
        if (!activeEvent) return false;
        const typeLower = (activeEvent.type || "Other").toLowerCase();
        const titleLower = (activeEvent.title || activeEvent.name || "").toLowerCase();
        
        const professionalKeywords = ["hackathon", "hackthon", "tech fest", "tech event", "conference", "corporate", "tech summits", "college fest", "seminar", "workshop", "tech", "summit", "meetup"];
        const personalKeywords = ["wedding", "birthday", "party", "anniversary", "baby shower", "engagement", "reception", "family"];
        
        if (personalKeywords.some(kw => typeLower.includes(kw))) {
            return false;
        } else if (professionalKeywords.some(kw => typeLower.includes(kw))) {
            return true;
        } else {
            return professionalKeywords.some(kw => titleLower.includes(kw)) && !personalKeywords.some(kw => titleLower.includes(kw));
        }
    }, [activeEvent]);

    const downloadSampleCSV = () => {
        if (!activeEvent) {
            addNotification("Download Error", "No active event selected.");
            return;
        }

        const typeLower = (activeEvent.type || "Other").toLowerCase();
        const titleLower = (activeEvent.title || activeEvent.name || "").toLowerCase();

        const isTechOrHackathon = 
            ["hackathon", "hackthon", "tech fest", "tech event", "conference", "seminar", "workshop", "tech", "summit", "meetup"].some(kw => typeLower.includes(kw) || titleLower.includes(kw));

        const isWedding = 
            ["wedding", "reception", "engagement", "anniversary"].some(kw => typeLower.includes(kw) || titleLower.includes(kw));

        const isBirthdayOrParty = 
            ["birthday", "party", "baby shower", "celebration"].some(kw => typeLower.includes(kw) || titleLower.includes(kw));

        let headers = [];
        let rows = [];

        if (isTechOrHackathon) {
            headers = [
                "Full Name", 
                "Email", 
                "Phone / WhatsApp", 
                "Category (Developer/Designer/VIP/General)", 
                "Attendees Size (Number)", 
                "Dietary (None/Vegetarian/Vegan)", 
                "LinkedIn URL", 
                "Portfolio URL", 
                "GitHub URL", 
                "Notes"
            ];
            rows = [
                ["Jane Doe", "jane@example.com", "+919876543210", "Developer", "1", "Vegetarian", "https://linkedin.com/in/janedoe", "https://janedoe.dev", "https://github.com/janedoe", "Core frontend developer for tech event"],
                ["John Smith", "john@example.com", "+918765432109", "VIP", "1", "None", "https://linkedin.com/in/johnsmith", "", "", "Keynote speaker on AI integration"]
            ];
        } else if (isWedding) {
            headers = [
                "Full Name", 
                "Email", 
                "Phone / WhatsApp", 
                "Category (Groom Side/Bride Side/Friend/VIP)", 
                "Attendees Size (Number)", 
                "Dietary (None/Vegetarian/Vegan)", 
                "Relationship", 
                "Special Requests / Notes"
            ];
            rows = [
                ["Aarav Sharma", "aarav@example.com", "+919876543210", "Groom Side", "2", "Vegetarian", "Cousin", "Needs wheel chair assistance at reception"],
                ["Sarah Jones", "sarah@example.com", "+918765432109", "Friend", "1", "None", "College Friend", "No special requests, staying at venue hotel"]
            ];
        } else if (isBirthdayOrParty) {
            headers = [
                "Full Name", 
                "Email", 
                "Phone / WhatsApp", 
                "Category (Family/Friend/Classmate/Colleague)", 
                "Attendees Size (Number)", 
                "Dietary (None/Vegetarian/Vegan/Nut-Free)", 
                "Age (Optional)", 
                "Gift Preference / Notes"
            ];
            rows = [
                ["Anya Patel", "anya@example.com", "+919876543210", "Friend", "1", "Nut-Free", "25", "Loves chocolate cake, bringing flowers"],
                ["Kabir Singh", "kabir@example.com", "+918765432109", "Family", "3", "None", "", "Bringing kids, will arrive early"]
            ];
        } else {
            headers = [
                "Full Name", 
                "Email", 
                "Phone / WhatsApp", 
                "Category (VIP/General/Staff/Organizer)", 
                "Attendees Size (Number)", 
                "Dietary (None/Vegetarian/Vegan)", 
                "Company / Organization", 
                "Notes"
            ];
            rows = [
                ["Alice Johnson", "alice@example.com", "+919876543210", "VIP", "1", "Vegetarian", "Planora Corp", "Guest speaker for session"],
                ["Bob Miller", "bob@example.com", "+918765432109", "General", "2", "None", "", "Regular event attendee"]
            ];
        }

        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
            + [headers.join(","), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(","))].join("\n");
            
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${activeEvent?.name || "Event"}_Sample_Guests.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        addNotification("Template Downloaded", `Downloaded sample template.`);
    };

    // Fetch Data
    const fetchData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            let url = `${API_URL}/guests?user=${user.uid}&email=${encodeURIComponent(user.email || "")}`;
            if (selectedEventId) url += `&eventId=${selectedEventId}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();
            setGuests(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Fetch error:", err);
            setGuests([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const pollInterval = setInterval(fetchData, 5000); 
        return () => clearInterval(pollInterval);
    }, [user, selectedEventId, syncTimestamp]);

    useEffect(() => {
        if (selectedEventId) {
            setNewGuest(prev => ({ ...prev, eventId: selectedEventId }));
        }
    }, [selectedEventId]);

    // Handlers
    const handleBulkUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !selectedEventId || bulkCooldown) return;

        startUpload(file);
        
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
                completeUpload();
                addNotification("Bulk Onboarding Complete", data.message);
                fetchData();
            } else if (response.status === 429) {
                cancelUpload();
                addNotification("AI Rate Limit", "The AI engine is busy. Please wait 2 minutes.");
                setBulkCooldown(true);
                setTimeout(() => setBulkCooldown(false), 30000);
            } else {
                cancelUpload();
                addNotification("Extraction Error", data.message || "Failed to parse file.");
            }
        } catch (err) {
            cancelUpload();
            console.error("Bulk upload failed:", err);
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
                const createdGuest = await response.json();
                setShowModal(false);
                if (newGuest.whatsapp) {
                    const event = events.find(e => (e.id || e._id) === newGuest.eventId);
                    const eventName = event?.name || event?.title || 'Upcoming Event';
                    const senderName = user?.displayName || 'Your Host';
                    const location = event?.location || '';
                    const mapsUrl = location ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}` : '';
                    const passUrl = `${API_URL}/guests/pass/${createdGuest._id}`;
                    
                    let msg = `━━━━━━━━━━━━━━━━━━━━━\n`;
                    msg += `✨ *OFFICIAL INVITATION* ✨\n`;
                    msg += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
                    msg += `Dear *${newGuest.name}*,\n\n`;
                    msg += `You have been registered for *${eventName}*!\n\n`;
                    msg += `📅 *Date:* ${event?.date || 'Upcoming'}\n`;
                    if (location) {
                        msg += `📍 *Venue:* ${location}\n`;
                    }
                    msg += `🎫 *Access Pass:* ${createdGuest.category || 'Standard'} Pass\n`;
                    msg += `🔑 *Entry Code:* ${createdGuest.entryCode || '—'}\n\n`;
                    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
                    if (location) {
                        msg += `🗺️ *Directions:* ${mapsUrl}\n`;
                    }
                    msg += `🎟️ *View Digital Pass:* ${passUrl}\n`;
                    msg += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
                    msg += `We've sent more details to your email. We look forward to welcoming you!`;
                    
                    const waUrl = `https://api.whatsapp.com/send?phone=${newGuest.whatsapp.replace(/[^0-9]/g, "")}&text=${encodeURIComponent(msg)}`;
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
                addNotification("Attendee Onboarded", `${newGuest.name} has been added.`);
                fetchData(); // Immediate refresh
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
                setGuests(prev => prev.map(g => g._id === guestId ? { ...g, status: newStatus } : g));
                addNotification("Status Updated", `RSVP changed to ${newStatus}.`);
            }
        } catch (err) {
            console.error("Failed to update status:", err);
        }
    };

    const handleDeleteGuest = async (guestId) => {
        if (!hasEditorAccess) return;
        const confirmed = await showConfirm("Delete Attendee", "Are you sure you want to remove this guest?");
        if (!confirmed) return;
        try {
            const response = await fetch(`${API_URL}/guests/${guestId}`, {
                method: "DELETE"
            });
            if (response.ok) {
                setGuests(guests.filter(g => g._id !== guestId));
                addNotification("Deleted", "Attendee removed from list.");
            }
        } catch (err) {
            console.error("Failed to delete guest:", err);
        }
    };

    const exportCSV = () => {
        if (filteredGuests.length === 0) {
            addNotification("Export Error", "No attendee data available for extraction.");
            return;
        }
        const headers = ["Name", "Email", "Status", "Category", "Entry Code", "Dietary", "Notes"];
        const rows = filteredGuests.map(g => [
            g.name, g.email, g.status, g.category, g.entryCode || "—", g.dietary || "None", g.notes || ""
        ]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Planora_Attendees_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        addNotification("Export Synchronized", "Attendee manifest has been compiled and downloaded.");
    };

    const sendReminders = () => {
        const pendingCount = guests.filter(g => g.status === "Pending").length;
        if (pendingCount === 0) {
            addNotification("Sync Status", "All attendees have confirmed RSVPs.");
            return;
        }
        addNotification("Reminder Protocol", `Initiating RSVP reminders for ${pendingCount} pending attendees via synchronized channels.`);
    };

    const printBadges = () => {
        window.print();
    };

    // Filtering
    const filteredGuests = useMemo(() => {
        return guests.filter(g => {
            const matchesSearch = !searchQuery || 
                g.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                g.email?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === "All Status" || g.status === statusFilter;
            const matchesSegment = segmentFilter === "All Segments" || g.category === segmentFilter;
            return matchesSearch && matchesStatus && matchesSegment;
        });
    }, [guests, searchQuery, statusFilter, segmentFilter]);

    const stats = useMemo(() => ({
        total: guests.length,
        confirmed: guests.filter(g => g.status === "Confirmed").length,
        pending: guests.filter(g => g.status === "Pending").length,
        declined: guests.filter(g => g.status === "Declined").length,
    }), [guests]);

    // Dynamic Analytics
    const velocityData = useMemo(() => {
        const last7Days = Array.from({length: 10}, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (9 - i));
            return d.toISOString().split('T')[0];
        });
        
        const counts = last7Days.map(date => {
            return guests.filter(g => g.createdAt?.startsWith(date)).length;
        });
        
        const max = Math.max(...counts, 1);
        return counts.map(c => (c / max) * 100);
    }, [guests]);

    const cateringData = useMemo(() => {
        const total = guests.length || 1;
        const vegan = guests.filter(g => g.dietary === "Vegan").length;
        const vegetarian = guests.filter(g => g.dietary === "Vegetarian").length;
        const gf = guests.filter(g => g.dietary === "Gluten-Free").length;
        
        return [
            { label: "Vegan", count: vegan, percent: (vegan / total) * 100 },
            { label: "Vegetarian", count: vegetarian, percent: (vegetarian / total) * 100 },
            { label: "Gluten-Free", count: gf, percent: (gf / total) * 100 }
        ];
    }, [guests]);

    const paginatedGuests = filteredGuests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(filteredGuests.length / itemsPerPage);

    const categories = ["All Segments", ...new Set(guests.map(g => g.category))];

    return (
        <div style={{
            padding: "2rem",
            color: "#fff",
            fontFamily: "'Inter', sans-serif",
            maxWidth: "1400px",
            margin: "0 auto",
            minHeight: "100vh",
            backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px)",
            backgroundSize: "32px 32px"
        }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
                <div>
                    <h1 style={{ fontSize: "1.85rem", fontWeight: 800, margin: 0, letterSpacing: "-0.04em" }}>Attendee Directory</h1>
                    <p style={{ color: "#64748b", marginTop: "0.25rem", fontSize: "0.85rem" }}>Monitor attendance velocity and catering preferences in real-time.</p>
                </div>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                    {isProfessionalEvent && (
                        <button onClick={() => setShowBadges(!showBadges)} style={{ background: showBadges ? "#f97316" : "#111", border: "1px solid #222", color: "#fff", padding: "0.6rem 1rem", borderRadius: "8px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem" }}>
                            <CreditCard size={16} />
                            {showBadges ? "Table View" : "View Badges"}
                        </button>
                    )}
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px", alignItems: "flex-end" }}>
                        <button onClick={() => document.getElementById('bulk-upload-input').click()} disabled={bulkLoading} style={{ background: "#111", border: "1px solid #222", color: "#fff", padding: "0.6rem 1rem", borderRadius: "8px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem" }}>
                            {bulkLoading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                            Bulk Onboarding
                            <input id="bulk-upload-input" type="file" hidden onChange={handleBulkUpload} />
                        </button>
                        <span onClick={downloadSampleCSV} style={{ fontSize: "10px", color: "#f97316", textDecoration: "underline", cursor: "pointer", fontWeight: 700, marginTop: "4px" }}>
                            Download Sample Excel
                        </span>
                    </div>
                    <button onClick={() => setShowModal(true)} style={{ background: "#f97316", color: "#fff", border: "none", padding: "0.6rem 1rem", borderRadius: "8px", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem" }}>
                        <UserPlus size={16} />
                        Add Attendee
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.25rem", marginBottom: "2rem" }}>
                {[
                    { label: "TOTAL INVITED", value: stats.total, border: "#f97316", sub: "base population" },
                    { label: "CONFIRMED", value: stats.confirmed, border: "#10b981", sub: `${stats.total > 0 ? Math.round((stats.confirmed/stats.total)*100) : 0}% of total` },
                    { label: "PENDING", value: stats.pending, border: "#f59e0b", sub: `${stats.total > 0 ? Math.round((stats.pending/stats.total)*100) : 0}% remaining` },
                    { label: "DECLINED", value: stats.declined, border: "#ef4444", sub: `${stats.total > 0 ? Math.round((stats.declined/stats.total)*100) : 0}% attrition` }
                ].map((s, i) => (
                    <div key={i} style={{ background: "#111", padding: "1rem", borderRadius: "12px", border: "1px solid #1a1a1a", borderTop: `3px solid ${s.border}` }}>
                        <div style={{ color: "#64748b", fontSize: "0.65rem", fontWeight: 900, letterSpacing: "0.1em", marginBottom: "0.25rem" }}>{s.label}</div>
                        <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#fff" }}>{s.value}</div>
                        <div style={{ fontSize: "0.65rem", color: "#475569", fontWeight: 700, marginTop: "2px" }}>{s.sub}</div>
                    </div>
                ))}
            </div>

            {/* Analytics Strip (Moved Up) */}
            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
                <div className="card" style={{ padding: "1.25rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                        <h3 style={{ fontSize: "0.8rem", fontWeight: 900, letterSpacing: "0.05em", color: "#64748b" }}>REGISTRATION VELOCITY</h3>
                        <div className="pulse-live" style={{ background: "rgba(249,115,22,0.1)", color: "#f97316", padding: "2px 8px", borderRadius: "4px", fontSize: "0.6rem", fontWeight: 900 }}>LIVE</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: "100px" }}>
                        {velocityData.map((h, i) => (
                            <div key={i} style={{ flex: 1, background: h > 50 ? "#f97316" : "#222", height: `${Math.max(h, 5)}%`, borderRadius: "3px", transition: "height 0.3s ease" }}></div>
                        ))}
                    </div>
                </div>
                <div className="card" style={{ padding: "1.25rem" }}>
                    <h3 style={{ fontSize: "0.8rem", fontWeight: 900, letterSpacing: "0.05em", marginBottom: "1.25rem", color: "#64748b" }}>ATTENDEE SEGMENTS</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {cateringData.map((item, idx) => (
                            <div key={idx}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "0.75rem" }}>
                                    <span style={{ fontWeight: 700, color: "#cbd5e1" }}>{item.label}</span>
                                    <span style={{ fontWeight: 800, color: "#f97316" }}>{item.count}</span>
                                </div>
                                <div style={{ height: "4px", background: "#222", borderRadius: "2px", overflow: "hidden" }}>
                                    <div style={{ width: `${item.percent}%`, height: "100%", background: "#f97316", transition: "width 0.5s ease" }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Controls & Quick Actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", gap: "1rem" }}>
                    <div style={{ position: "relative", flex: 1 }}>
                        <Search size={16} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
                        <input 
                            placeholder="Search by name, tag, or email..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            style={{ width: "100%", background: "#111", border: "1px solid #1a1a1a", borderRadius: "10px", padding: "0.6rem 1rem 0.6rem 2.5rem", color: "#fff", outline: "none", fontSize: "0.85rem" }} 
                        />
                    </div>
                    <div className="custom-select">
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: "0.6rem 2.5rem 0.6rem 1rem", fontSize: "0.85rem" }}>
                            <option value="All Status">RSVP Status</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Pending">Pending</option>
                            <option value="Declined">Declined</option>
                        </select>
                        <ChevronDown size={16} />
                    </div>
                    <div className="custom-select">
                        <select value={segmentFilter} onChange={e => setSegmentFilter(e.target.value)} style={{ padding: "0.6rem 2.5rem 0.6rem 1rem", fontSize: "0.85rem" }}>
                            {categories.map(c => <option key={c} value={c}>{c === "All Segments" ? "Segment" : c}</option>)}
                        </select>
                        <ChevronDown size={16} />
                    </div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button onClick={sendReminders} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid #1a1a1a", color: "#64748b", padding: "0.35rem 0.8rem", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>Send Reminder to Pending</button>
                    <button onClick={exportCSV} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid #1a1a1a", color: "#64748b", padding: "0.35rem 0.8rem", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>Export CSV</button>
                    {isProfessionalEvent && (
                        <button onClick={printBadges} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid #1a1a1a", color: "#64748b", padding: "0.35rem 0.8rem", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>Print Badges</button>
                    )}
                </div>
            </div>

            {showBadges && isProfessionalEvent ? (
                /* ─── BADGE GRID VIEW ─── */
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
                    {filteredGuests.map(g => {
                        const ev = events.find(e => (e.id || e._id) === (g.event?._id || g.event));
                        const evName = ev?.name || "Event";
                        const evType = (ev?.type || "Other").toLowerCase();
                        const personalTypes = ["wedding", "party", "birthday", "anniversary", "baby shower", "engagement", "reception", "family"];
                        const isPersonal = personalTypes.some(t => evType.includes(t));
                        const statusColor = g.status === "Confirmed" ? "#10b981" : g.status === "Declined" ? "#ef4444" : "#f59e0b";

                        if (isPersonal) {
                            // ─── PERSONAL GREETING CARD ───
                            const greetings = { wedding: { msg: "You're Cordially Invited", gradient: "linear-gradient(135deg, #d4a574, #b8860b)" }, party: { msg: "Let's Celebrate!", gradient: "linear-gradient(135deg, #ec4899, #8b5cf6)" }, birthday: { msg: "It's a Celebration!", gradient: "linear-gradient(135deg, #f97316, #ef4444)" } };
                            const match = Object.keys(greetings).find(k => evType.includes(k));
                            const { msg, gradient } = match ? greetings[match] : { msg: "You're Invited!", gradient: "linear-gradient(135deg, #06b6d4, #3b82f6)" };

                            return (
                                <div key={g._id} style={{ background: "#0a0a0c", borderRadius: "24px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", transition: "transform 0.2s" }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
                                >
                                    <div style={{ background: gradient, padding: "40px 28px 30px", textAlign: "center", position: "relative", overflow: "hidden" }}>
                                        <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "120px", height: "120px", background: "rgba(255,255,255,0.08)", borderRadius: "50%" }}></div>
                                        <p style={{ margin: 0, fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.8)" }}>{msg}</p>
                                        <h3 style={{ margin: "10px 0 0", fontSize: "22px", fontWeight: 900, fontFamily: "'Georgia', serif", color: "#fff" }}>{evName}</h3>
                                    </div>
                                    <div style={{ padding: "30px 28px", textAlign: "center" }}>
                                        <p style={{ margin: 0, fontSize: "13px", color: "rgba(255,255,255,0.45)" }}>Dear</p>
                                        <h3 style={{ margin: "6px 0 4px", fontSize: "20px", fontWeight: 800, fontFamily: "'Georgia', serif" }}>{g.name}</h3>
                                        <p style={{ margin: 0, fontSize: "12px", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{g.category} Guest</p>
                                        <div style={{ width: "40px", height: "2px", background: "rgba(255,255,255,0.1)", margin: "20px auto" }}></div>
                                        <div style={{ display: "flex", justifyContent: "center", gap: "8px", fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "16px" }}>
                                            <span>👥 Attendees: {g.familySize || 1}</span>
                                            <span>·</span>
                                            <span>{g.dietary !== "None" && g.dietary ? g.dietary : "No restrictions"}</span>
                                        </div>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", textAlign: "left", marginBottom: "16px" }}>
                                            <div style={{ background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.04)" }}>
                                                <p style={{ margin: 0, fontSize: "9px", color: "rgba(255,255,255,0.3)", fontWeight: 800, textTransform: "uppercase" }}>Date</p>
                                                <p style={{ margin: "4px 0 0", fontSize: "13px", fontWeight: 700, color: "#fff" }}>{ev?.date || "TBD"}</p>
                                            </div>
                                            <div style={{ background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.04)" }}>
                                                <p style={{ margin: 0, fontSize: "9px", color: "rgba(255,255,255,0.3)", fontWeight: 800, textTransform: "uppercase" }}>Location</p>
                                                <p style={{ margin: "4px 0 0", fontSize: "13px", fontWeight: 700, color: "#fff" }}>{ev?.city || "TBD"}</p>
                                            </div>
                                        </div>
                                        {ev?.location && (
                                            <div style={{ background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.04)", textAlign: "left", marginBottom: "16px" }}>
                                                <p style={{ margin: 0, fontSize: "9px", color: "rgba(255,255,255,0.3)", fontWeight: 800, textTransform: "uppercase" }}>Venue</p>
                                                <p style={{ margin: "4px 0 0", fontSize: "13px", fontWeight: 600, color: "#f1f5f9" }}>{ev.location}</p>
                                            </div>
                                        )}
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                                            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: statusColor }}></div>
                                            <span style={{ fontSize: "11px", fontWeight: 800, color: statusColor }}>{g.status}</span>
                                        </div>
                                    </div>
                                    <div style={{ padding: "14px 24px", borderTop: "1px solid rgba(255,255,255,0.04)", textAlign: "center" }}>
                                        <p style={{ margin: 0, fontSize: "10px", color: "rgba(255,255,255,0.15)" }}>With love — Planora</p>
                                    </div>
                                </div>
                            );
                        }

                        // ─── COMMERCIAL / TECH / COLLEGE BADGE (LinkedIn-shareable) ───
                        const categoryColors = {
                            "VIP": { color: "#f59e0b", name: "VIP PASS", bg: "rgba(245, 158, 11, 0.15)" },
                            "Tech": { color: "#06b6d4", name: "TECH SPECIALIST", bg: "rgba(6, 182, 212, 0.15)" },
                            "Business": { color: "#a855f7", name: "BUSINESS DELEGATE", bg: "rgba(168, 85, 247, 0.15)" },
                            "Friend": { color: "#10b981", name: "GUEST ACCESS", bg: "rgba(16, 185, 129, 0.15)" },
                            "Family": { color: "#ec4899", name: "GUEST ACCESS", bg: "rgba(236, 72, 153, 0.15)" }
                        };
                        const categoryConfig = categoryColors[g.category] || { color: "#f97316", name: `${g.category.toUpperCase()} ACCESS`, bg: "rgba(249, 115, 22, 0.15)" };

                        return (
                            <div key={g._id} style={{ 
                                background: "rgba(10, 10, 12, 0.6)", 
                                borderRadius: "24px", 
                                overflow: "hidden", 
                                border: "1px solid rgba(255,255,255,0.08)", 
                                backdropFilter: "blur(20px)",
                                WebkitBackdropFilter: "blur(20px)",
                                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
                            }}
                                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = `0 20px 40px ${categoryConfig.color}22`; e.currentTarget.style.borderColor = `${categoryConfig.color}44`; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.3)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
                            >
                                <div style={{ background: `linear-gradient(135deg, ${categoryConfig.color}cc 0%, #1e1b4b 100%)`, padding: "30px 24px 24px", position: "relative", overflow: "hidden" }}>
                                    <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "100px", height: "100px", background: "rgba(255,255,255,0.08)", borderRadius: "50%" }}></div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", zIndex: 1, position: "relative" }}>
                                        <div>
                                            <p style={{ margin: 0, fontSize: "9px", fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)" }}>{evName}</p>
                                            <h3 style={{ margin: "8px 0 0", fontSize: "22px", fontWeight: 900, color: "#fff", letterSpacing: "-0.02em" }}>{g.name}</h3>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(0,0,0,0.3)", padding: "4px 10px", borderRadius: "100px", border: "1px solid rgba(255,255,255,0.1)" }}>
                                            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: statusColor }}></div>
                                            <span style={{ fontSize: "9px", fontWeight: 800, color: statusColor, letterSpacing: "0.05em" }}>{g.status.toUpperCase()}</span>
                                        </div>
                                    </div>
                                    <span style={{ display: "inline-block", background: "rgba(255,255,255,0.12)", color: "#fff", fontSize: "9px", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", padding: "4px 10px", borderRadius: "6px", marginTop: "16px" }}>{categoryConfig.name}</span>
                                </div>
                                <div style={{ padding: "24px" }}>
                                    <div style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", padding: "20px", textAlign: "center", marginBottom: "20px", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)" }}>
                                        <p style={{ margin: 0, fontSize: "9px", fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: categoryConfig.color }}>Entry Code</p>
                                        <p style={{ margin: "8px 0 0", fontFamily: "'JetBrains Mono', monospace", fontSize: "30px", fontWeight: 800, letterSpacing: "0.18em", color: "#fff", textShadow: `0 0 10px ${categoryConfig.color}44` }}>{g.entryCode || "—"}</p>
                                    </div>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
                                        <div style={{ background: "rgba(255,255,255,0.01)", padding: "12px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.03)" }}>
                                            <p style={{ margin: 0, fontSize: "9px", color: "rgba(255,255,255,0.3)", fontWeight: 800, textTransform: "uppercase" }}>Email</p>
                                            <p style={{ margin: "4px 0 0", fontSize: "11px", fontWeight: 600, color: "#cbd5e1", wordBreak: "break-all" }}>{g.email || "—"}</p>
                                        </div>
                                        <div style={{ background: "rgba(255,255,255,0.01)", padding: "12px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.03)" }}>
                                            <p style={{ margin: 0, fontSize: "9px", color: "rgba(255,255,255,0.3)", fontWeight: 800, textTransform: "uppercase" }}>Scheduled Date</p>
                                            <p style={{ margin: "4px 0 0", fontSize: "11px", fontWeight: 600, color: "#cbd5e1" }}>{ev?.date || "—"}</p>
                                        </div>
                                    </div>
                                    {(g.linkedIn || g.portfolio) && (
                                        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                                            {g.linkedIn && <a href={g.linkedIn} target="_blank" rel="noreferrer" style={{ flex: 1, background: "rgba(6, 182, 212, 0.08)", color: "#06b6d4", padding: "10px", borderRadius: "10px", textAlign: "center", fontSize: "11px", fontWeight: 800, textDecoration: "none", border: "1px solid rgba(6, 182, 212, 0.15)", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.background="rgba(6, 182, 212, 0.15)"} onMouseLeave={e => e.currentTarget.style.background="rgba(6, 182, 212, 0.08)"}>LinkedIn</a>}
                                            {g.portfolio && <a href={g.portfolio} target="_blank" rel="noreferrer" style={{ flex: 1, background: "rgba(255,255,255,0.03)", color: "#cbd5e1", padding: "10px", borderRadius: "10px", textAlign: "center", fontSize: "11px", fontWeight: 800, textDecoration: "none", border: "1px solid rgba(255,255,255,0.06)", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.06)"} onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.03)"}>Portfolio</a>}
                                        </div>
                                    )}
                                </div>
                                <div style={{ padding: "14px 24px", borderTop: "1px solid rgba(255,255,255,0.04)", textAlign: "center" }}>
                                    <p style={{ margin: 0, fontSize: "9px", color: "rgba(255,255,255,0.2)", fontWeight: 700, letterSpacing: "0.05em" }}>PLANORA SMART BADGE</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
            <>
            {/* Table */}
            <div style={{ background: "#111", borderRadius: "20px", border: "1px solid #1a1a1a", overflow: "hidden" }}>
                {paginatedGuests.length > 0 ? (
                    <>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ textAlign: "left", borderBottom: "1px solid #1a1a1a" }}>
                                    <th style={thStyle}>ATTENDEE</th>
                                    <th style={thStyle}>CONTACT</th>
                                    <th style={thStyle}>RSVP</th>
                                    <th style={thStyle}>ENTRY CODE</th>
                                    <th style={thStyle}>SEGMENT</th>
                                    <th style={thStyle}>ATTENDEES</th>
                                    <th style={{ ...thStyle, textAlign: "right" }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedGuests.map(g => (
                                    <tr key={g._id} style={{ borderBottom: "1px solid #1a1a1a" }}>
                                        <td style={tdStyle}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                                <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(249,115,22,0.1)", color: "#f97316", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>
                                                    {g.name?.charAt(0).toLowerCase()}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 700, fontSize: "1rem" }}>{g.name}</div>
                                                    <div style={{ fontSize: "0.8rem", color: "#64748b" }}>{g.category}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={tdStyle}>
                                            <div style={{ fontSize: "0.9rem", color: "#cbd5e1" }}>{g.email}</div>
                                            <div style={{ fontSize: "0.85rem", color: "#64748b" }}>{g.whatsapp}</div>
                                        </td>
                                        <td style={tdStyle}>
                                            <div 
                                                onClick={() => {
                                                    const cycle = { Pending: "Confirmed", Confirmed: "Declined", Declined: "Pending" };
                                                    updateStatus(g._id, cycle[g.status] || "Pending");
                                                }}
                                                style={{ 
                                                    display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.4rem 1rem", borderRadius: "100px", 
                                                    border: "1px solid rgba(249,115,22,0.2)", cursor: "pointer", background: "rgba(249,115,22,0.05)"
                                                }}
                                            >
                                                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: g.status === "Confirmed" ? "#10b981" : "#f97316" }}></div>
                                                <span style={{ color: g.status === "Confirmed" ? "#10b981" : "#f97316", fontWeight: 600, fontSize: "0.85rem" }}>{g.status}</span>
                                            </div>
                                        </td>
                                        <td style={tdStyle}>
                                            <span style={{ 
                                                fontFamily: "'JetBrains Mono', 'Courier New', monospace", 
                                                background: "rgba(249,115,22,0.08)", 
                                                color: "#f97316", 
                                                padding: "0.35rem 0.75rem", 
                                                borderRadius: "8px", 
                                                fontSize: "0.85rem", 
                                                fontWeight: 800, 
                                                letterSpacing: "0.1em",
                                                border: "1px solid rgba(249,115,22,0.15)"
                                            }}>{g.entryCode || "—"}</span>
                                        </td>
                                        <td style={tdStyle}>
                                            <span style={{ background: "#1a1a1a", padding: "0.4rem 0.8rem", borderRadius: "8px", fontSize: "0.8rem", color: "#94a3b8" }}>{g.category}</span>
                                        </td>
                                        <td style={tdStyle}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.95rem", fontWeight: 700 }}>
                                                <Users size={14} style={{ color: "#64748b" }} />
                                                {g.familySize || 1}
                                            </div>
                                        </td>
                                        <td style={{ ...tdStyle, textAlign: "right" }}>
                                            <button onClick={() => handleDeleteGuest(g._id)} style={{ background: "rgba(239,68,68,0.05)", border: "none", color: "#ef4444", padding: "0.5rem", borderRadius: "8px", cursor: "pointer" }}>
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div style={{ padding: "1.25rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", color: "#64748b", fontSize: "0.85rem", borderTop: "1px solid #1a1a1a" }}>
                            <div>Showing <strong>{paginatedGuests.length}</strong> of <strong>{filteredGuests.length}</strong> attendees</div>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-btn"><ChevronLeft size={18} /></button>
                                <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-btn"><ChevronRight size={18} /></button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div style={{ padding: "4rem 2rem", textAlign: "center", minHeight: "240px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(249,115,22,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#f97316", marginBottom: "1.5rem" }}>
                            <Users size={24} />
                        </div>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "0.5rem" }}>No Attendees Found</h3>
                        <p style={{ color: "#64748b", fontSize: "0.85rem", marginBottom: "1.5rem", maxWidth: "300px" }}>Start building your guest list by adding your first attendee manually or via bulk upload.</p>
                        <button onClick={() => setShowModal(true)} style={{ background: "#f97316", color: "#fff", border: "none", padding: "0.6rem 1.25rem", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontSize: "0.85rem" }}>
                            Add Your First Attendee
                        </button>
                    </div>
                )}
            </div>

            </>
            )}

            {/* Modal */}
            {showModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, backdropFilter: "blur(10px)" }}>
                    <div style={{ background: "#0c0c0c", width: "100%", maxWidth: "560px", padding: "2.5rem", borderRadius: "24px", border: "1px solid #1a1a1a" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2rem" }}>
                            <h2 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Add Attendee</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleCreateGuest} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                <input placeholder="Full Name" style={inputStyle} value={newGuest.name} onChange={e => setNewGuest({ ...newGuest, name: e.target.value })} required />
                                <select style={inputStyle} value={newGuest.eventId} onChange={e => setNewGuest({ ...newGuest, eventId: e.target.value })} required>
                                    {events.map(e => <option key={e.id || e._id} value={e.id || e._id}>{e.name}</option>)}
                                </select>
                            </div>
                            <input type="email" placeholder="Email Address" style={inputStyle} value={newGuest.email} onChange={e => setNewGuest({ ...newGuest, email: e.target.value })} required />
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                <input placeholder="Phone / WhatsApp" style={inputStyle} value={newGuest.whatsapp} onChange={e => setNewGuest({ ...newGuest, whatsapp: e.target.value })} />
                                <select style={inputStyle} value={newGuest.category} onChange={e => setNewGuest({ ...newGuest, category: e.target.value })}>
                                    <option>Friend</option><option>Family</option><option>VIP</option><option>Business</option><option>Tech</option>
                                </select>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                <select style={inputStyle} value={newGuest.dietary} onChange={e => setNewGuest({ ...newGuest, dietary: e.target.value })}>
                                    <option value="None">No Dietary Pref</option>
                                    <option value="Vegan">Vegan</option>
                                    <option value="Vegetarian">Vegetarian</option>
                                    <option value="Gluten-Free">Gluten-Free</option>
                                </select>
                                <input placeholder="Notes" style={inputStyle} value={newGuest.notes} onChange={e => setNewGuest({ ...newGuest, notes: e.target.value })} />
                            </div>
                            <button type="submit" style={{ background: "#f97316", color: "#fff", padding: "1rem", borderRadius: "12px", fontWeight: 700, border: "none", cursor: "pointer", marginTop: "1rem" }}>Confirm Onboarding</button>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .custom-select { position: relative; }
                .custom-select select { background: #111; border: 1px solid #1a1a1a; border-radius: 10px; padding: 0.6rem 2.5rem 0.6rem 1rem; color: #fff; appearance: none; cursor: pointer; font-weight: 600; min-width: 140px; }
                .custom-select svg { position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); color: #64748b; pointer-events: none; }
                .thStyle { padding: 1rem 1.5rem; color: #64748b; font-size: 0.7rem; font-weight: 900; letter-spacing: 0.05em; text-transform: uppercase; }
                .tdStyle { padding: 1rem 1.5rem; }
                .p-btn { background: #111; border: 1px solid #1a1a1a; border-radius: 8px; padding: 0.5rem; cursor: pointer; color: #fff; }
                .p-btn:disabled { opacity: 0.3; cursor: default; }
                .card { background: #111; border-radius: 20px; border: 1px solid #1a1a1a; padding: 1.5rem; display: flex; flex-direction: column; }
                select option { background: #0c0c0c; color: #fff; }
                .pulse-live { animation: pulse 2s infinite; }
                @keyframes pulse {
                    0% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.6; transform: scale(0.95); }
                    100% { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
}

const thStyle = { padding: "1.25rem 1.5rem", color: "#64748b", fontSize: "0.75rem", fontWeight: "800", letterSpacing: "0.05em" };
const tdStyle = { padding: "1.25rem 1.5rem" };
const inputStyle = { width: "100%", padding: "0.85rem 1rem", borderRadius: "10px", background: "#1a1a1a", border: "1px solid #222", color: "#fff", outline: "none" };
