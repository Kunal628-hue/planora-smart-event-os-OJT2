import { useState, useEffect, useMemo } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import {
    Activity, Users, Ticket, IndianRupee, TrendingUp, Brain, Shield, Download, FileText, ChevronDown, ChevronRight, Play, Camera
} from "lucide-react";
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

const API_URL = import.meta.env.VITE_API_URL;

export default function Analytics() {
    const navigate = useNavigate();
    const { user, events, selectedEventId, syncTimestamp, addNotification } = useOutletContext();
    const [filteredGuests, setFilteredGuests] = useState([]);
    const [filteredVendors, setFilteredVendors] = useState([]);
    const [stats, setStats] = useState({
        visits: 0,
        confirmed: 0,
        revenue: 0,
        checkInRate: 0,
        rsvpTrend: [],
        channels: []
    });
    const [loading, setLoading] = useState(true);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [executedActions, setExecutedActions] = useState(new Set([0])); // Start with first one done as per previous UI

    const [milestones, setMilestones] = useState([]);

    const fetchData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [vendorsRes, guestsRes, tasksRes] = await Promise.all([
                fetch(`${API_URL}/vendors?user=${user.uid}&email=${user.email}`),
                fetch(`${API_URL}/guests?user=${user.uid}&email=${user.email}`),
                fetch(`${API_URL}/tasks?user=${user.uid}&email=${user.email}`)
            ]);

            const vendorsData = await vendorsRes.json();
            const guestsData = await guestsRes.json();
            const tasksData = await tasksRes.json();

            const filteredEvents = selectedEventId ? events.filter(e => (e.id || e._id) === selectedEventId) : events;
            const currentGuests = selectedEventId ? guestsData.filter(g => (g.event?._id || g.event) === selectedEventId) : guestsData;
            const currentVendors = selectedEventId ? vendorsData.filter(v => (v.event?._id || v.event) === selectedEventId) : vendorsData;
            const currentTasks = selectedEventId ? tasksData.filter(t => (t.event?._id || t.event) === selectedEventId) : tasksData;
            
            setFilteredGuests(currentGuests);
            setFilteredVendors(currentVendors);

            const totalRevenue = filteredEvents.reduce((sum, e) => sum + (parseFloat(e.budget) || 0), 0);
            const totalConfirmed = currentGuests.filter(g => g.status === "Confirmed").length;
            const checkInRate = currentGuests.length > 0 ? Math.round((totalConfirmed / currentGuests.length) * 100) : 0;

            // RSVP Trend logic - Real Data
            const daysOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
            const dailyCounts = { "Mon": 0, "Tue": 0, "Wed": 0, "Thu": 0, "Fri": 0, "Sat": 0, "Sun": 0 };
            const daysMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

            currentGuests.forEach(g => {
                if (g.status === "Confirmed" && (g.updatedAt || g.createdAt)) {
                    const date = new Date(g.updatedAt || g.createdAt);
                    const dayName = daysMap[date.getDay()];
                    if (dailyCounts[dayName] !== undefined) dailyCounts[dayName]++;
                }
            });

            let runningTotal = 0;
            const targetTotal = Math.max(currentGuests.length, 10);
            const rsvpTrend = daysOrder.map((day, i) => {
                runningTotal += dailyCounts[day];
                return {
                    day,
                    actual: runningTotal,
                    projected: Math.round((targetTotal / 7) * (i + 1))
                };
            });

            // Milestone Log from real Tasks
            const processedMilestones = currentTasks
                .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
                .slice(0, 5)
                .map(t => {
                    const diff = new Date() - new Date(t.updatedAt || t.createdAt);
                    const hours = Math.floor(diff / (1000 * 60 * 60));
                    const mins = Math.floor(diff / (1000 * 60));
                    let timeAgo = "Just now";
                    if (hours > 24) timeAgo = `${Math.floor(hours / 24)} days ago`;
                    else if (hours > 0) timeAgo = `${hours}h ago`;
                    else if (mins > 0) timeAgo = `${mins}m ago`;

                    return {
                        title: t.title,
                        time: timeAgo.toUpperCase(),
                        type: t.priority === "High" ? "CRITICAL" : "OPERATIONS",
                        status: t.status === "Completed" ? "completed" : "pending"
                    };
                });

            setStats({
                visits: currentGuests.length,
                confirmed: totalConfirmed,
                checkInRate,
                revenue: totalRevenue,
                rsvpTrend,
                channels: []
            });
            setMilestones(processedMilestones);
        } catch (err) {
            console.error("Analytics fetch failed:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [user, selectedEventId, events, syncTimestamp]);

    const maxVal = useMemo(() => {
        if (!stats.rsvpTrend.length) return 100;
        return Math.max(10, Math.max(...stats.rsvpTrend.map(t => Math.max(t.actual, t.projected))) * 1.2);
    }, [stats.rsvpTrend]);

    const sparklinePoints = useMemo(() => {
        if (stats.rsvpTrend.length < 2) return "";
        return stats.rsvpTrend.map((v, i) => `${(i / (stats.rsvpTrend.length - 1)) * 600},${240 - (v.actual / maxVal) * 240}`).join(' ');
    }, [stats.rsvpTrend, maxVal]);

    const projectionPoints = useMemo(() => {
        if (stats.rsvpTrend.length < 2) return "";
        return stats.rsvpTrend.map((v, i) => `${(i / (stats.rsvpTrend.length - 1)) * 600},${240 - (v.projected / maxVal) * 240}`).join(' ');
    }, [stats.rsvpTrend, maxVal]);

    const handleExportPDF = () => {
        try {
            const doc = new jsPDF();
            const activeEventName = selectedEventId ? events.find(e => (e.id || e._id) === selectedEventId)?.name : "Full Portfolio";

            // 1. Branded Header
            doc.setFillColor(15, 23, 42); // Deep Navy
            doc.rect(0, 0, 210, 45, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(24);
            doc.setFont("helvetica", "bold");
            doc.text("PLANORA STRATEGIC INTELLIGENCE", 14, 25);
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text(`EVENT CONTEXT: ${activeEventName.toUpperCase()}`, 14, 33);
            doc.text(`GENERATION DATE: ${new Date().toLocaleString().toUpperCase()}`, 196, 33, { align: "right" });

            // 2. Executive Summary (KPIs)
            doc.setTextColor(15, 23, 42);
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text("I. EXECUTIVE PERFORMANCE METRICS", 14, 60);
            doc.line(14, 63, 196, 63);

            autoTable(doc, {
                startY: 68,
                head: [['Operational Metric', 'Observed Value', 'Strategic Status']],
                body: [
                    ['Guest Velocity (Total Reach)', stats.visits.toLocaleString('en-IN'), 'Active'],
                    ['RSVP Conversion Rate', `${stats.checkInRate}%`, stats.checkInRate > 70 ? 'Optimal' : 'In Progress'],
                    ['Strategic Capital Allocation', `Rs. ${stats.revenue.toLocaleString('en-IN')}`, 'Budgeted'],
                    ['Operational Grip Index', '94.2%', 'Stable']
                ],
                theme: 'grid',
                headStyles: { fillColor: [15, 23, 42] }
            });

            // 3. RSVP Trajectory
            let lastY = doc.lastAutoTable.finalY + 15;
            doc.setFontSize(16);
            doc.text("II. OPERATIONAL TRAJECTORY (7-DAY TREND)", 14, lastY);
            doc.line(14, lastY + 3, 196, lastY + 3);

            autoTable(doc, {
                startY: lastY + 8,
                head: [['Timeline', 'Actual RSVPs', 'Projected Target', 'Variance']],
                body: stats.rsvpTrend.map(t => [
                    t.day,
                    t.actual.toLocaleString('en-IN'),
                    t.projected.toLocaleString('en-IN'),
                    `${t.actual >= t.projected ? '+' : ''}${(t.actual - t.projected).toLocaleString('en-IN')}`
                ]),
                theme: 'striped',
                headStyles: { fillColor: [249, 115, 22] }
            });

            // 4. Attendee Intelligence (New Page)
            doc.addPage();
            doc.setFillColor(15, 23, 42);
            doc.rect(0, 0, 210, 20, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(12);
            doc.text("III. DETAILED ATTENDEE DIRECTORY", 14, 13);

            autoTable(doc, {
                startY: 25,
                head: [['Identity Name', 'Contact Channel', 'RSVP Status', 'Classification']],
                body: filteredGuests.map(g => [
                    g.name || "N/A",
                    g.whatsapp || g.email || "N/A",
                    g.status || "Unknown",
                    g.category || "General"
                ]),
                theme: 'grid',
                headStyles: { fillColor: [15, 23, 42] },
                styles: { fontSize: 9 }
            });

            // 5. Vendor Ecosystem
            lastY = doc.lastAutoTable.finalY + 15;
            if (lastY > 230) { doc.addPage(); lastY = 25; }
            doc.setTextColor(15, 23, 42);
            doc.setFontSize(14);
            doc.text("IV. STRATEGIC VENDOR ECOSYSTEM", 14, lastY);
            doc.line(14, lastY + 3, 196, lastY + 3);

            autoTable(doc, {
                startY: lastY + 8,
                head: [['Service Provider', 'Service Paradigm', 'Contract Value', 'Status']],
                body: filteredVendors.map(v => [
                    v.name || "N/A",
                    v.service || "N/A",
                    `Rs. ${parseInt(v.cost || 0).toLocaleString('en-IN')}`,
                    v.status || "Pending"
                ]),
                theme: 'striped',
                headStyles: { fillColor: [51, 65, 85] }
            });

            // 6. Recent Milestones
            lastY = doc.lastAutoTable.finalY + 15;
            if (lastY > 230) { doc.addPage(); lastY = 25; }
            doc.setFontSize(14);
            doc.text("V. RECENT OPERATIONAL MILESTONES", 14, lastY);
            doc.line(14, lastY + 3, 196, lastY + 3);

            autoTable(doc, {
                startY: lastY + 8,
                head: [['Event/Milestone', 'Timeline', 'Strategy Layer', 'Result']],
                body: milestones.map(m => [
                    m.title,
                    m.time,
                    m.type,
                    m.status === 'completed' ? 'SECURED' : 'PENDING'
                ]),
                theme: 'grid',
                headStyles: { fillColor: [15, 23, 42] }
            });

            // Footer
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text(`PLANORA INTELLIGENCE OS | INTERNAL DOCUMENT | CONFIDENTIAL | PAGE ${i} OF ${pageCount}`, 105, 287, { align: "center" });
            }

            doc.save(`planora_intelligence_${new Date().getTime()}.pdf`);
            setShowExportMenu(false);
            if (addNotification) addNotification("Report Generated", "Full multi-page strategic intelligence report saved.");
        } catch (err) {
            console.error("PDF Export failed:", err);
            if (addNotification) addNotification("Export Error", "Failed to generate detailed report.");
        }
    };

    if (loading) return (
        <div style={{ padding: "2rem", background: "#0c0c0c", minHeight: "100vh" }}>
            <Skeleton variant="text" width={200} height={40} sx={{ bgcolor: "#1a1a1a" }} />
            <Skeleton variant="rectangular" height={150} sx={{ mt: 3, borderRadius: 2, bgcolor: "#1a1a1a" }} />
            <Skeleton variant="rectangular" height={400} sx={{ mt: 3, borderRadius: 2, bgcolor: "#1a1a1a" }} />
        </div>
    );

    const currentEventName = events.find(e => (e.id || e._id) === selectedEventId)?.name || "Portfolio";

    return (
        <div style={{
            padding: "2rem",
            background: "#0c0c0c",
            color: "#fff",
            fontFamily: "'Inter', sans-serif",
            minHeight: "100vh",
            maxWidth: "1600px",
            margin: "0 auto"
        }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "3rem" }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                        <div style={{ width: "20px", height: "2px", background: "#f97316" }}></div>
                        <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#f97316", textTransform: "uppercase", letterSpacing: "0.1em" }}>Strategic Intelligence</span>
                    </div>
                    <h1 style={{ fontSize: "2rem", fontWeight: 900, margin: 0, letterSpacing: "-0.04em" }}>Tactical Analytics</h1>
                </div>
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                    <div style={{ background: "#111", border: "1px solid #222", padding: "0.4rem 0.8rem", borderRadius: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "#64748b" }}>TIMELINE:</span>
                        <select style={{ background: "none", border: "none", color: "#fff", fontSize: "0.75rem", fontWeight: 700, outline: "none", cursor: "pointer" }}>
                            <option>Last 7 days</option>
                            <option>Last 30 days</option>
                            <option>Last 90 days</option>
                            <option>Custom Range</option>
                        </select>
                    </div>
                    <div style={{ position: "relative" }}>
                        <button onClick={() => setShowExportMenu(!showExportMenu)} 
                            style={{ background: "#f97316", color: "#fff", border: "none", padding: "0.6rem 1.25rem", borderRadius: "8px", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem" }}>
                            <Download size={16} />
                            EXPORT INTELLIGENCE
                        </button>
                        {showExportMenu && (
                            <div style={{ position: "absolute", top: "110%", right: 0, background: "#111", border: "1px solid #222", borderRadius: "8px", overflow: "hidden", zIndex: 10, width: "160px" }}>
                                <div onClick={handleExportPDF} style={{ padding: "0.8rem 1rem", cursor: "pointer", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "8px" }}>
                                    <FileText size={14} /> PDF Intelligence
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* KPI Strip */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem", marginBottom: "3rem" }}>
            {/* KPI Strip */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
                {[
                    { label: "GUEST VELOCITY", val: stats.visits, trend: "+12%", icon: Users },
                    { label: "RSVP CONVERSION", val: `${stats.checkInRate}%`, trend: "+5.2%", icon: Ticket },
                    { label: "STRATEGIC CAPITAL", val: `₹${stats.revenue.toLocaleString()}`, trend: "TARGET", icon: IndianRupee },
                    { label: "OPERATIONAL GRIP", val: "94.2%", trend: "STABLE", icon: Activity }
                ].map((stat, i) => (
                    <div key={i} style={{ 
                        background: "#111", 
                        padding: "1rem 1.25rem", 
                        borderRadius: "16px", 
                        border: "1px solid #1a1a1a", 
                        position: "relative", 
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        minHeight: "120px"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ background: "rgba(255,255,255,0.03)", padding: "8px", borderRadius: "8px" }}>
                                <stat.icon size={16} color="#f97316" />
                            </div>
                            <span style={{ 
                                fontSize: "10px", fontWeight: 900, color: stat.trend.includes("+") ? "#f97316" : "#64748b", 
                                background: stat.trend.includes("+") ? "rgba(249,115,22,0.1)" : "rgba(255,255,255,0.02)", 
                                padding: "3px 10px", borderRadius: "6px"
                            }}>{stat.trend}</span>
                        </div>
                        
                        <div style={{ marginTop: "1rem" }}>
                            <div style={{ fontSize: "1.75rem", fontWeight: 900, color: "#fff", letterSpacing: "-0.03em" }}>{stat.val}</div>
                            <div style={{ fontSize: "11px", fontWeight: 800, color: "#475569", letterSpacing: "0.1em", marginTop: "4px" }}>{stat.label}</div>
                        </div>

                        {/* Mini Sparkline */}
                        <div style={{ marginTop: "0.5rem", height: "14px", opacity: 0.3 }}>
                            <svg width="100%" height="100%" viewBox="0 0 100 20" preserveAspectRatio="none">
                                <polyline points="0,15 20,12 40,18 60,8 80,14 100,5" fill="none" stroke="#f97316" strokeWidth="3" strokeLinecap="round" />
                            </svg>
                        </div>
                    </div>
                ))}
            </div>
            </div>

            {/* Main Content Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "2.2fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
                {/* Trajectory Module */}
                <div style={{ background: "#111", padding: "1.5rem", borderRadius: "20px", border: "1px solid #1a1a1a" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <h3 style={{ fontSize: "0.95rem", fontWeight: 900, margin: 0 }}>Strategic Trajectory</h3>
                            <div style={{ background: "rgba(249,115,22,0.1)", color: "#f97316", padding: "2px 8px", borderRadius: "4px", fontSize: "9px", fontWeight: 900 }}>REAL-TIME DATA</div>
                        </div>
                        <div style={{ display: "flex", gap: "1rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.65rem", color: "#64748b", fontWeight: 800 }}>
                                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#f97316" }}></div> ACTUAL
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.65rem", color: "#64748b", fontWeight: 800 }}>
                                <div style={{ width: "10px", height: "1px", borderTop: "2px dashed #333" }}></div> TARGET
                            </div>
                        </div>
                    </div>
                    
                    <div style={{ height: "210px", position: "relative" }}>
                        <svg width="100%" height="100%" viewBox="0 0 600 240" preserveAspectRatio="none">
                            {/* Grid Lines */}
                            {[0, 1, 2, 3, 4].map(i => (
                                <line key={i} x1="0" y1={i * 60} x2="600" y2={i * 60} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                            ))}
                            {/* Projection */}
                            <polyline points={projectionPoints} fill="none" stroke="#222" strokeWidth="2" strokeDasharray="6,4" />
                            {/* Actual */}
                            <polyline points={sparklinePoints} fill="none" stroke="#f97316" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.75rem", color: "#444", fontSize: "0.65rem", fontWeight: 900 }}>
                            {stats.rsvpTrend.map(t => <span key={t.day}>{t.day}</span>)}
                        </div>
                        <div style={{ position: "absolute", left: "-25px", top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "space-between", color: "#444", fontSize: "9px", fontWeight: 900 }}>
                            <span>100</span><span>75</span><span>50</span><span>25</span><span>0</span>
                        </div>
                    </div>
                </div>

                {/* Execute Card */}
                <div style={{ background: "#111", borderRadius: "20px", border: "1px solid #1a1a1a", display: "flex", flexDirection: "column", padding: "1.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1.5rem" }}>
                        <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(249,115,22,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#f97316" }}>
                            <Brain size={20} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: "1rem", fontWeight: 900, margin: 0 }}>Guest Outreach</h2>
                            <p style={{ color: "#64748b", margin: 0, fontSize: "0.7rem", fontWeight: 700 }}>AI RECOMMENDATIONS</p>
                        </div>
                    </div>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
                        {[
                            { label: "Sync WhatsApp Templates", impact: "+18% RSVP" },
                            { label: "Identify VIP Segment", impact: "+5% Conv" },
                            { label: "Automated Follow-ups", impact: "72h Savings" }
                        ].map((item, i) => (
                            <div key={i} 
                                onClick={() => {
                                    const next = new Set(executedActions);
                                    if (next.has(i)) next.delete(i);
                                    else {
                                        next.add(i);
                                        addNotification("Action Executed", `AI Strategy '${item.label}' has been initiated.`);
                                    }
                                    setExecutedActions(next);
                                }}
                                style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px", background: "rgba(255,255,255,0.02)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.03)", cursor: "pointer" }}
                            >
                                <div style={{ width: "16px", height: "16px", borderRadius: "4px", border: "2px solid #333", background: executedActions.has(i) ? "#f97316" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    {executedActions.has(i) && <Play size={8} fill="white" />}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#fff" }}>{item.label}</div>
                                    <div style={{ fontSize: "0.65rem", fontWeight: 800, color: "#f97316" }}>Impact: {item.impact}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <button onClick={() => navigate("/guests")} style={{ width: "100%", background: "#f97316", border: "none", color: "#fff", padding: "0.8rem", borderRadius: "10px", fontWeight: 900, cursor: "pointer", fontSize: "0.8rem", marginTop: "1.5rem" }}>
                        Configure Outreach
                    </button>
                </div>
            </div>

            {/* Diagnostic Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
                <div style={{ background: "#111", padding: "1.5rem", borderRadius: "20px", border: "1px solid #1a1a1a" }}>
                    <h3 style={{ fontSize: "0.9rem", fontWeight: 900, marginBottom: "1.25rem", color: "#64748b" }}>TOP PERFORMING SEGMENTS</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {[
                            { name: "Family & Close Friends", val: "85%", color: "#f97316" },
                            { name: "Strategic Partners", val: "62%", color: "#6366f1" },
                            { name: "General Network", val: "44%", color: "#94a3b8" }
                        ].map((seg, i) => (
                            <div key={i}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "0.75rem", fontWeight: 800 }}>
                                    <span>{seg.name}</span>
                                    <span>{seg.val}</span>
                                </div>
                                <div style={{ height: "6px", background: "rgba(255,255,255,0.03)", borderRadius: "3px", overflow: "hidden" }}>
                                    <div style={{ width: seg.val, height: "100%", background: seg.color }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div style={{ background: "#111", padding: "1.5rem", borderRadius: "20px", border: "1px solid #1a1a1a" }}>
                    <h3 style={{ fontSize: "0.9rem", fontWeight: 900, marginBottom: "1.25rem", color: "#64748b" }}>RISK INDICATORS</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {[
                            { label: "Unresponsive RSVPs", risk: "CRITICAL", color: "#ef4444" },
                            { label: "Budget Variance", risk: "MODERATE", color: "#f97316" },
                            { label: "Contract Deadlines", risk: "LOW", color: "#10b981" }
                        ].map((risk, i) => (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", background: "rgba(255,255,255,0.02)", borderRadius: "10px" }}>
                                <span style={{ fontSize: "0.8rem", fontWeight: 700 }}>{risk.label}</span>
                                <span style={{ fontSize: "9px", fontWeight: 900, color: "#fff", background: risk.color, padding: "2px 8px", borderRadius: "4px" }}>{risk.risk}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div style={{ background: "#111", padding: "2.5rem", borderRadius: "20px", border: "1px solid #1a1a1a" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 800 }}>Event Milestone Log</h3>
                    <span onClick={() => navigate("/tasks")} style={{ fontSize: "0.75rem", fontWeight: 800, color: "#f97316", letterSpacing: "0.1em", cursor: "pointer" }}>VIEW FULL STACK</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                    {milestones.length > 0 ? milestones.map((log, i) => (
                        <div key={i} onClick={() => navigate("/tasks")} style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start", position: "relative", cursor: "pointer" }}>
                            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: log.status === "completed" ? "#f97316" : "#333", marginTop: "5px", zIndex: 1 }}></div>
                            {i < milestones.length - 1 && <div style={{ position: "absolute", left: "4px", top: "15px", bottom: "-30px", width: "2px", background: "#1a1a1a" }}></div>}
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 800, fontSize: "1.05rem", marginBottom: "0.25rem" }}>{log.title}</div>
                                <div style={{ display: "flex", gap: "0.75rem", fontSize: "0.7rem", fontWeight: 800, color: "#64748b" }}>
                                    <span>{log.time}</span>
                                    <span>•</span>
                                    <span>{log.type}</span>
                                </div>
                            </div>
                            <ChevronRight size={20} color="#333" />
                        </div>
                    )) : (
                        <div style={{ color: "#64748b", fontSize: "0.9rem", padding: "1rem 0" }}>No recent milestones recorded. Complete tasks to see activity here.</div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.4; }
                    100% { opacity: 1; }
                }
            `}</style>
        </div>
    );
}
