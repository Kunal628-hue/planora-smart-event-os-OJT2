import { useState, useEffect, useMemo, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { useDialog } from "../../context/DialogContext";
import { 
    UserPlus, 
    Users, 
    Trash2, 
    Mail, 
    Briefcase, 
    Loader2, 
    X, 
    Calendar, 
    Phone, 
    Upload, 
    Search, 
    ChevronDown, 
    ChevronLeft, 
    ChevronRight, 
    Download, 
    MoreHorizontal,
    TrendingUp, 
    PieChart, 
    CreditCard, 
    Grid3X3,
    MessageCircle,
    Copy,
    CheckCircle2,
    Clock,
    XCircle,
    Sparkles,
    Send,
    FileSpreadsheet,
    Share2,
    Utensils,
    ExternalLink
} from "lucide-react";
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import { useUpload } from "../../context/UploadContext";
import { validateEmail, validatePhone } from "../../utils/validation";

const API_URL = import.meta.env.VITE_API_URL;

export default function Guests() {
    const { user, events, selectedEventId, syncTimestamp, addNotification, hasFullAccess, hasEditorAccess } = useOutletContext();
    const { showConfirm, showAlert } = useDialog();
    const { startUpload, completeUpload, cancelUpload } = useUpload();
    
    // State
    const [guests, setGuests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showBadges, setShowBadges] = useState(false);
    const [showReminderModal, setShowReminderModal] = useState(false);
    
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
        return events.find(e => (e.id || e._id) === selectedEventId) || events[0] || null;
    }, [events, selectedEventId]);

    // Fetch Data
    const fetchData = async (isSilent = false) => {
        if (!user) return;
        if (!isSilent) setLoading(true);
        try {
            let url = `${API_URL}/guests`;
            if (selectedEventId) url += `?eventId=${selectedEventId}`;
            const res = await fetch(url, {
                headers: { "x-user-id": user.uid, "x-user-email": user.email || "" }
            });
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();
            setGuests(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Fetch error:", err);
            if (!isSilent) setGuests([]);
        } finally {
            if (!isSilent) setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user, selectedEventId, syncTimestamp]);

    useEffect(() => {
        if (selectedEventId) {
            setNewGuest(prev => ({ ...prev, eventId: selectedEventId }));
        }
    }, [selectedEventId]);

    // Helper: Get robust passcode for badges and table
    const getPasscode = (guest) => {
        if (!guest) return "PLN-888";
        if (guest.entryCode && guest.entryCode !== "—" && guest.entryCode !== "-") return guest.entryCode;
        if (guest._id) return String(guest._id).substring(String(guest._id).length - 6).toUpperCase();
        if (guest.id) return String(guest.id).substring(String(guest.id).length - 6).toUpperCase();
        return "A7F3B2";
    };

    const generateInviteMessage = (guest, eventObj) => {
        const ev = eventObj || events.find(e => (e.id || e._id) === (guest.event?._id || guest.event)) || activeEvent;
        const eventName = ev?.name || ev?.title || 'Planora Smart Event';
        const eventDate = ev?.date ? new Date(ev.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Upcoming';
        
        const venueLocation = ev?.location || ev?.city || 'Venue TBD';
        const mapsUrl = (venueLocation && venueLocation !== 'Venue TBD' && !venueLocation.startsWith('http'))
            ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venueLocation)}`
            : '';

        const passUrl = `${window.location.origin}/pass/${guest._id || guest.id}`;
        
        let msg = `━━━━━━━━━━━━━━━━━━━━━\n`;
        msg += `✨ *OFFICIAL EVENT INVITATION* ✨\n`;
        msg += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
        msg += `Dear *${guest.name}*,\n\n`;
        msg += `You are cordially invited to *${eventName}*!\n\n`;
        msg += `📅 *Date:* ${eventDate}\n`;
        msg += `📍 *Venue:* ${venueLocation.startsWith('http') ? (ev?.city || 'Venue Location') : venueLocation}\n`;
        if (mapsUrl) {
            msg += `🗺️ *Google Maps:* ${mapsUrl}\n`;
        }
        msg += `🏷️ *Pass Category:* ${guest.category || 'Standard'} Pass\n`;
        msg += `🔑 *Entry Code:* ${getPasscode(guest)}\n`;
        if (guest.familySize && guest.familySize > 1) {
            msg += `👥 *Reserved Seats:* ${guest.familySize}\n`;
        }
        msg += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
        msg += `🎟️ *View Digital Pass:* ${passUrl}\n`;
        msg += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
        msg += `Please reply to confirm your attendance. We look forward to welcoming you!`;

        return msg;
    };

    // Direct Messaging Handlers
    const sendWhatsAppInvite = (guest) => {
        if (!guest.whatsapp) {
            showAlert("Contact Info Missing", `No WhatsApp phone number registered for ${guest.name}. Please edit attendee details to add a phone number.`);
            return;
        }
        const cleanPhone = guest.whatsapp.replace(/[^0-9]/g, "");
        const message = generateInviteMessage(guest);
        const waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
        window.open(waUrl, "_blank");
        addNotification("WhatsApp Dispatched", `Opened WhatsApp invitation stream for ${guest.name}.`);
    };

    const sendEmailInvite = (guest) => {
        if (!guest.email) {
            showAlert("Contact Info Missing", `No email address registered for ${guest.name}. Please edit attendee details to add an email address.`);
            return;
        }
        const ev = events.find(e => (e.id || e._id) === (guest.event?._id || guest.event)) || activeEvent;
        const eventName = ev?.name || ev?.title || 'Planora Event';
        const subject = `Official Invitation: ${eventName}`;
        const body = generateInviteMessage(guest, ev);
        const mailtoUrl = `mailto:${guest.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(mailtoUrl, "_blank");
        addNotification("Email Dispatched", `Opened mail client to send invitation to ${guest.email}.`);
    };

    const copyPassLink = (guest) => {
        const passUrl = `${window.location.origin}/guests/pass/${guest._id || guest.id}`;
        navigator.clipboard.writeText(passUrl);
        addNotification("Link Copied", `Digital access pass URL copied for ${guest.name}.`);
    };

    // Bulk Onboarding & Handlers
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
                addNotification("Bulk Onboarding Complete", data.message || "Attendee manifest processed.");
                fetchData();
            } else if (response.status === 429) {
                cancelUpload();
                addNotification("AI Rate Limit", "The AI processing engine is busy. Please try again in 1 minute.");
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
        const targetEventId = newGuest.eventId || selectedEventId || (events.length > 0 ? (events[0].id || events[0]._id) : null);
        
        if (!targetEventId) {
            await showAlert("Event Missing", "Please select an event context for this attendee.");
            return;
        }

        if (newGuest.email) {
            const emailCheck = validateEmail(newGuest.email, false);
            if (!emailCheck.valid) {
                await showAlert("Invalid Email Address", emailCheck.message);
                return;
            }
        }

        if (newGuest.whatsapp) {
            const phoneCheck = validatePhone(newGuest.whatsapp, false);
            if (!phoneCheck.valid) {
                await showAlert("Invalid Phone Number", phoneCheck.message);
                return;
            }
        }

        const payload = {
            name: newGuest.name.trim(),
            category: newGuest.category || "General",
            status: newGuest.status || "Pending",
            event: targetEventId,
            user: user.uid,
            familySize: parseInt(newGuest.familySize) || 1
        };

        if (newGuest.email && newGuest.email.trim()) payload.email = newGuest.email.trim();
        if (newGuest.whatsapp && newGuest.whatsapp.trim()) payload.whatsapp = newGuest.whatsapp.trim();
        if (newGuest.linkedIn && newGuest.linkedIn.trim()) payload.linkedIn = newGuest.linkedIn.trim();
        if (newGuest.portfolio && newGuest.portfolio.trim()) payload.portfolio = newGuest.portfolio.trim();
        if (newGuest.dietary && newGuest.dietary.trim()) payload.dietary = newGuest.dietary.trim();
        if (newGuest.notes && newGuest.notes.trim()) payload.notes = newGuest.notes.trim();

        try {
            const response = await fetch(`${API_URL}/guests`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const createdGuest = await response.json();
                setShowModal(false);
                
                // AUTOMATIC INVITE DISPATCH FOR BOTH WHATSAPP AND EMAIL
                // 1. Email is automatically dispatched by backend createGuest -> sendInvitation
                // 2. WhatsApp is automatically triggered right here
                if (createdGuest.whatsapp || newGuest.whatsapp) {
                    sendWhatsAppInvite({
                        ...createdGuest,
                        whatsapp: createdGuest.whatsapp || newGuest.whatsapp,
                        entryCode: getPasscode(createdGuest)
                    });
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
                    portfolio: "",
                    dietary: "None",
                    notes: ""
                });
                fetchData();
                addNotification("Automatic Invitation Dispatched", `Onboarded ${createdGuest.name} — Invitation email sent & WhatsApp stream opened.`);
            } else {
                const errorData = await response.json();
                await showAlert("Validation Error", errorData.message || "Failed to onboard guest.");
            }
        } catch (err) {
            console.error("Failed to add guest:", err);
        }
    };

    const updateStatus = async (guestId, newStatus) => {
        try {
            const response = await fetch(`${API_URL}/guests/${guestId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            });
            if (response.ok) {
                setGuests(prev => prev.map(g => g._id === guestId ? { ...g, status: newStatus } : g));
                addNotification("RSVP Updated", `Status changed to ${newStatus}.`);
            }
        } catch (err) {
            console.error("Failed to update status:", err);
        }
    };

    const handleDeleteGuest = async (guestId) => {
        const confirmed = await showConfirm("Delete Attendee", "Are you sure you want to remove this attendee from the roster?");
        if (!confirmed) return;
        try {
            const response = await fetch(`${API_URL}/guests/${guestId}`, { method: "DELETE" });
            if (response.ok) {
                setGuests(guests.filter(g => g._id !== guestId));
                addNotification("Attendee Removed", "Guest detached from roster.");
            }
        } catch (err) {
            console.error("Failed to delete guest:", err);
        }
    };

    const exportCSV = () => {
        if (filteredGuests.length === 0) {
            addNotification("Export Warning", "No attendee records available to export.");
            return;
        }
        const headers = ["Name", "Email", "WhatsApp / Phone", "Status", "Category", "Entry Code", "Dietary", "Notes"];
        const rows = filteredGuests.map(g => [
            `"${g.name || ''}"`,
            `"${g.email || ''}"`,
            `"${g.whatsapp || ''}"`,
            `"${g.status || ''}"`,
            `"${g.category || ''}"`,
            `"${g.entryCode || ''}"`,
            `"${g.dietary || 'None'}"`,
            `"${(g.notes || '').replace(/"/g, '""')}"`
        ]);
        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Attendee_Manifest_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        addNotification("Export Complete", "Attendee manifest downloaded.");
    };

    const downloadSampleCSV = () => {
        const headers = ["Full Name", "Email", "Phone / WhatsApp", "Category (Tech/VIP/Friend/Family)", "Attendees Size", "Dietary (None/Vegetarian/Vegan)", "Notes"];
        const rows = [
            ["Alex Rivera", "alex@example.com", "+919876543210", "Tech", "1", "Vegetarian", "Keynote attendee"],
            ["Sophia Chen", "sophia@example.com", "+918765432109", "VIP", "2", "None", "Special guest"]
        ];
        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "Sample_Attendee_Template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        addNotification("Template Downloaded", "Sample CSV template generated.");
    };

    const sendBatchReminders = (channel) => {
        const pendingGuests = guests.filter(g => g.status === "Pending");
        if (pendingGuests.length === 0) {
            addNotification("Status Sync", "All attendees have already responded to RSVPs.");
            setShowReminderModal(false);
            return;
        }

        if (channel === "whatsapp") {
            const firstPending = pendingGuests.find(g => g.whatsapp);
            if (firstPending) {
                sendWhatsAppInvite(firstPending);
            }
            addNotification("Batch Reminder Initiated", `Opening WhatsApp reminder stream for ${pendingGuests.length} pending attendees.`);
        } else {
            const emails = pendingGuests.map(g => g.email).filter(Boolean).join(",");
            const ev = activeEvent;
            const subject = `RSVP Reminder: ${ev?.name || 'Upcoming Event'}`;
            const body = `Dear Guest,\n\nThis is a friendly reminder to confirm your RSVP status for ${ev?.name || 'our upcoming event'}.\n\nPlease review and confirm your attendance.\n\nThank you!`;
            const mailtoUrl = `mailto:${emails}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            window.open(mailtoUrl, "_blank");
            addNotification("Batch Email Dispatch", `Opened batch mailer for ${pendingGuests.length} pending attendees.`);
        }
        setShowReminderModal(false);
    };

    // Filters
    const filteredGuests = useMemo(() => {
        return guests.filter(g => {
            const matchesSearch = !searchQuery || 
                g.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                g.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                g.whatsapp?.includes(searchQuery);
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

    // Analytics
    const velocityData = useMemo(() => {
        const last7Days = Array.from({length: 8}, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (7 - i));
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
    const totalPages = Math.ceil(filteredGuests.length / itemsPerPage) || 1;
    const categories = ["All Segments", ...new Set(guests.map(g => g.category).filter(Boolean))];

    const inputStyle = {
        width: "100%",
        padding: "0.7rem 0.85rem",
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-medium)",
        borderRadius: "12px",
        fontSize: "0.85rem",
        fontWeight: "600",
        color: "var(--text-primary)",
        outline: "none"
    };

    const labelStyle = {
        display: "block",
        fontSize: "10px",
        fontWeight: "700",
        color: "var(--text-secondary)",
        marginBottom: "0.4rem",
        textTransform: "uppercase",
        letterSpacing: "0.06em"
    };

    return (
        <div className="responsive-container" style={{ paddingBottom: "4rem" }}>
            {/* Header Bar */}
            <div className="events-header">
                <div className="events-header-left">
                    <div>
                        <h1 style={{ fontSize: "28px", fontWeight: 900, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.02em" }}>
                            Attendee Directory
                        </h1>
                    </div>

                    <div style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        background: "rgba(16, 185, 129, 0.12)",
                        padding: "6px 14px",
                        borderRadius: "20px",
                        border: "1px solid rgba(16, 185, 129, 0.3)"
                    }}>
                        <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#10b981", animation: "pulseDot 2s infinite" }}></div>
                        <span style={{ fontSize: "12px", fontWeight: 900, color: "#10b981", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                            Live Guest Roster
                        </span>
                    </div>
                </div>

                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
                    <button 
                        onClick={() => setShowBadges(!showBadges)} 
                        style={{ 
                            background: showBadges ? "var(--accent-primary)" : "rgba(255,255,255,0.06)", 
                            border: "1px solid var(--border-medium)", 
                            color: "#fff", 
                            padding: "0.6rem 1.15rem", 
                            borderRadius: "10px", 
                            fontWeight: 800, 
                            cursor: "pointer", 
                            display: "flex", 
                            alignItems: "center", 
                            gap: "8px", 
                            fontSize: "14px",
                            height: "42px",
                            transition: "all 0.2s"
                        }}
                    >
                        <CreditCard size={17} />
                        {showBadges ? "Table View" : "Digital Badges"}
                    </button>

                    <button 
                        onClick={downloadSampleCSV}
                        title="Download sample Excel/CSV template"
                        style={{ 
                            background: "rgba(255,255,255,0.06)", 
                            border: "1px solid var(--border-medium)", 
                            color: "#e4e4e7", 
                            padding: "0.6rem 1.15rem", 
                            borderRadius: "10px", 
                            fontWeight: 800, 
                            cursor: "pointer", 
                            display: "flex", 
                            alignItems: "center", 
                            gap: "8px", 
                            fontSize: "14px",
                            height: "42px",
                            transition: "all 0.2s"
                        }}
                    >
                        <FileSpreadsheet size={17} />
                        Sample CSV
                    </button>

                    <button 
                        onClick={() => document.getElementById('bulk-upload-input').click()} 
                        disabled={bulkLoading} 
                        style={{ 
                            background: "rgba(255,255,255,0.06)", 
                            border: "1px solid var(--border-medium)", 
                            color: "#fff", 
                            padding: "0.6rem 1.15rem", 
                            borderRadius: "10px", 
                            fontWeight: 800, 
                            cursor: "pointer", 
                            display: "flex", 
                            alignItems: "center", 
                            gap: "8px", 
                            fontSize: "14px",
                            height: "42px",
                            transition: "all 0.2s"
                        }}
                    >
                        {bulkLoading ? <Loader2 className="animate-spin" size={17} /> : <Upload size={17} />}
                        Bulk Onboard
                        <input id="bulk-upload-input" type="file" hidden onChange={handleBulkUpload} />
                    </button>

                    <button 
                        onClick={() => setShowModal(true)} 
                        style={{ 
                            background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", 
                            color: "#fff", 
                            border: "none", 
                            padding: "0.65rem 1.4rem", 
                            borderRadius: "10px", 
                            fontWeight: 900, 
                            cursor: "pointer", 
                            display: "flex", 
                            alignItems: "center", 
                            gap: "8px", 
                            fontSize: "14px", 
                            height: "42px",
                            boxShadow: "0 4px 14px rgba(249, 115, 22, 0.4)",
                            transition: "all 0.2s"
                        }}
                    >
                        <UserPlus size={18} strokeWidth={3} />
                        Add Attendee
                    </button>
                </div>
            </div>

            {/* 4-Column Stat Cards Grid */}
            <div className="guests-kpi-grid">
                <div style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "16px",
                    padding: "1.25rem 1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between"
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                        <span style={{ fontSize: "12px", color: "#a1a1aa", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                            Total Invited
                        </span>
                        <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "rgba(249, 115, 22, 0.12)", color: "#f97316", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Users size={20} />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: "30px", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: "2px" }}>
                            {stats.total}
                        </div>
                        <div style={{ fontSize: "13px", color: "#a1a1aa", fontWeight: 600 }}>
                            Total attendee base
                        </div>
                    </div>
                </div>

                <div style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "16px",
                    padding: "1.25rem 1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between"
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                        <span style={{ fontSize: "12px", color: "#a1a1aa", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                            Confirmed
                        </span>
                        <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "rgba(16, 185, 129, 0.12)", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <CheckCircle2 size={20} />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: "30px", fontWeight: 900, color: "#10b981", letterSpacing: "-0.02em", marginBottom: "2px" }}>
                            {stats.confirmed}
                        </div>
                        <div style={{ fontSize: "13px", color: "#a1a1aa", fontWeight: 600 }}>
                            {stats.total > 0 ? Math.round((stats.confirmed / stats.total) * 100) : 0}% of total roster
                        </div>
                    </div>
                </div>

                <div style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "16px",
                    padding: "1.25rem 1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between"
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                        <span style={{ fontSize: "12px", color: "#a1a1aa", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                            Pending
                        </span>
                        <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "rgba(245, 158, 11, 0.12)", color: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Clock size={20} />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: "30px", fontWeight: 900, color: "#f59e0b", letterSpacing: "-0.02em", marginBottom: "2px" }}>
                            {stats.pending}
                        </div>
                        <div style={{ fontSize: "13px", color: "#a1a1aa", fontWeight: 600 }}>
                            {stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0}% awaiting response
                        </div>
                    </div>
                </div>

                <div style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "16px",
                    padding: "1.25rem 1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between"
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                        <span style={{ fontSize: "12px", color: "#a1a1aa", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                            Declined
                        </span>
                        <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "rgba(239, 68, 68, 0.12)", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <XCircle size={20} />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: "30px", fontWeight: 900, color: "#ef4444", letterSpacing: "-0.02em", marginBottom: "2px" }}>
                            {stats.declined}
                        </div>
                        <div style={{ fontSize: "13px", color: "#a1a1aa", fontWeight: 600 }}>
                            {stats.total > 0 ? Math.round((stats.declined / stats.total) * 100) : 0}% attrition rate
                        </div>
                    </div>
                </div>
            </div>

            {/* Visual Analytics Split */}
            <div className="responsive-split" style={{ gap: "1.5rem", marginBottom: "1.75rem" }}>
                <div style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "16px",
                    padding: "1.25rem 1.5rem"
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                        <span style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.08em", color: "var(--text-muted)", textTransform: "uppercase" }}>
                            Registration Velocity
                        </span>
                        <div style={{ background: "rgba(249, 115, 22, 0.1)", color: "#f97316", padding: "3px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: 800 }}>
                            LIVE STREAM
                        </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "90px" }}>
                        {velocityData.map((h, i) => (
                            <div 
                                key={i} 
                                style={{ 
                                    flex: 1, 
                                    background: h > 50 ? "linear-gradient(180deg, #f97316 0%, #ea580c 100%)" : "rgba(255,255,255,0.06)", 
                                    height: `${Math.max(h, 8)}%`, 
                                    borderRadius: "4px", 
                                    transition: "height 0.4s ease" 
                                }}
                            ></div>
                        ))}
                    </div>
                </div>

                <div style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "16px",
                    padding: "1.25rem 1.5rem"
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                        <span style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.08em", color: "var(--text-muted)", textTransform: "uppercase" }}>
                            Catering & Dietary Preferences
                        </span>
                        <Utensils size={15} style={{ color: "var(--text-muted)" }} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                        {cateringData.map((item, idx) => (
                            <div key={idx}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "11px" }}>
                                    <span style={{ fontWeight: 700, color: "var(--text-secondary)" }}>{item.label}</span>
                                    <span style={{ fontWeight: 800, color: "var(--text-primary)" }}>{item.count} attendee{item.count !== 1 ? 's' : ''}</span>
                                </div>
                                <div style={{ height: "5px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden" }}>
                                    <div style={{ width: `${item.percent}%`, height: "100%", background: "var(--accent-primary)", borderRadius: "3px", transition: "width 0.5s ease" }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Controls & Quick Actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
                <div className="guests-controls-row" style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <div style={{ position: "relative", flex: 1, minWidth: "240px" }}>
                        <Search size={16} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                        <input 
                            placeholder="Search by name, tag, phone or email..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            style={{ 
                                width: "100%", 
                                background: "var(--bg-surface)", 
                                border: "1px solid var(--border-subtle)", 
                                borderRadius: "10px", 
                                padding: "0.55rem 1rem 0.55rem 2.5rem", 
                                color: "var(--text-primary)", 
                                outline: "none", 
                                fontSize: "13px",
                                fontWeight: 600 
                            }} 
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    <div className="custom-select">
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                            <option value="All Status">All RSVP Statuses</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Pending">Pending</option>
                            <option value="Declined">Declined</option>
                        </select>
                        <ChevronDown size={14} />
                    </div>

                    <div className="custom-select">
                        <select value={segmentFilter} onChange={e => setSegmentFilter(e.target.value)}>
                            {categories.map(c => (
                                <option key={c} value={c}>{c === "All Segments" ? "All Segments" : c}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} />
                    </div>
                </div>

                <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                    <button 
                        onClick={() => setShowReminderModal(true)} 
                        style={{ 
                            background: "rgba(249, 115, 22, 0.1)", 
                            border: "1px solid rgba(249, 115, 22, 0.25)", 
                            color: "var(--accent-primary)", 
                            padding: "0.4rem 0.85rem", 
                            borderRadius: "8px", 
                            fontSize: "12px", 
                            fontWeight: 800, 
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px" 
                        }}
                    >
                        <Send size={13} />
                        Send Batch Reminder to Pending ({stats.pending})
                    </button>
                    
                    <button 
                        onClick={exportCSV} 
                        style={{ 
                            background: "rgba(255,255,255,0.04)", 
                            border: "1px solid var(--border-subtle)", 
                            color: "var(--text-secondary)", 
                            padding: "0.4rem 0.85rem", 
                            borderRadius: "8px", 
                            fontSize: "12px", 
                            fontWeight: 700, 
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px" 
                        }}
                    >
                        <Download size={13} />
                        Export Manifest CSV
                    </button>

                    <button 
                        onClick={() => window.print()} 
                        style={{ 
                            background: "rgba(255,255,255,0.04)", 
                            border: "1px solid var(--border-subtle)", 
                            color: "var(--text-secondary)", 
                            padding: "0.4rem 0.85rem", 
                            borderRadius: "8px", 
                            fontSize: "12px", 
                            fontWeight: 700, 
                            cursor: "pointer" 
                        }}
                    >
                        Print Roster
                    </button>
                </div>
            </div>

            {/* Content: Badges View vs Table View */}
            {showBadges ? (
                /* Digital Badges Grid View */
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.25rem" }}>
                    {filteredGuests.map(g => {
                        const ev = events.find(e => (e.id || e._id) === (g.event?._id || g.event)) || activeEvent;
                        const isConfirmed = g.status === "Confirmed";
                        const isDeclined = g.status === "Declined";
                        const statusColor = isConfirmed ? "#10b981" : isDeclined ? "#ef4444" : "#f59e0b";

                        return (
                            <div 
                                key={g._id} 
                                className="event-card-hover"
                                style={{ 
                                    background: "var(--bg-surface)", 
                                    borderRadius: "16px", 
                                    overflow: "hidden", 
                                    border: "1px solid var(--border-subtle)", 
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between"
                                }}
                            >
                                <div style={{ background: "linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(18, 18, 20, 0.9) 100%)", padding: "1.25rem", borderBottom: "1px solid var(--border-subtle)" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                                        <span style={{ fontSize: "10px", fontWeight: 800, color: "var(--accent-primary)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                                            {g.category || "General"} Pass
                                        </span>
                                        <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 8px", borderRadius: "12px", background: `${statusColor}22` }}>
                                            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: statusColor }}></div>
                                            <span style={{ fontSize: "9px", fontWeight: 900, color: statusColor }}>{g.status}</span>
                                        </div>
                                    </div>
                                    
                                    <h3 style={{ fontSize: "18px", fontWeight: 900, color: "var(--text-primary)", margin: "0 0 2px" }}>
                                        {g.name}
                                    </h3>
                                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                                        {ev?.name || "Event Stream"}
                                    </span>
                                </div>

                                <div style={{ padding: "1.25rem" }}>
                                    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-subtle)", borderRadius: "10px", padding: "0.75rem", textAlign: "center", marginBottom: "1rem" }}>
                                        <span style={{ fontSize: "9px", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Entry Passcode</span>
                                        <div style={{ fontSize: "20px", fontWeight: 900, color: "var(--accent-primary)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.1em", marginTop: "2px" }}>
                                            {getPasscode(g)}
                                        </div>
                                    </div>

                                    <div style={{ fontSize: "11px", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "4px", marginBottom: "1rem" }}>
                                        <div><strong>Email:</strong> {g.email || "N/A"}</div>
                                        <div><strong>Phone:</strong> {g.whatsapp || "N/A"}</div>
                                        <div><strong>Seats:</strong> {g.familySize || 1} Person(s)</div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div style={{ display: "flex", gap: "0.5rem" }}>
                                        <button 
                                            onClick={() => sendWhatsAppInvite(g)}
                                            style={{ flex: 1, background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.25)", color: "#10b981", borderRadius: "8px", padding: "0.5rem", fontSize: "11px", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}
                                        >
                                            <MessageCircle size={13} /> WhatsApp
                                        </button>
                                        <button 
                                            onClick={() => sendEmailInvite(g)}
                                            style={{ flex: 1, background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.25)", color: "#3b82f6", borderRadius: "8px", padding: "0.5rem", fontSize: "11px", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}
                                        >
                                            <Mail size={13} /> Mail
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* Main Directory Table */
                <div style={{ background: "var(--bg-surface)", borderRadius: "16px", border: "1px solid var(--border-subtle)", overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}>
                    {loading ? (
                        <Box sx={{ padding: '2rem' }}>
                            {Array.from(new Array(5)).map((_, i) => (
                                <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 3 }}>
                                    <Skeleton animation="wave" variant="rounded" width={40} height={40} sx={{ borderRadius: '10px', bgcolor: 'rgba(255,255,255,0.05)' }} />
                                    <Skeleton animation="wave" height={20} width="20%" sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
                                    <Skeleton animation="wave" height={20} width="20%" sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
                                    <Skeleton animation="wave" height={20} width="15%" sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
                                    <Skeleton animation="wave" height={20} width="15%" sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
                                </Box>
                            ))}
                        </Box>
                    ) : paginatedGuests.length === 0 ? (
                        <div style={{ padding: "4rem 2rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(249, 115, 22, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-primary)", marginBottom: "1rem" }}>
                                <Users size={28} />
                            </div>
                            <h3 style={{ fontSize: "16px", fontWeight: 800, margin: "0 0 0.4rem", color: "var(--text-primary)" }}>
                                No Attendees Found
                            </h3>
                            <p style={{ color: "var(--text-muted)", fontSize: "12px", maxWidth: "340px", margin: "0 auto 1.5rem", lineHeight: 1.5 }}>
                                {searchQuery ? `No guests matching "${searchQuery}".` : "Start building your roster by adding your first attendee manually or via bulk upload."}
                            </p>
                            <button 
                                onClick={() => setShowModal(true)} 
                                style={{ 
                                    background: "var(--accent-primary)", 
                                    color: "#fff", 
                                    border: "none", 
                                    padding: "0.6rem 1.25rem", 
                                    borderRadius: "8px", 
                                    fontWeight: 800, 
                                    cursor: "pointer", 
                                    fontSize: "12px" 
                                }}
                            >
                                Add Your First Attendee
                            </button>
                        </div>
                    ) : (
                        <div className="custom-scrollbar" style={{ width: "100%", overflowX: "auto" }}>
                            <table style={{ width: "100%", minWidth: "980px", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr style={{ background: "rgba(255,255,255,0.01)", borderBottom: "1px solid var(--border-subtle)" }}>
                                        <th style={{ textAlign: "left", padding: "1rem 1.5rem", fontSize: "12px", fontWeight: 800, color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>ATTENDEE</th>
                                        <th style={{ textAlign: "left", padding: "1rem 1.5rem", fontSize: "12px", fontWeight: 800, color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>CONTACT</th>
                                        <th style={{ textAlign: "center", padding: "1rem 1.5rem", fontSize: "12px", fontWeight: 800, color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>RSVP STATUS</th>
                                        <th style={{ textAlign: "center", padding: "1rem 1.5rem", fontSize: "12px", fontWeight: 800, color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>ENTRY CODE</th>
                                        <th style={{ textAlign: "center", padding: "1rem 1.5rem", fontSize: "12px", fontWeight: 800, color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>SEGMENT</th>
                                        <th style={{ textAlign: "center", padding: "1rem 1.5rem", fontSize: "12px", fontWeight: 800, color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>SEATS</th>
                                        <th style={{ textAlign: "right", padding: "1rem 1.5rem", fontSize: "12px", fontWeight: 800, color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>ACTIONS & DISPATCH</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedGuests.map(g => {
                                        const isConfirmed = g.status === "Confirmed";
                                        const isDeclined = g.status === "Declined";
                                        const statusColor = isConfirmed ? "#10b981" : isDeclined ? "#ef4444" : "#f59e0b";

                                        return (
                                            <tr key={g._id} className="event-row" style={{ borderBottom: "1px solid var(--border-subtle)", transition: "all 0.2s" }}>
                                                <td style={{ padding: "1rem 1.5rem" }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                                        <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "rgba(249, 115, 22, 0.14)", color: "#f97316", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "15px", flexShrink: 0 }}>
                                                            {g.name?.charAt(0).toUpperCase() || "A"}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: 800, fontSize: "16px", color: "#ffffff" }}>
                                                                {g.name}
                                                            </div>
                                                            <div style={{ fontSize: "13px", color: "#a1a1aa", fontWeight: 600 }}>
                                                                {g.dietary && g.dietary !== "None" ? `Diet: ${g.dietary}` : "Standard Dietary"}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td style={{ padding: "1rem 1.5rem" }}>
                                                    <div style={{ fontSize: "14px", color: "#f4f4f5", fontWeight: 700 }}>
                                                        {g.email || "—"}
                                                    </div>
                                                    <div style={{ fontSize: "13px", color: "#a1a1aa", fontWeight: 500 }}>
                                                        {g.whatsapp || "No phone registered"}
                                                    </div>
                                                </td>

                                                <td style={{ padding: "1rem 1.5rem", textAlign: "center" }}>
                                                    <div 
                                                        onClick={() => {
                                                            const cycle = { Pending: "Confirmed", Confirmed: "Declined", Declined: "Pending" };
                                                            updateStatus(g._id, cycle[g.status] || "Pending");
                                                        }}
                                                        style={{ 
                                                            display: "inline-flex", 
                                                            alignItems: "center", 
                                                            gap: "6px", 
                                                            padding: "6px 14px", 
                                                            borderRadius: "20px", 
                                                            border: `1px solid ${statusColor}55`, 
                                                            cursor: "pointer", 
                                                            background: `${statusColor}18`,
                                                            transition: "all 0.2s"
                                                        }}
                                                        title="Click to toggle RSVP status"
                                                    >
                                                        <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: statusColor }}></div>
                                                        <span style={{ color: statusColor, fontWeight: 900, fontSize: "13px", letterSpacing: "0.04em" }}>
                                                            {g.status}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td style={{ padding: "1rem 1.5rem", textAlign: "center" }}>
                                                    <span style={{ 
                                                        fontFamily: "'JetBrains Mono', monospace", 
                                                        background: "rgba(249, 115, 22, 0.12)", 
                                                        color: "#f97316", 
                                                        padding: "0.45rem 0.9rem", 
                                                        borderRadius: "8px", 
                                                        fontSize: "14px", 
                                                        fontWeight: 900, 
                                                        letterSpacing: "0.1em",
                                                        border: "1px solid rgba(249, 115, 22, 0.3)"
                                                    }}>
                                                        {getPasscode(g)}
                                                    </span>
                                                </td>

                                                <td style={{ padding: "1rem 1.5rem", textAlign: "center" }}>
                                                    <span style={{ 
                                                        background: "rgba(255,255,255,0.06)", 
                                                        border: "1px solid var(--border-medium)", 
                                                        padding: "0.4rem 0.8rem", 
                                                        borderRadius: "8px", 
                                                        fontSize: "13px", 
                                                        fontWeight: 800, 
                                                        color: "#f4f4f5" 
                                                    }}>
                                                        {g.category || "General"}
                                                    </span>
                                                </td>

                                                <td style={{ padding: "1rem 1.5rem", textAlign: "center" }}>
                                                    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "14px", fontWeight: 800, color: "#ffffff" }}>
                                                        <Users size={15} style={{ color: "#a1a1aa" }} />
                                                        {g.familySize || 1}
                                                    </div>
                                                </td>

                                                <td style={{ padding: "1rem 1.5rem", textAlign: "right" }}>
                                                    <div style={{ display: "flex", gap: "0.4rem", justifyContent: "flex-end" }}>
                                                        {/* WhatsApp Dispatch Button */}
                                                        <button 
                                                            onClick={() => sendWhatsAppInvite(g)} 
                                                            title="Send WhatsApp Invitation" 
                                                            style={{ background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.2)", color: "#10b981", padding: "0.45rem", borderRadius: "8px", cursor: "pointer", transition: "all 0.2s" }}
                                                        >
                                                            <MessageCircle size={14} />
                                                        </button>

                                                        {/* Mail Dispatch Button */}
                                                        <button 
                                                            onClick={() => sendEmailInvite(g)} 
                                                            title="Send Email Invitation" 
                                                            style={{ background: "rgba(59, 130, 246, 0.08)", border: "1px solid rgba(59, 130, 246, 0.2)", color: "#3b82f6", padding: "0.45rem", borderRadius: "8px", cursor: "pointer", transition: "all 0.2s" }}
                                                        >
                                                            <Mail size={14} />
                                                        </button>

                                                        {/* Copy Pass URL Button */}
                                                        <button 
                                                            onClick={() => copyPassLink(g)} 
                                                            title="Copy Digital Access Pass URL" 
                                                            style={{ background: "rgba(255, 255, 255, 0.04)", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)", padding: "0.45rem", borderRadius: "8px", cursor: "pointer", transition: "all 0.2s" }}
                                                        >
                                                            <Copy size={14} />
                                                        </button>

                                                        {/* Delete Button */}
                                                        <button 
                                                            onClick={() => handleDeleteGuest(g._id)} 
                                                            title="Remove Attendee" 
                                                            style={{ background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)", color: "#ef4444", padding: "0.45rem", borderRadius: "8px", cursor: "pointer", transition: "all 0.2s" }}
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            {/* Pagination Footer */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.5rem", borderTop: "1px solid var(--border-subtle)" }}>
                                <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 500 }}>
                                    Showing {paginatedGuests.length} of {filteredGuests.length} attendees
                                </div>
                                <div style={{ display: "flex", gap: "0.3rem", alignItems: "center" }}>
                                    <button 
                                        disabled={currentPage === 1} 
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                                        style={{ width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "1px solid var(--border-subtle)", borderRadius: "6px", color: "var(--text-muted)", cursor: currentPage === 1 ? "default" : "pointer", opacity: currentPage === 1 ? 0.4 : 1 }}
                                    >
                                        <ChevronLeft size={16} />
                                    </button>

                                    <span style={{ fontSize: "12px", fontWeight: 800, color: "var(--text-primary)", padding: "0 8px" }}>
                                        Page {currentPage} of {totalPages}
                                    </span>

                                    <button 
                                        disabled={currentPage >= totalPages} 
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                                        style={{ width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "1px solid var(--border-subtle)", borderRadius: "6px", color: "var(--text-muted)", cursor: currentPage >= totalPages ? "default" : "pointer", opacity: currentPage >= totalPages ? 0.4 : 1 }}
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Add Attendee Modal */}
            {showModal && (
                <div style={{ 
                    position: "fixed", 
                    inset: 0, 
                    background: "rgba(0, 0, 0, 0.75)", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    zIndex: 2000, 
                    backdropFilter: "blur(12px)" 
                }}>
                    <div className="modal-reveal mobile-full-width" style={{
                        background: "var(--bg-surface)",
                        width: "95%",
                        maxWidth: "480px",
                        padding: "2rem",
                        borderRadius: "20px",
                        border: "1px solid var(--border-medium)",
                        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
                        position: "relative",
                        maxHeight: "90vh",
                        overflowY: "auto"
                    }}>
                        <button 
                            onClick={() => setShowModal(false)} 
                            style={{ 
                                position: "absolute", 
                                top: "1.25rem", 
                                right: "1.5rem", 
                                background: "rgba(255,255,255,0.05)", 
                                border: "1px solid var(--border-subtle)", 
                                color: "var(--text-muted)", 
                                cursor: "pointer",
                                width: "32px",
                                height: "32px",
                                borderRadius: "8px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}
                        >
                            <X size={16} />
                        </button>

                        <div style={{ marginBottom: "1.75rem" }}>
                            <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "rgba(249, 115, 22, 0.12)", color: "var(--accent-primary)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                                <Sparkles size={22} strokeWidth={2.5} />
                            </div>
                            <h2 style={{ fontSize: "1.35rem", fontWeight: 900, letterSpacing: "-0.02em", margin: "0 0 0.25rem", color: "var(--text-primary)" }}>
                                Onboard Attendee
                            </h2>
                            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", fontWeight: 500, margin: 0 }}>
                                Register a guest and generate their digital pass code.
                            </p>
                        </div>

                        <form onSubmit={handleCreateGuest} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <div>
                                <label style={labelStyle}>Full Name</label>
                                <input 
                                    placeholder="e.g. Alex Rivera" 
                                    style={inputStyle} 
                                    value={newGuest.name} 
                                    onChange={e => setNewGuest({ ...newGuest, name: e.target.value })} 
                                    required 
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>Linked Event Stream</label>
                                <select 
                                    style={inputStyle} 
                                    value={newGuest.eventId} 
                                    onChange={e => setNewGuest({ ...newGuest, eventId: e.target.value })} 
                                    required
                                >
                                    <option value="">Select Event Stream</option>
                                    {events.map(e => (
                                        <option key={e.id || e._id} value={e.id || e._id}>
                                            {e.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                <div>
                                    <label style={labelStyle}>Email Address</label>
                                    <input 
                                        type="email" 
                                        placeholder="alex@company.com" 
                                        style={inputStyle} 
                                        value={newGuest.email} 
                                        onChange={e => setNewGuest({ ...newGuest, email: e.target.value })} 
                                        required 
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Phone / WhatsApp</label>
                                    <input 
                                        placeholder="+91 9876543210" 
                                        style={inputStyle} 
                                        value={newGuest.whatsapp} 
                                        onChange={e => setNewGuest({ ...newGuest, whatsapp: e.target.value })} 
                                    />
                                </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                <div>
                                    <label style={labelStyle}>Segment / Role</label>
                                    <select style={{ ...inputStyle, paddingRight: "0.5rem" }} value={newGuest.category} onChange={e => setNewGuest({ ...newGuest, category: e.target.value })}>
                                        <option value="Tech">Tech / Speaker</option>
                                        <option value="VIP">VIP Delegate</option>
                                        <option value="Business">Business Partner</option>
                                        <option value="Friend">Friend</option>
                                        <option value="Family">Family</option>
                                        <option value="General">General Attendee</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>Seats / Family Size</label>
                                    <input 
                                        type="number" 
                                        min="1" 
                                        max="50" 
                                        style={inputStyle} 
                                        value={newGuest.familySize} 
                                        onChange={e => setNewGuest({ ...newGuest, familySize: parseInt(e.target.value) || 1 })} 
                                    />
                                </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                <div>
                                    <label style={labelStyle}>Dietary Preference</label>
                                    <select style={{ ...inputStyle, paddingRight: "0.5rem" }} value={newGuest.dietary} onChange={e => setNewGuest({ ...newGuest, dietary: e.target.value })}>
                                        <option value="None">Standard / None</option>
                                        <option value="Vegan">Vegan</option>
                                        <option value="Vegetarian">Vegetarian</option>
                                        <option value="Gluten-Free">Gluten-Free</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>Notes / Special Requests</label>
                                    <input 
                                        placeholder="VIP seating, wheelchair..." 
                                        style={inputStyle} 
                                        value={newGuest.notes} 
                                        onChange={e => setNewGuest({ ...newGuest, notes: e.target.value })} 
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                style={{ 
                                    background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", 
                                    color: "#fff", 
                                    padding: "0.85rem", 
                                    borderRadius: "12px", 
                                    fontWeight: 800, 
                                    fontSize: "0.95rem", 
                                    border: "none", 
                                    cursor: "pointer", 
                                    marginTop: "0.75rem",
                                    boxShadow: "0 10px 20px rgba(249, 115, 22, 0.25)"
                                }}
                            >
                                Confirm Onboarding & Dispatch Invite
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Batch Reminder Modal */}
            {showReminderModal && (
                <div style={{ 
                    position: "fixed", 
                    inset: 0, 
                    background: "rgba(0,0,0,0.75)", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    zIndex: 2000, 
                    backdropFilter: "blur(12px)" 
                }}>
                    <div className="modal-reveal" style={{ 
                        background: "var(--bg-surface)", 
                        width: "90%", 
                        maxWidth: "420px", 
                        padding: "2rem", 
                        borderRadius: "20px", 
                        border: "1px solid var(--border-medium)",
                        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
                        position: "relative"
                    }}>
                        <button 
                            onClick={() => setShowReminderModal(false)} 
                            style={{ 
                                position: "absolute", 
                                top: "1.25rem", 
                                right: "1.5rem", 
                                background: "rgba(255,255,255,0.05)", 
                                border: "1px solid var(--border-subtle)", 
                                color: "var(--text-muted)", 
                                cursor: "pointer",
                                width: "32px",
                                height: "32px",
                                borderRadius: "8px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}
                        >
                            <X size={16} />
                        </button>

                        <div style={{ marginBottom: "1.5rem" }}>
                            <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "rgba(249, 115, 22, 0.12)", color: "var(--accent-primary)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                                <Send size={22} />
                            </div>
                            <h2 style={{ fontSize: "1.3rem", fontWeight: 900, margin: "0 0 0.25rem", color: "var(--text-primary)" }}>
                                Send RSVP Reminders
                            </h2>
                            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", margin: 0 }}>
                                Select communication stream to dispatch reminders to {stats.pending} pending attendee(s).
                            </p>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                            <button 
                                onClick={() => sendBatchReminders("whatsapp")} 
                                style={{ 
                                    background: "rgba(16, 185, 129, 0.12)", 
                                    border: "1px solid rgba(16, 185, 129, 0.3)", 
                                    color: "#10b981", 
                                    padding: "0.85rem 1rem", 
                                    borderRadius: "12px", 
                                    fontWeight: 800, 
                                    fontSize: "13px", 
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "8px"
                                }}
                            >
                                <MessageCircle size={16} />
                                Dispatch WhatsApp Reminders
                            </button>

                            <button 
                                onClick={() => sendBatchReminders("email")} 
                                style={{ 
                                    background: "rgba(59, 130, 246, 0.12)", 
                                    border: "1px solid rgba(59, 130, 246, 0.3)", 
                                    color: "#3b82f6", 
                                    padding: "0.85rem 1rem", 
                                    borderRadius: "12px", 
                                    fontWeight: 800, 
                                    fontSize: "13px", 
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "8px"
                                }}
                            >
                                <Mail size={16} />
                                Dispatch Email Reminders
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Executive Printable Roster Document (Formal Monochrome PDF/Print Document) */}
            <div className="print-manifest-document" style={{ background: "#ffffff", color: "#000000", fontFamily: "Arial, sans-serif", padding: "10px" }}>
                {/* Header Letterhead */}
                <div style={{ borderBottom: "2px solid #000000", paddingBottom: "12px", marginBottom: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                            <div style={{ fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", color: "#333333" }}>
                                PLANORA SMART EVENT OPERATING SYSTEM
                            </div>
                            <h1 style={{ fontSize: "20px", fontWeight: "bold", color: "#000000", margin: "4px 0 6px 0", textTransform: "uppercase" }}>
                                Official Attendee Roster & Guest Manifest
                            </h1>
                            <div style={{ fontSize: "13px", color: "#000000", fontWeight: "bold" }}>
                                Event Title: {activeEvent?.name || 'All Events'}
                            </div>
                        </div>
                        <div style={{ textAlign: "right", fontSize: "11px", color: "#000000", lineHeight: "1.4" }}>
                            <div><strong>Date Generated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                            <div><strong>Time:</strong> {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                            <div><strong>Venue:</strong> {activeEvent?.location || activeEvent?.city || 'Main Venue'}</div>
                            <div><strong>Organizer:</strong> {user?.email || 'Administrator'}</div>
                        </div>
                    </div>
                </div>

                {/* Summary Stat Table (Monochrome) */}
                <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "16px", border: "1px solid #000000" }}>
                    <thead>
                        <tr style={{ background: "#f2f2f2", borderBottom: "1px solid #000000" }}>
                            <th style={{ padding: "6px", borderRight: "1px solid #000000", fontSize: "10px", fontWeight: "bold", textAlign: "center", textTransform: "uppercase", color: "#000000" }}>Total Invited</th>
                            <th style={{ padding: "6px", borderRight: "1px solid #000000", fontSize: "10px", fontWeight: "bold", textAlign: "center", textTransform: "uppercase", color: "#000000" }}>Confirmed</th>
                            <th style={{ padding: "6px", borderRight: "1px solid #000000", fontSize: "10px", fontWeight: "bold", textAlign: "center", textTransform: "uppercase", color: "#000000" }}>Pending</th>
                            <th style={{ padding: "6px", borderRight: "1px solid #000000", fontSize: "10px", fontWeight: "bold", textAlign: "center", textTransform: "uppercase", color: "#000000" }}>Declined</th>
                            <th style={{ padding: "6px", fontSize: "10px", fontWeight: "bold", textAlign: "center", textTransform: "uppercase", color: "#000000" }}>Total Reserved Seats</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={{ padding: "8px", borderRight: "1px solid #000000", fontSize: "14px", fontWeight: "bold", textAlign: "center", color: "#000000" }}>{stats.total}</td>
                            <td style={{ padding: "8px", borderRight: "1px solid #000000", fontSize: "14px", fontWeight: "bold", textAlign: "center", color: "#000000" }}>{stats.confirmed}</td>
                            <td style={{ padding: "8px", borderRight: "1px solid #000000", fontSize: "14px", fontWeight: "bold", textAlign: "center", color: "#000000" }}>{stats.pending}</td>
                            <td style={{ padding: "8px", borderRight: "1px solid #000000", fontSize: "14px", fontWeight: "bold", textAlign: "center", color: "#000000" }}>{stats.declined}</td>
                            <td style={{ padding: "8px", fontSize: "14px", fontWeight: "bold", textAlign: "center", color: "#000000" }}>{guests.reduce((acc, g) => acc + (g.familySize || 1), 0)}</td>
                        </tr>
                    </tbody>
                </table>

                {/* Printable Table (Monochrome High-Contrast Formal Table) */}
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px", marginBottom: "20px", border: "1px solid #000000" }}>
                    <thead>
                        <tr style={{ background: "#e6e6e6", borderBottom: "2px solid #000000" }}>
                            <th style={{ padding: "6px 8px", border: "1px solid #000000", textAlign: "left", width: "25px", fontSize: "10px", fontWeight: "bold", color: "#000000" }}>S.NO</th>
                            <th style={{ padding: "6px 8px", border: "1px solid #000000", textAlign: "left", fontSize: "10px", fontWeight: "bold", color: "#000000" }}>ATTENDEE NAME</th>
                            <th style={{ padding: "6px 8px", border: "1px solid #000000", textAlign: "left", fontSize: "10px", fontWeight: "bold", color: "#000000" }}>CONTACT DETAILS</th>
                            <th style={{ padding: "6px 8px", border: "1px solid #000000", textAlign: "center", fontSize: "10px", fontWeight: "bold", color: "#000000" }}>RSVP STATUS</th>
                            <th style={{ padding: "6px 8px", border: "1px solid #000000", textAlign: "center", fontSize: "10px", fontWeight: "bold", color: "#000000" }}>ENTRY CODE</th>
                            <th style={{ padding: "6px 8px", border: "1px solid #000000", textAlign: "center", fontSize: "10px", fontWeight: "bold", color: "#000000" }}>CATEGORY</th>
                            <th style={{ padding: "6px 8px", border: "1px solid #000000", textAlign: "center", width: "45px", fontSize: "10px", fontWeight: "bold", color: "#000000" }}>SEATS</th>
                            <th style={{ padding: "6px 8px", border: "1px solid #000000", textAlign: "left", fontSize: "10px", fontWeight: "bold", color: "#000000" }}>DIETARY PREFERENCE</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredGuests.map((g, idx) => (
                            <tr key={g._id || idx} style={{ background: idx % 2 === 0 ? "#ffffff" : "#f9f9f9", pageBreakInside: "avoid", borderBottom: "1px solid #000000" }}>
                                <td style={{ padding: "6px 8px", border: "1px solid #000000", fontWeight: "bold", textAlign: "center", color: "#000000" }}>{idx + 1}</td>
                                <td style={{ padding: "6px 8px", border: "1px solid #000000", fontWeight: "bold", color: "#000000" }}>{g.name}</td>
                                <td style={{ padding: "6px 8px", border: "1px solid #000000", color: "#000000" }}>
                                    <div>{g.email || "—"}</div>
                                    {g.whatsapp && <div style={{ fontSize: "10px", color: "#333333" }}>Ph: {g.whatsapp}</div>}
                                </td>
                                <td style={{ padding: "6px 8px", border: "1px solid #000000", textAlign: "center", fontWeight: "bold", color: "#000000" }}>
                                    {g.status ? g.status.toUpperCase() : "PENDING"}
                                </td>
                                <td style={{ padding: "6px 8px", border: "1px solid #000000", textAlign: "center", fontFamily: "Courier, monospace", fontWeight: "bold", color: "#000000" }}>
                                    {getPasscode(g)}
                                </td>
                                <td style={{ padding: "6px 8px", border: "1px solid #000000", textAlign: "center", color: "#000000" }}>{g.category || "General"}</td>
                                <td style={{ padding: "6px 8px", border: "1px solid #000000", textAlign: "center", fontWeight: "bold", color: "#000000" }}>{g.familySize || 1}</td>
                                <td style={{ padding: "6px 8px", border: "1px solid #000000", color: "#000000" }}>{g.dietary || "None"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Verification Sign-Off Footer */}
                <div style={{ borderTop: "2px solid #000000", paddingTop: "12px", marginTop: "24px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", pageBreakInside: "avoid" }}>
                    <div style={{ fontSize: "10px", color: "#333333", maxWidth: "340px", lineHeight: "1.4" }}>
                        <strong>CONFIDENTIAL MANIFEST:</strong> Issued by Planora Event OS. Authorized for gate check-in, security clearance, and official event administration only.
                    </div>
                    <div style={{ textAlign: "right", fontSize: "11px", color: "#000000" }}>
                        <div style={{ marginBottom: "28px", fontWeight: "bold" }}>Check-In Gate / Security Officer Signature:</div>
                        <div style={{ borderTop: "1px solid #000000", width: "220px", display: "inline-block", paddingTop: "4px", fontWeight: "bold", textAlign: "center" }}>
                            Authorized Signature & Date Stamp
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .custom-select { position: relative; }
                .custom-select select { 
                    background: var(--bg-surface); 
                    border: 1px solid var(--border-subtle); 
                    border-radius: 10px; 
                    padding: 0.55rem 2.25rem 0.55rem 0.85rem; 
                    color: var(--text-primary); 
                    appearance: none; 
                    cursor: pointer; 
                    font-weight: 700; 
                    min-width: 150px; 
                    font-size: 12px; 
                    outline: none;
                }
                .custom-select svg { position: absolute; right: 0.85rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none; }
                select option { background: #121214; color: #ffffff; }
            `}</style>
        </div>
    );
}
