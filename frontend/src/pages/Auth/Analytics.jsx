import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { animate, stagger } from "animejs";
import {
    Activity,
    Users,
    Ticket,
    IndianRupee,
    CheckCircle2,
    TrendingUp,
    PieChart,
    Zap,
    Brain,
    ArrowRight,
    RefreshCw,
    Copy,
    Share2,
    PlusCircle,
    TrendingDown,
    Layers,
    Wand2,
    Shield,
    Download,
    FileText,
    ChevronDown,
    AlertTriangle
} from "lucide-react";
import { LogoLoader } from "../../components/ui/Loader";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

/**
 * Premium Neon Chart Placeholder
 */
const CyberChartIllustration = ({ prompt, icon: Icon }) => (
    <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem",
        background: "rgba(15, 23, 42, 0.02)",
        borderRadius: "24px",
        border: "1px dashed rgba(37, 99, 235, 0.2)"
    }}>
        <div style={{
            width: "56px",
            height: "56px",
            borderRadius: "16px",
            background: "rgba(37, 99, 235, 0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "1.5rem",
            color: "#2563eb"
        }}>
            {Icon ? <Icon size={28} /> : <PieChart size={28} />}
        </div>
        <p style={{
            fontSize: "12px",
            fontWeight: 800,
            color: "#64748b",
            textAlign: "center",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            maxWidth: "200px",
            lineHeight: 1.5
        }}>{prompt}</p>
    </div>
);

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
        rsvpTrend: [0, 0, 0, 0, 0, 0, 0],
        channels: []
    });
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [vendorsRes, guestsRes] = await Promise.all([
                fetch(`${import.meta.env.VITE_API_URL}/vendors?user=${user.uid}&email=${user.email}`),
                fetch(`${import.meta.env.VITE_API_URL}/guests?user=${user.uid}&email=${user.email}`)
            ]);

            const vendorsData = await vendorsRes.json();
            const guestsData = await guestsRes.json();

            const filteredEvents = selectedEventId ? events.filter(e => (e.id || e._id) === selectedEventId) : events;
            const currentGuests = selectedEventId ? guestsData.filter(g => (g.event?._id || g.event) === selectedEventId) : guestsData;
            const currentVendors = selectedEventId ? vendorsData.filter(v => (v.event?._id || v.event) === selectedEventId) : vendorsData;
            
            setFilteredGuests(currentGuests);
            setFilteredVendors(currentVendors);

            const totalRevenue = filteredEvents.reduce((sum, e) => sum + (parseFloat(e.budget) || 0), 0);
            const totalConfirmed = currentGuests.filter(g => g.status === "Confirmed").length;
            const checkInRate = currentGuests.length > 0 ? Math.round((totalConfirmed / currentGuests.length) * 100) : 0;

            const trend = currentGuests.length > 0 ? [24, 52, 38, 71, 55, 88, 82] : [0, 0, 0, 0, 0, 0, 0];

            const channels = currentGuests.length > 0 ? Object.entries(currentGuests.reduce((acc, g) => {
                const cat = g.category || "General";
                acc[cat] = (acc[cat] || 0) + 1;
                return acc;
            }, {})).map(([name, count]) => ({
                name,
                value: Math.round((count / (currentGuests.length || 1)) * 100),
                color: name === "VIP" ? "#f59e0b" : name === "Business" ? "#3b82f6" : "#10b981"
            })) : [];

            // Real-time Trajectory Calculation
            const daysOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
            const dailyCounts = { "Mon": 0, "Tue": 0, "Wed": 0, "Thu": 0, "Fri": 0, "Sat": 0, "Sun": 0 };
            const daysMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

            currentGuests.forEach(g => {
                if (g.status === "Confirmed" && g.createdAt) {
                    const date = new Date(g.createdAt);
                    const dayName = daysMap[date.getDay()];
                    if (dailyCounts[dayName] !== undefined) {
                        dailyCounts[dayName]++;
                    }
                }
            });

            let runningTotal = 0;
            const rsvpTrend = daysOrder.map((day, i) => {
                runningTotal += dailyCounts[day];
                // Project a 20% growth target over the actual for visualization
                const projectionBase = (totalConfirmed / 7) * (i + 1);
                return {
                    day,
                    actual: runningTotal,
                    projected: Math.round(projectionBase * 1.2) + 5
                };
            });

            setStats({
                visits: currentGuests.length,
                confirmed: totalConfirmed,
                checkInRate,
                revenue: totalRevenue,
                rsvpTrend,
                channels
            });
        } catch (err) {
            console.error("Analytics fetch failed:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user, selectedEventId, events, syncTimestamp]);

    const maxVal = (stats.rsvpTrend && stats.rsvpTrend.length > 0) 
        ? Math.max(10, Math.max(...stats.rsvpTrend.map(t => Math.max(t.actual || 0, t.projected || 0))) * 1.2) 
        : 100;

    const sparklinePoints = (stats.rsvpTrend && stats.rsvpTrend.length > 1) 
        ? stats.rsvpTrend.map((v, i) => `${(i / (stats.rsvpTrend.length - 1)) * 400},${180 - ((v.actual || 0) / maxVal) * 180}`).join(' ')
        : "0,180 400,180";

    const projectionPoints = (stats.rsvpTrend && stats.rsvpTrend.length > 1) 
        ? stats.rsvpTrend.map((v, i) => `${(i / (stats.rsvpTrend.length - 1)) * 400},${180 - ((v.projected || 0) / maxVal) * 180}`).join(' ')
        : "0,180 400,180";

    const handleExecute = () => {
        // Since it mentions Catering Protocol, navigate to Vendors
        navigate("/vendors");
    };

    const handleRisk = () => {
        // Navigate to Dashboard where risks are primary
        navigate("/dashboard");
    };

    const [showExportMenu, setShowExportMenu] = useState(false);

    const handleExportCSV = () => {
        try {
            console.log("CSV Export triggered", { count: filteredGuests?.length });
            if (!filteredGuests || filteredGuests.length === 0) {
                if (addNotification) addNotification("Export Denied", "No attendee records found.");
                setShowExportMenu(false);
                return;
            }

            const headers = ["Name", "Email", "WhatsApp", "Status", "Category", "Event"];
            const safeEvents = events || [];
            
            const rows = filteredGuests.map(g => [
                `"${(g.name || "").replace(/"/g, '""')}"`,
                `"${(g.email || "").replace(/"/g, '""')}"`,
                `"${(g.whatsapp || "N/A").replace(/"/g, '""')}"`,
                `"${(g.status || "").replace(/"/g, '""')}"`,
                `"${(g.category || "General").replace(/"/g, '""')}"`,
                `"${(safeEvents.find(e => (e.id || e._id) === (g.event?._id || g.event))?.name || "N/A").replace(/"/g, '""')}"`
            ]);
            
            const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `planora_attendees_${new Date().getTime()}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setShowExportMenu(false);
            
            if (addNotification) addNotification("Sync Complete", "Attendee data exported successfully.");
        } catch (err) {
            console.error("CSV Export failed:", err);
            if (addNotification) addNotification("Export Error", "A critical error occurred during CSV generation.");
        }
    };

    const handleExportPDF = () => {
        try {
            console.log("PDF Export triggered", { count: filteredGuests?.length });
            if (!filteredGuests || filteredGuests.length === 0) {
                if (addNotification) addNotification("Export Denied", "No data available for PDF.");
                setShowExportMenu(false);
                return;
            }

            const DocConstructor = jsPDF.jsPDF || jsPDF;
            const doc = new DocConstructor();
            const safeEvents = events || [];
            const activeEventName = selectedEventId ? safeEvents.find(e => (e.id || e._id) === selectedEventId)?.name : "Full Portfolio";

            // Header & Branding
            doc.setFillColor(15, 23, 42); // Navy Blue
            doc.rect(0, 0, 210, 40, 'F');
            
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(22);
            doc.setFont("helvetica", "bold");
            doc.text("PLANORA STRATEGIC REPORT", 14, 25);
            
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text(`Event Intelligence: ${activeEventName}`, 14, 32);
            doc.text(`Generated: ${new Date().toLocaleString()}`, 196, 32, { align: "right" });

            // 1. Executive Summary Section
            doc.setTextColor(15, 23, 42);
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("EXECUTIVE PERFORMANCE SUMMARY", 14, 55);
            
            doc.setDrawColor(37, 99, 235);
            doc.line(14, 58, 196, 58);

            const kpis = [
                ["Performance Metric", "Observed Value", "Strategic Status"],
                ["Total Audience Outreach", stats.visits.toLocaleString('en-IN'), "Active Operation"],
                ["Gross Conversion (RSVPs)", stats.confirmed.toLocaleString('en-IN'), `${stats.checkInRate}% Conversion Rate`],
                ["Strategic Budget Allocation", `Rs. ${stats.revenue.toLocaleString('en-IN')}`, "Allocated"],
                ["Operational Grip Index", `${stats.checkInRate}%`, "Stable Dynamics"]
            ];

            autoTable(doc, {
                startY: 62,
                head: [kpis[0]],
                body: kpis.slice(1),
                theme: 'grid',
                styles: { fontSize: 10, cellPadding: 5 },
                headStyles: { fillColor: [248, 250, 252], textColor: [15, 23, 42], fontStyle: 'bold' },
                columnStyles: { 0: { cellWidth: 80 }, 1: { cellWidth: 50 }, 2: { cellWidth: 50 } }
            });

            // 2. RSVP Dynamics (Trajectory)
            let lastY = doc.lastAutoTable.finalY + 15;
            doc.setFontSize(14);
            doc.text("OPERATIONAL TRAJECTORY (7-DAY TREND)", 14, lastY);
            doc.line(14, lastY + 3, 196, lastY + 3);

            autoTable(doc, {
                startY: lastY + 7,
                head: [["Timeline Day", "Actual RSVPs", "Projected Target", "Delta Variance"]],
                body: stats.rsvpTrend.map(t => [
                    t.day,
                    t.actual,
                    t.projected,
                    `${t.actual >= t.projected ? '+' : ''}${t.actual - t.projected}`
                ]),
                theme: 'striped',
                headStyles: { fillColor: [15, 23, 42] },
                styles: { fontSize: 9 }
            });

            // 3. Audience Segmentation
            lastY = doc.lastAutoTable.finalY + 15;
            if (lastY > 230) { doc.addPage(); lastY = 20; }
            doc.setFontSize(14);
            doc.text("AUDIENCE SEGMENTATION ANALYSIS", 14, lastY);
            doc.line(14, lastY + 3, 196, lastY + 3);

            autoTable(doc, {
                startY: lastY + 7,
                head: [["Segment Category", "Share Percentage", "Strategic Impact"]],
                body: stats.channels.map(ch => [
                    ch.name,
                    `${ch.value}%`,
                    ch.value > 30 ? "Primary Driver" : ch.value > 10 ? "Secondary Segment" : "Niche Audience"
                ]),
                theme: 'grid',
                headStyles: { fillColor: [51, 65, 85] },
                styles: { fontSize: 9 }
            });

            // 4. Attendee Intelligence (Detailed Directory)
            lastY = doc.lastAutoTable.finalY + 15;
            if (lastY > 230) { doc.addPage(); lastY = 20; }
            doc.setFontSize(14);
            doc.text("DETAILED ATTENDEE DIRECTORY", 14, lastY);
            doc.line(14, lastY + 3, 196, lastY + 3);

            autoTable(doc, {
                startY: lastY + 7,
                head: [["Identity Name", "Digital Contact (Email)", "Direct WhatsApp", "RSVP Status", "Classification"]],
                body: filteredGuests.map(g => [
                    g.name || "N/A",
                    g.email || "N/A",
                    g.whatsapp || "N/A",
                    g.status || "Unknown",
                    g.category || "General"
                ]),
                theme: 'striped',
                headStyles: { fillColor: [37, 99, 235] },
                styles: { fontSize: 8 }
            });

            // 5. Vendor Ecosystem Section (If data exists)
            if (filteredVendors && filteredVendors.length > 0) {
                lastY = doc.lastAutoTable.finalY + 15;
                if (lastY > 230) { doc.addPage(); lastY = 20; }
                
                doc.setFontSize(14);
                doc.text("STRATEGIC VENDOR ECOSYSTEM", 14, lastY);
                doc.line(14, lastY + 3, 196, lastY + 3);

                autoTable(doc, {
                    startY: lastY + 7,
                    head: [["Service Provider", "Domain Type", "Contract Value", "Ledger Status"]],
                    body: filteredVendors.map(v => [
                        v.name || "N/A",
                        v.service || "General",
                        `Rs. ${parseInt(v.cost || 0).toLocaleString('en-IN')}`,
                        v.status || "Pending"
                    ]),
                    theme: 'grid',
                    headStyles: { fillColor: [15, 23, 42] },
                    styles: { fontSize: 9 }
                });
            }

            // Footer
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(148, 163, 184);
                doc.text(`Planora Strategic Intelligence OS | ${activeEventName} | Internal Confidence | Page ${i} of ${pageCount}`, 105, 290, { align: "center" });
            }

            doc.save(`planora_intelligence_${new Date().getTime()}.pdf`);
            setShowExportMenu(false);
            
            if (addNotification) addNotification("Report Ready", "Strategic PDF has been generated and saved.");
        } catch (err) {
            console.error("PDF Export failed:", err);
            if (addNotification) addNotification("Export Error", "PDF engine encountered a synchronization fault.");
        }
    };

    if (loading) {
        return <LogoLoader text="Analyzing Data..." />;
    }

    return (
        <div className="responsive-container" style={{
            fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
            background: "#fff",
            minHeight: "100vh",
            color: "#0f172a",
            backgroundImage: "radial-gradient(circle at 50% -20%, #eff6ff 0%, #ffffff 50%)"
        }}>
            {/* Ultra-Premium Header - Scaled Down */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem" }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <div style={{ width: "24px", height: "3px", background: "#2563eb", borderRadius: "10px" }}></div>
                        <span style={{ fontSize: "10px", fontWeight: 800, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.2em" }}>Strategic Intelligence</span>
                    </div>
                    <h1 style={{ fontSize: "2.25rem", fontWeight: 900, letterSpacing: "-0.04em", margin: 0, color: "#0f172a" }}>
                        Tactical <span style={{ color: "#2563eb" }}>Analytics</span>
                    </h1>
                </div>

                <div style={{ display: "flex", gap: "0.75rem", position: "relative" }}>
                    <button 
                        className="premium-btn-primary"
                        onClick={() => setShowExportMenu(!showExportMenu)}
                        style={{ position: "relative" }}
                    >
                        <Share2 size={14} />
                        <span>Export Intelligence</span>
                        <ChevronDown size={14} style={{ transform: showExportMenu ? "rotate(180deg)" : "rotate(0)", transition: "0.3s" }} />
                    </button>

                    {showExportMenu && (
                        <div style={{
                            position: "absolute",
                            top: "110%",
                            right: 0,
                            background: "#fff",
                            borderRadius: "14px",
                            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                            padding: "8px",
                            zIndex: 100,
                            minWidth: "180px",
                            border: "1px solid #f1f5f9",
                            animation: "fade-in 0.2s ease-out"
                        }}>
                            <button 
                                onClick={handleExportPDF}
                                style={{
                                    width: "100%", padding: "10px 14px", borderRadius: "8px", border: "none",
                                    background: "transparent", display: "flex", alignItems: "center", gap: "10px",
                                    fontSize: "13px", fontWeight: 700, color: "#1e293b", cursor: "pointer", textAlign: "left"
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = "#eff6ff"}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                            >
                                <FileText size={16} color="#ef4444" />
                                <span>Export as PDF</span>
                            </button>
                            <button 
                                onClick={handleExportCSV}
                                style={{
                                    width: "100%", padding: "10px 14px", borderRadius: "8px", border: "none",
                                    background: "transparent", display: "flex", alignItems: "center", gap: "10px",
                                    fontSize: "13px", fontWeight: 700, color: "#1e293b", cursor: "pointer", textAlign: "left"
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = "#eff6ff"}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                            >
                                <Download size={16} color="#10b981" />
                                <span>Export Spreadsheet</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* KPI Executive Strip - Compact */}
            <div className="analytics-kpi-grid" style={{ marginBottom: "2rem" }}>
                {[
                    { label: "Guest Velocity", val: stats.visits.toLocaleString('en-IN'), icon: Users, color: "#2563eb", trend: "+12%" },
                    { label: "RSVP Conversion", val: stats.confirmed.toLocaleString('en-IN'), icon: Ticket, color: "#10b981", trend: "+5.2%" },
                    { label: "Strategic Capital", val: `₹${(stats.revenue).toLocaleString('en-IN')}`, icon: IndianRupee, color: "#f59e0b", trend: "Target" },
                    { label: "Operational Grip", val: `${stats.checkInRate}%`, icon: Activity, color: "#7e22ce", trend: "Stable" }
                ].map((stat, i) => (
                    <div key={i} className="kpi-card">
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                            <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: `${stat.color}10`, display: "flex", alignItems: "center", justifyContent: "center", color: stat.color }}>
                                <stat.icon size={16} fontWeight={800} />
                            </div>
                            <div style={{ fontSize: "9px", fontWeight: 800, color: stat.color === "#10b981" ? "#059669" : "#64748b", background: stat.color === "#10b981" ? "#d1fae5" : "#f1f5f9", padding: "3px 6px", borderRadius: "4px" }}>{stat.trend}</div>
                        </div>
                        <div style={{ fontSize: "1.75rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.04em", marginBottom: "2px" }}>{stat.val}</div>
                        <div style={{ fontSize: "10px", fontWeight: 750, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{stat.label}</div>
                    </div>
                ))}
            </div>

            <div className="analytics-main-grid" style={{ marginBottom: "2rem" }}>
                {/* Real-time Trajectory Chart - Smaller */}
                <div className="analytics-module trajectory-module">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                        <h3 className="module-title">
                            <TrendingUp size={16} />
                            Strategic Trajectory
                        </h3>
                        <div style={{ display: "flex", gap: "10px" }}>
                            <span className="chart-legend"><div style={{ background: "#2563eb" }}></div> Actual RSVPs</span>
                            <span className="chart-legend"><div style={{ background: "#e2e8f0" }}></div> Projected Target</span>
                        </div>
                    </div>

                    {stats.rsvpTrend && stats.rsvpTrend.length > 0 ? (
                        <div style={{ flex: 1, position: "relative", minHeight: "280px" }}>
                            <svg width="100%" height="240" viewBox="0 0 400 200" style={{ overflow: "visible" }}>
                                <defs>
                                    <linearGradient id="actualFill" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#2563eb" stopOpacity="0.1" />
                                        <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                
                                 {/* Background Grid Lines */}
                                {[0, 0.25, 0.5, 0.75, 1].map(r => (
                                    <line key={r} x1="0" y1={180 - r * 180} x2="400" y2={180 - r * 180} stroke="#f1f5f9" strokeWidth="1" />
                                ))}

                                {/* Bars for Projected */}
                                {stats.rsvpTrend.length > 1 && stats.rsvpTrend.map((v, i) => {
                                    const x = (i / (stats.rsvpTrend.length - 1)) * 400;
                                    const barHeight = ((v.projected || 0) / maxVal) * 180;
                                    return (
                                        <rect 
                                            key={i} 
                                            x={x - 12} 
                                            y={180 - barHeight} 
                                            width="4" 
                                            height={barHeight || 0} 
                                            fill="#e2e8f0" 
                                            rx="2"
                                        />
                                    );
                                })}

                                {/* Path Area */}
                                {stats.rsvpTrend.length > 1 && (
                                    <path 
                                        d={`M 0,180 L 0,${180 - ((stats.rsvpTrend[0].actual || 0) / maxVal) * 180} ${stats.rsvpTrend.map((v, i) => `L ${(i / (stats.rsvpTrend.length - 1)) * 400},${180 - ((v.actual || 0) / maxVal) * 180}`).join(' ')} L 400,180 Z`} 
                                        fill="url(#actualFill)" 
                                    />
                                )}

                                {/* Projection Line */}
                                <polyline 
                                    points={projectionPoints} 
                                    fill="none" 
                                    stroke="#e2e8f0" 
                                    strokeWidth="1.5" 
                                    strokeDasharray="4 4" 
                                />

                                {/* Actual Line */}
                                <polyline 
                                    points={sparklinePoints} 
                                    fill="none" 
                                    stroke="#2563eb" 
                                    strokeWidth="3" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                />

                                {/* Interaction Points */}
                                {stats.rsvpTrend.length > 1 && stats.rsvpTrend.map((v, i) => {
                                    const x = (i / (stats.rsvpTrend.length - 1)) * 400;
                                    const y = 180 - ((v.actual || 0) / maxVal) * 180;
                                    return (
                                        <g key={i}>
                                            <circle cx={x} cy={y} r="6" fill="#fff" stroke="#2563eb" strokeWidth="2.5" />
                                            <text x={x} y="195" textAnchor="middle" style={{ fontSize: "7px", fontWeight: 800, fill: "#94a3b8" }}>{v.day}</text>
                                        </g>
                                    );
                                })}
                            </svg>
                        </div>
                    ) : (
                        <CyberChartIllustration prompt="Awaiting event data for trajectory calculation" icon={TrendingUp} />
                    )}
                </div>

                {/* Distribution Matrix - Smaller */}
                <div className="analytics-module distribution-module">
                    <h3 className="module-title">
                        <PieChart size={16} />
                        Segment Distribution
                    </h3>

                    {stats.checkInRate > 0 ? (
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                            <div style={{ position: 'relative', width: '140px', height: '140px', marginBottom: '1.5rem' }}>
                                <svg width="140" height="140" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        fill="none"
                                        stroke="#2563eb"
                                        strokeWidth="10"
                                        strokeLinecap="round"
                                        strokeDasharray="251.2"
                                        strokeDashoffset={251.2 * (1 - stats.checkInRate / 100)}
                                        style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: "stroke-dashoffset 1s ease-out" }}
                                    />
                                </svg>
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: "column", alignItems: 'center', justifyContent: 'center' }}>
                                    <span style={{ fontSize: '2rem', fontWeight: 900, color: "#0f172a", letterSpacing: "-0.05em" }}>{stats.checkInRate}%</span>
                                    <span style={{ fontSize: "9px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase" }}>Engagement</span>
                                </div>
                            </div>
                            <div style={{ width: "100%", display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" }}>
                                {stats.channels.map(ch => (
                                    <div key={ch.name} className="segment-badge">
                                        <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: ch.color }}></div>
                                        <span>{ch.name}: {ch.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <CyberChartIllustration prompt="Execute guest outreach to populate matrix" icon={Layers} />
                    )}
                </div>
            </div>

            {/* Immersive Tactical Action Card */}
            <div className="tactical-matrix-card">
                <div style={{ pointerEvents: "none", position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundImage: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.03) 50%, transparent 100%)", backgroundSize: "200% 100%", animation: "sweep 4s linear infinite" }}></div>
                <div style={{ position: "relative", zIndex: 2 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                        <div style={{ background: "rgba(255,255,255,0.1)", width: "48px", height: "48px", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)" }}>
                            <Brain size={24} color="#fff" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: "1.5rem", fontWeight: 900, margin: 0, color: "#fff", letterSpacing: "-0.03em" }}>Neural Strategy Vector</h3>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 8px #4ade80" }}></div>
                                <span style={{ fontSize: "9px", fontWeight: 800, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Live AI Optimization Active</span>
                            </div>
                        </div>
                    </div>

                    <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.9)", lineHeight: 1.5, maxWidth: "700px", fontWeight: 500, marginBottom: "2rem" }}>
                        Planora AI has detected a <span style={{ background: "rgba(255,255,255,0.15)", padding: "2px 6px", borderRadius: "5px", fontWeight: 800 }}>+18.2% conversion opportunity</span> in your guest retention pipeline. We recommend initiating the <span style={{ color: "#fff", fontWeight: 900, textDecoration: "underline" }}>Catering Selection Protocol</span>.
                    </p>

                    <div style={{ display: "flex", gap: "1rem" }}>
                        <button onClick={handleExecute} className="execute-btn">
                            <Wand2 size={16} />
                            Execute Strategy Protocol
                        </button>
                        <button onClick={handleRisk} className="tactical-secondary-btn">
                            <Shield size={16} />
                            Risk Assessment
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                .premium-btn-primary {
                    background: #2563eb;
                    color: #fff;
                    padding: 0.85rem 1.75rem;
                    border-radius: 14px;
                    border: none;
                    font-weight: 800;
                    font-size: 13px;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    cursor: pointer;
                    box-shadow: 0 10px 20px rgba(37, 99, 235, 0.2);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .premium-btn-secondary {
                    background: #fff;
                    color: #0f172a;
                    padding: 0.85rem 1.75rem;
                    border-radius: 14px;
                    border: 1px solid #e2e8f0;
                    font-weight: 800;
                    font-size: 13px;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .kpi-card {
                    background: #fff;
                    padding: 2rem;
                    border-radius: 28px;
                    border: 1px solid #f1f5f9;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.015);
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                    cursor: pointer;
                }
                .kpi-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.04);
                    border-color: #2563eb30;
                }
                .analytics-module {
                    background: #fff;
                    padding: 2.5rem;
                    border-radius: 36px;
                    border: 1px solid #f1f5f9;
                    box-shadow: 0 4px 25px rgba(0,0,0,0.02);
                    display: flex;
                    flex-direction: column;
                }
                .module-title {
                    font-size: 14px;
                    font-weight: 800;
                    color: #0f172a;
                    margin: 0 0 2.5rem;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .chart-legend {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 11px;
                    font-weight: 700;
                    color: #64748b;
                }
                .chart-legend div {
                    width: 8px;
                    height: 8px;
                    border-radius: 2px;
                }
                .segment-badge {
                    background: #f8fafc;
                    padding: 8px 14px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 11px;
                    font-weight: 800;
                    color: #475569;
                    border: 1px solid #f1f5f9;
                }
                .tactical-matrix-card {
                    grid-column: span 12;
                    padding: 4rem;
                    background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
                    border-radius: 44px;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 30px 60px rgba(15, 23, 42, 0.2);
                }
                .execute-btn {
                    background: #fff;
                    color: #1e3a8a;
                    padding: 1.25rem 2.5rem;
                    border-radius: 18px;
                    border: none;
                    font-weight: 900;
                    font-size: 1.1rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    cursor: pointer;
                    box-shadow: 0 15px 35px rgba(0,0,0,0.1);
                    transition: all 0.3s ease;
                }
                .execute-btn:hover {
                    transform: scale(1.05);
                    box-shadow: 0 20px 45px rgba(0,0,0,0.15);
                }
                .tactical-secondary-btn {
                    background: rgba(255,255,255,0.1);
                    color: #fff;
                    padding: 1.25rem 2rem;
                    border-radius: 18px;
                    border: 1px solid rgba(255,255,255,0.2);
                    font-weight: 800;
                    font-size: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    cursor: pointer;
                    backdrop-filter: blur(10px);
                    transition: all 0.3s ease;
                }
                .tactical-secondary-btn:hover {
                    background: rgba(255,255,255,0.15);
                }
                @keyframes sweep {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .animate-spin { animation: spin 2s linear infinite; }
            `}</style>
        </div>
    );
}
