import { useState, useEffect, useMemo } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import {
    Activity, Users, Ticket, IndianRupee, TrendingUp, Brain, Shield, Download, FileText, ChevronDown, ChevronRight, Play, Camera, Filter, CheckCircle2, AlertCircle
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
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [executedActions, setExecutedActions] = useState(new Set([0]));
    const [milestones, setMilestones] = useState([]);

    const fetchData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [vendorsRes, guestsRes, tasksRes] = await Promise.all([
                fetch(`${API_URL}/vendors?user=${user.uid}&email=${encodeURIComponent(user.email || "")}`),
                fetch(`${API_URL}/guests?user=${user.uid}&email=${encodeURIComponent(user.email || "")}`),
                fetch(`${API_URL}/tasks?user=${user.uid}&email=${encodeURIComponent(user.email || "")}`)
            ]);

            const vendorsData = await vendorsRes.json();
            const guestsData = await guestsRes.json();
            const tasksData = await tasksRes.json();

            const currentGuests = selectedEventId ? guestsData.filter(g => String(g.event?._id || g.event) === String(selectedEventId)) : guestsData;
            const currentVendors = selectedEventId ? vendorsData.filter(v => String(v.event?._id || v.event) === String(selectedEventId)) : vendorsData;
            const currentTasks = selectedEventId ? tasksData.filter(t => String(t.event?._id || t.event) === String(selectedEventId)) : tasksData;
            
            setFilteredGuests(currentGuests);
            setFilteredVendors(currentVendors);
            setFilteredTasks(currentTasks);

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

            setMilestones(processedMilestones);
        } catch (err) {
            console.error("Analytics fetch failed:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [user, selectedEventId, events, syncTimestamp]);

    const activeEvent = useMemo(() => {
        return events.find(e => (e.id || e._id) === selectedEventId) || events[0] || null;
    }, [events, selectedEventId]);

    const filteredEventsList = useMemo(() => {
        return selectedEventId ? events.filter(e => (e.id || e._id) === selectedEventId) : events;
    }, [events, selectedEventId]);

    // REAL METRICS CALCULATION
    const totalAllocatedBudget = useMemo(() => {
        return filteredEventsList.reduce((sum, e) => sum + (parseFloat(e.budget) || 0), 0);
    }, [filteredEventsList]);

    const totalVendorSpent = useMemo(() => {
        return filteredVendors.reduce((sum, v) => sum + (Number(v.cost) || 0), 0);
    }, [filteredVendors]);

    const totalConfirmedGuests = useMemo(() => {
        return filteredGuests.filter(g => g.status === "Confirmed").length;
    }, [filteredGuests]);

    const pendingGuestsCount = useMemo(() => {
        return filteredGuests.filter(g => g.status === "Pending").length;
    }, [filteredGuests]);

    const rsvpConversionRate = useMemo(() => {
        return filteredGuests.length > 0 ? Math.round((totalConfirmedGuests / filteredGuests.length) * 100) : 0;
    }, [totalConfirmedGuests, filteredGuests]);

    const completedTasksCount = useMemo(() => {
        return filteredTasks.filter(t => t.status === "Completed").length;
    }, [filteredTasks]);

    const taskCompletionRate = useMemo(() => {
        return filteredTasks.length > 0 ? (completedTasksCount / filteredTasks.length) * 100 : 100;
    }, [completedTasksCount, filteredTasks]);

    const budgetEfficiencyRate = useMemo(() => {
        if (totalAllocatedBudget === 0) return 100;
        return Math.max(0, Math.min(100, 100 - (totalVendorSpent > totalAllocatedBudget ? ((totalVendorSpent - totalAllocatedBudget) / totalAllocatedBudget) * 100 : 0)));
    }, [totalVendorSpent, totalAllocatedBudget]);

    // 100% Real Computed Operational Grip Index
    const operationalGripIndex = useMemo(() => {
        const score = (taskCompletionRate * 0.4) + (rsvpConversionRate * 0.4) + (budgetEfficiencyRate * 0.2);
        return Math.round(score);
    }, [taskCompletionRate, rsvpConversionRate, budgetEfficiencyRate]);

    // Real 7-Day RSVP Trajectory calculation
    const rsvpTrend = useMemo(() => {
        const daysOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const dailyCounts = { "Mon": 0, "Tue": 0, "Wed": 0, "Thu": 0, "Fri": 0, "Sat": 0, "Sun": 0 };
        const daysMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        filteredGuests.forEach(g => {
            if (g.status === "Confirmed" && (g.updatedAt || g.createdAt)) {
                const date = new Date(g.updatedAt || g.createdAt);
                const dayName = daysMap[date.getDay()];
                if (dailyCounts[dayName] !== undefined) dailyCounts[dayName]++;
            }
        });

        let runningTotal = 0;
        const totalTargetCapacity = Math.max(filteredGuests.length, 10);
        return daysOrder.map((day, i) => {
            runningTotal += dailyCounts[day];
            return {
                day,
                actual: runningTotal,
                projected: Math.round((totalTargetCapacity / 7) * (i + 1))
            };
        });
    }, [filteredGuests]);

    const maxVal = useMemo(() => {
        if (!rsvpTrend.length) return 10;
        const maxData = Math.max(...rsvpTrend.map(t => Math.max(t.actual, t.projected)));
        return Math.max(10, maxData * 1.25);
    }, [rsvpTrend]);

    const sparklinePoints = useMemo(() => {
        if (rsvpTrend.length < 2) return "";
        return rsvpTrend.map((v, i) => `${(i / (rsvpTrend.length - 1)) * 600},${240 - (v.actual / maxVal) * 240}`).join(' ');
    }, [rsvpTrend, maxVal]);

    const projectionPoints = useMemo(() => {
        if (rsvpTrend.length < 2) return "";
        return rsvpTrend.map((v, i) => `${(i / (rsvpTrend.length - 1)) * 600},${240 - (v.projected / maxVal) * 240}`).join(' ');
    }, [rsvpTrend, maxVal]);

    // 100% Real Top Performing Segments computed from Guests DB
    const topPerformingSegments = useMemo(() => {
        if (filteredGuests.length === 0) return [];
        
        const categoryMap = {};
        filteredGuests.forEach(g => {
            const cat = g.category || "General";
            if (!categoryMap[cat]) categoryMap[cat] = { total: 0, confirmed: 0 };
            categoryMap[cat].total++;
            if (g.status === "Confirmed") categoryMap[cat].confirmed++;
        });

        const palette = ["#f97316", "#6366f1", "#10b981", "#ec4899", "#3b82f6", "#a855f7"];
        return Object.keys(categoryMap).map((catName, idx) => {
            const { total, confirmed } = categoryMap[catName];
            const rate = total > 0 ? Math.round((confirmed / total) * 100) : 0;
            return {
                name: catName,
                val: `${rate}% (${confirmed}/${total})`,
                rateNum: rate,
                color: palette[idx % palette.length]
            };
        }).sort((a, b) => b.rateNum - a.rateNum);
    }, [filteredGuests]);

    // 100% Real Computed Risk Indicators
    const riskIndicators = useMemo(() => {
        const pendingRatio = filteredGuests.length > 0 ? pendingGuestsCount / filteredGuests.length : 0;
        const rsvpRisk = pendingRatio > 0.5 ? "CRITICAL" : pendingRatio > 0.2 ? "MODERATE" : "LOW";
        const rsvpColor = rsvpRisk === "CRITICAL" ? "#ef4444" : rsvpRisk === "MODERATE" ? "#f97316" : "#10b981";

        const budgetOverrun = totalVendorSpent > totalAllocatedBudget && totalAllocatedBudget > 0;
        const budgetRatio = totalAllocatedBudget > 0 ? totalVendorSpent / totalAllocatedBudget : 0;
        const budgetRisk = budgetOverrun ? "CRITICAL" : budgetRatio > 0.85 ? "MODERATE" : "LOW";
        const budgetColor = budgetRisk === "CRITICAL" ? "#ef4444" : budgetRisk === "MODERATE" ? "#f97316" : "#10b981";

        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const overdueTasksCount = filteredTasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== "Completed").length;
        const taskRisk = overdueTasksCount > 3 ? "CRITICAL" : overdueTasksCount > 0 ? "MODERATE" : "LOW";
        const taskColor = taskRisk === "CRITICAL" ? "#ef4444" : taskRisk === "MODERATE" ? "#f97316" : "#10b981";

        return [
            { label: `Unresponsive RSVPs (${pendingGuestsCount} pending)`, risk: rsvpRisk, color: rsvpColor },
            { label: `Budget Utilization (₹${totalVendorSpent.toLocaleString('en-IN')} / ₹${totalAllocatedBudget.toLocaleString('en-IN')})`, risk: budgetRisk, color: budgetColor },
            { label: `Overdue Task Deadlines (${overdueTasksCount} overdue)`, risk: taskRisk, color: taskColor }
        ];
    }, [filteredGuests, pendingGuestsCount, totalVendorSpent, totalAllocatedBudget, filteredTasks]);

    // 100% Real Outreach AI Recommendations
    const outreachActions = useMemo(() => {
        const vipCount = filteredGuests.filter(g => g.category === "VIP").length;
        const activeTasksCount = filteredTasks.filter(t => t.status !== "Completed").length;

        return [
            { label: "Sync WhatsApp Invitations", impact: `Send cards to ${pendingGuestsCount} pending guests` },
            { label: "Identify VIP Segment", impact: `${vipCount} VIP attendees registered` },
            { label: "Automated Workflow Follow-ups", impact: `${activeTasksCount} active tasks queued` }
        ];
    }, [filteredGuests, pendingGuestsCount, filteredTasks]);

    const handleExportPDF = () => {
        try {
            const doc = new jsPDF();
            const activeEventName = activeEvent ? activeEvent.name : "Full Portfolio";

            // 1. Header
            doc.setFillColor(15, 23, 42);
            doc.rect(0, 0, 210, 45, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(22);
            doc.setFont("helvetica", "bold");
            doc.text("PLANORA STRATEGIC INTELLIGENCE", 14, 25);
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text(`EVENT CONTEXT: ${activeEventName.toUpperCase()}`, 14, 33);
            doc.text(`DATE: ${new Date().toLocaleDateString().toUpperCase()}`, 196, 33, { align: "right" });

            // 2. Executive Metrics
            doc.setTextColor(15, 23, 42);
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("I. EXECUTIVE PERFORMANCE METRICS", 14, 60);
            doc.line(14, 63, 196, 63);

            autoTable(doc, {
                startY: 68,
                head: [['Operational Metric', 'Observed Value', 'Status']],
                body: [
                    ['Guest Velocity (Total Guests)', filteredGuests.length.toLocaleString('en-IN'), 'Active'],
                    ['RSVP Conversion Rate', `${rsvpConversionRate}% (${totalConfirmedGuests} confirmed)`, rsvpConversionRate > 70 ? 'Optimal' : 'In Progress'],
                    ['Strategic Capital Allocation', `Rs. ${totalAllocatedBudget.toLocaleString('en-IN')}`, 'Budgeted'],
                    ['Vendor Expenditure', `Rs. ${totalVendorSpent.toLocaleString('en-IN')}`, totalVendorSpent > totalAllocatedBudget ? 'Overrun' : 'Within Budget'],
                    ['Operational Grip Index', `${operationalGripIndex}%`, operationalGripIndex > 75 ? 'Optimal' : 'Needs Review']
                ],
                theme: 'grid',
                headStyles: { fillColor: [15, 23, 42] }
            });

            // 3. RSVP Trajectory Table
            let lastY = doc.lastAutoTable.finalY + 15;
            doc.setFontSize(14);
            doc.text("II. OPERATIONAL TRAJECTORY (7-DAY TREND)", 14, lastY);
            doc.line(14, lastY + 3, 196, lastY + 3);

            autoTable(doc, {
                startY: lastY + 8,
                head: [['Timeline Day', 'Actual RSVPs', 'Capacity Target', 'Variance']],
                body: rsvpTrend.map(t => [
                    t.day,
                    t.actual.toLocaleString('en-IN'),
                    t.projected.toLocaleString('en-IN'),
                    `${t.actual >= t.projected ? '+' : ''}${(t.actual - t.projected).toLocaleString('en-IN')}`
                ]),
                theme: 'striped',
                headStyles: { fillColor: [249, 115, 22] }
            });

            // 4. Attendee Directory
            doc.addPage();
            doc.setFillColor(15, 23, 42);
            doc.rect(0, 0, 210, 20, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(12);
            doc.text("III. ATTENDEE DIRECTORY & RSVP STATUS", 14, 13);

            autoTable(doc, {
                startY: 25,
                head: [['Name', 'Contact', 'Passcode', 'RSVP Status', 'Category']],
                body: filteredGuests.map(g => [
                    g.name || "N/A",
                    g.phone || g.whatsapp || g.email || "N/A",
                    g.entryCode || "—",
                    g.status || "Pending",
                    g.category || "General"
                ]),
                theme: 'grid',
                headStyles: { fillColor: [15, 23, 42] },
                styles: { fontSize: 9 }
            });

            doc.save(`Planora_Intelligence_Report_${new Date().toISOString().split('T')[0]}.pdf`);
            setShowExportMenu(false);
            if (addNotification) addNotification("Report Generated", "PDF intelligence report downloaded.");
        } catch (err) {
            console.error("PDF Export failed:", err);
            if (addNotification) addNotification("Export Error", "Failed to generate PDF report.");
        }
    };

    if (loading) {
        return (
            <div className="responsive-container" style={{ paddingBottom: "4rem" }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" }, gap: "1.25rem", mb: "1.75rem" }}>
                    <Skeleton animation="wave" variant="rounded" height={120} sx={{ borderRadius: '16px', bgcolor: 'rgba(255,255,255,0.05)' }} />
                    <Skeleton animation="wave" variant="rounded" height={120} sx={{ borderRadius: '16px', bgcolor: 'rgba(255,255,255,0.05)' }} />
                    <Skeleton animation="wave" variant="rounded" height={120} sx={{ borderRadius: '16px', bgcolor: 'rgba(255,255,255,0.05)' }} />
                    <Skeleton animation="wave" variant="rounded" height={120} sx={{ borderRadius: '16px', bgcolor: 'rgba(255,255,255,0.05)' }} />
                </Box>
                <Skeleton animation="wave" variant="rounded" height={360} sx={{ borderRadius: '16px', bgcolor: 'rgba(255,255,255,0.05)' }} />
            </div>
        );
    }

    return (
        <div className="responsive-container" style={{ paddingBottom: "4rem" }}>
            {/* Header Bar */}
            <div className="events-header">
                <div className="events-header-left">
                    <div>
                        <h1 style={{ fontSize: "24px", fontWeight: 900, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.02em" }}>
                            Tactical Analytics
                        </h1>
                    </div>

                    <div style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        background: "rgba(249, 115, 22, 0.1)",
                        padding: "5px 12px",
                        borderRadius: "20px",
                        border: "1px solid rgba(249, 115, 22, 0.25)"
                    }}>
                        <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#f97316", animation: "pulseDot 2s infinite" }}></div>
                        <span style={{ fontSize: "10px", fontWeight: 800, color: "#f97316", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                            {activeEvent ? activeEvent.name : "Strategic Intelligence"}
                        </span>
                    </div>
                </div>

                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
                    <div className="custom-select">
                        <select defaultValue="Last 7 days">
                            <option value="Last 7 days">Last 7 days</option>
                            <option value="Last 30 days">Last 30 days</option>
                            <option value="Last 90 days">Last 90 days</option>
                            <option value="Custom Range">Custom Range</option>
                        </select>
                        <ChevronDown size={14} />
                    </div>

                    <div style={{ position: "relative" }}>
                        <button 
                            onClick={() => setShowExportMenu(!showExportMenu)} 
                            style={{ 
                                background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", 
                                color: "#fff", 
                                border: "none", 
                                padding: "0.6rem 1.35rem", 
                                borderRadius: "10px", 
                                fontWeight: 800, 
                                cursor: "pointer", 
                                display: "flex", 
                                alignItems: "center", 
                                gap: "8px", 
                                fontSize: "13px", 
                                height: "40px",
                                boxShadow: "0 4px 14px rgba(249, 115, 22, 0.35)",
                                transition: "all 0.2s"
                            }}
                        >
                            <Download size={16} />
                            Export Intelligence
                        </button>
                        {showExportMenu && (
                            <div style={{ position: "absolute", top: "115%", right: 0, background: "var(--bg-surface)", border: "1px solid var(--border-medium)", borderRadius: "12px", overflow: "hidden", zIndex: 10, width: "180px", boxShadow: "0 10px 25px rgba(0,0,0,0.5)" }}>
                                <div 
                                    onClick={handleExportPDF} 
                                    style={{ padding: "0.85rem 1rem", cursor: "pointer", fontSize: "12px", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px", color: "var(--text-primary)" }}
                                >
                                    <FileText size={15} style={{ color: "var(--accent-primary)" }} /> PDF Report
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 4 KPI Stat Cards Grid */}
            <div className="analytics-kpi-grid">
                {[
                    { label: "GUEST VELOCITY", val: filteredGuests.length.toLocaleString('en-IN'), trend: `${totalConfirmedGuests} Confirmed`, icon: Users },
                    { label: "RSVP CONVERSION", val: `${rsvpConversionRate}%`, trend: `${totalConfirmedGuests}/${filteredGuests.length}`, icon: Ticket },
                    { label: "STRATEGIC CAPITAL", val: `₹${totalAllocatedBudget.toLocaleString('en-IN')}`, trend: `Spent: ₹${totalVendorSpent.toLocaleString('en-IN')}`, icon: IndianRupee },
                    { label: "OPERATIONAL GRIP", val: `${operationalGripIndex}%`, trend: operationalGripIndex > 75 ? "OPTIMAL" : "STABLE", icon: Activity }
                ].map((stat, i) => (
                    <div key={i} style={{ 
                        background: "var(--bg-surface)", 
                        padding: "1.25rem 1.5rem", 
                        borderRadius: "16px", 
                        border: "1px solid var(--border-subtle)", 
                        display: "flex",
                        flexDirection: "column",
                        justify: "space-between",
                        minHeight: "130px"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(249, 115, 22, 0.12)", color: "#f97316", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <stat.icon size={18} />
                            </div>
                            <span style={{ 
                                fontSize: "10px", 
                                fontWeight: 900, 
                                color: "#f97316", 
                                background: "rgba(249, 115, 22, 0.1)", 
                                border: "1px solid rgba(249, 115, 22, 0.2)",
                                padding: "3px 10px", 
                                borderRadius: "6px",
                                letterSpacing: "0.04em"
                            }}>
                                {stat.trend}
                            </span>
                        </div>
                        
                        <div style={{ marginTop: "1rem" }}>
                            <div style={{ fontSize: "24px", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                                {stat.val}
                            </div>
                            <div style={{ fontSize: "10px", fontWeight: 800, color: "var(--text-muted)", letterSpacing: "0.08em", marginTop: "2px" }}>
                                {stat.label}
                            </div>
                        </div>

                        {/* Mini Sparkline */}
                        <div style={{ marginTop: "0.5rem", height: "14px", opacity: 0.4 }}>
                            <svg width="100%" height="100%" viewBox="0 0 100 20" preserveAspectRatio="none">
                                <polyline points="0,15 20,12 40,18 60,8 80,14 100,5" fill="none" stroke="#f97316" strokeWidth="3" strokeLinecap="round" />
                            </svg>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Visual Split Grid */}
            <div className="responsive-split" style={{ gap: "1.5rem", marginBottom: "1.75rem" }}>
                {/* Trajectory Module */}
                <div style={{ background: "var(--bg-surface)", padding: "1.5rem 1.75rem", borderRadius: "16px", border: "1px solid var(--border-subtle)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.5rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <h3 style={{ fontSize: "15px", fontWeight: 900, margin: 0, color: "var(--text-primary)" }}>Strategic Trajectory</h3>
                            <span style={{ background: "rgba(249, 115, 22, 0.1)", color: "#f97316", border: "1px solid rgba(249, 115, 22, 0.2)", padding: "2px 8px", borderRadius: "4px", fontSize: "9px", fontWeight: 900 }}>
                                REAL-TIME DATA
                            </span>
                        </div>
                        <div style={{ display: "flex", gap: "1rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "var(--text-secondary)", fontWeight: 700 }}>
                                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f97316" }}></div> ACTUAL
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "var(--text-muted)", fontWeight: 700 }}>
                                <div style={{ width: "10px", height: "1px", borderTop: "2px dashed var(--text-muted)" }}></div> TARGET
                            </div>
                        </div>
                    </div>
                    
                    <div style={{ height: "220px", position: "relative" }}>
                        <svg width="100%" height="100%" viewBox="0 0 600 240" preserveAspectRatio="none">
                            {[0, 1, 2, 3, 4].map(i => (
                                <line key={i} x1="0" y1={i * 60} x2="600" y2={i * 60} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                            ))}
                            <polyline points={projectionPoints} fill="none" stroke="var(--border-medium)" strokeWidth="2" strokeDasharray="6,4" />
                            <polyline points={sparklinePoints} fill="none" stroke="#f97316" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.75rem", color: "var(--text-muted)", fontSize: "11px", fontWeight: 800 }}>
                            {rsvpTrend.map(t => <span key={t.day}>{t.day}</span>)}
                        </div>
                    </div>
                </div>

                {/* Outreach Executive AI Module */}
                <div style={{ background: "var(--bg-surface)", borderRadius: "16px", border: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", padding: "1.5rem 1.75rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1.5rem" }}>
                        <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(249, 115, 22, 0.12)", color: "#f97316", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Brain size={22} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: "15px", fontWeight: 900, margin: 0, color: "var(--text-primary)" }}>Guest Outreach Engine</h2>
                            <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "10px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>AI STRATEGIC RECOMMENDATIONS</p>
                        </div>
                    </div>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
                        {outreachActions.map((item, i) => (
                            <div 
                                key={i} 
                                onClick={() => {
                                    const next = new Set(executedActions);
                                    if (next.has(i)) next.delete(i);
                                    else {
                                        next.add(i);
                                        addNotification("Action Initiated", `${item.label}: ${item.impact}`);
                                    }
                                    setExecutedActions(next);
                                }}
                                style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", background: "rgba(255,255,255,0.02)", borderRadius: "12px", border: "1px solid var(--border-subtle)", cursor: "pointer", transition: "all 0.2s" }}
                            >
                                <div style={{ width: "18px", height: "18px", borderRadius: "5px", border: "2px solid var(--border-medium)", background: executedActions.has(i) ? "#f97316" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    {executedActions.has(i) && <Play size={10} fill="white" color="white" />}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-primary)" }}>{item.label}</div>
                                    <div style={{ fontSize: "10px", fontWeight: 800, color: "#f97316" }}>{item.impact}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <button 
                        onClick={() => navigate("/guests")} 
                        style={{ 
                            width: "100%", 
                            background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", 
                            border: "none", 
                            color: "#fff", 
                            padding: "0.75rem", 
                            borderRadius: "10px", 
                            fontWeight: 900, 
                            cursor: "pointer", 
                            fontSize: "12px", 
                            marginTop: "1.25rem",
                            boxShadow: "0 4px 14px rgba(249, 115, 22, 0.35)"
                        }}
                    >
                        Configure Guest Outreach
                    </button>
                </div>
            </div>

            {/* Diagnostic Row */}
            <div className="responsive-split" style={{ gap: "1.5rem", marginBottom: "1.75rem" }}>
                <div style={{ background: "var(--bg-surface)", padding: "1.5rem 1.75rem", borderRadius: "16px", border: "1px solid var(--border-subtle)" }}>
                    <h3 style={{ fontSize: "12px", fontWeight: 900, marginBottom: "1.25rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        TOP PERFORMING GUEST CATEGORIES
                    </h3>
                    {topPerformingSegments.length === 0 ? (
                        <div style={{ color: "var(--text-muted)", fontSize: "12px" }}>No guest category data logged. Add guests to see category breakdown.</div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            {topPerformingSegments.map((seg, i) => (
                                <div key={i}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "12px", fontWeight: 800 }}>
                                        <span style={{ color: "var(--text-secondary)" }}>{seg.name}</span>
                                        <span style={{ color: "var(--text-primary)" }}>{seg.val}</span>
                                    </div>
                                    <div style={{ height: "6px", background: "rgba(255,255,255,0.04)", borderRadius: "3px", overflow: "hidden" }}>
                                        <div style={{ width: `${seg.rateNum}%`, height: "100%", background: seg.color }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div style={{ background: "var(--bg-surface)", padding: "1.5rem 1.75rem", borderRadius: "16px", border: "1px solid var(--border-subtle)" }}>
                    <h3 style={{ fontSize: "12px", fontWeight: 900, marginBottom: "1.25rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        REAL-TIME RISK INDICATORS
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {riskIndicators.map((risk, i) => (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "rgba(255,255,255,0.02)", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
                                <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>{risk.label}</span>
                                <span style={{ fontSize: "10px", fontWeight: 900, color: "#fff", background: risk.color, padding: "2px 8px", borderRadius: "4px" }}>{risk.risk}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Section - Milestone Log */}
            <div style={{ background: "var(--bg-surface)", borderRadius: "16px", border: "1px solid var(--border-subtle)", padding: "1.5rem 1.75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "1rem" }}>
                    <h3 style={{ fontSize: "15px", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
                        Event Milestone Log
                    </h3>
                    <span onClick={() => navigate("/tasks")} style={{ fontSize: "11px", fontWeight: 800, color: "#f97316", letterSpacing: "0.08em", cursor: "pointer", textTransform: "uppercase" }}>
                        VIEW FULL STACK →
                    </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    {milestones.length > 0 ? milestones.map((log, i) => (
                        <div key={i} onClick={() => navigate("/tasks")} style={{ display: "flex", gap: "1.25rem", alignItems: "flex-start", position: "relative", cursor: "pointer" }}>
                            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: log.status === "completed" ? "#10b981" : "#f97316", marginTop: "5px", zIndex: 1, boxShadow: log.status === "completed" ? "0 0 8px rgba(16, 185, 129, 0.6)" : "0 0 8px rgba(249, 115, 22, 0.6)" }}></div>
                            {i < milestones.length - 1 && <div style={{ position: "absolute", left: "4px", top: "15px", bottom: "-25px", width: "2px", background: "var(--border-subtle)" }}></div>}
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 800, fontSize: "14px", marginBottom: "0.2rem", color: "var(--text-primary)" }}>{log.title}</div>
                                <div style={{ display: "flex", gap: "0.75rem", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)" }}>
                                    <span>{log.time}</span>
                                    <span>•</span>
                                    <span style={{ color: log.type === "CRITICAL" ? "#ef4444" : "var(--text-secondary)" }}>{log.type}</span>
                                </div>
                            </div>
                            <ChevronRight size={18} style={{ color: "var(--text-muted)" }} />
                        </div>
                    )) : (
                        <div style={{ color: "var(--text-muted)", fontSize: "13px", padding: "1rem 0" }}>
                            No recent milestones recorded. Complete tasks in Tasks/Timeline to see activity here.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
