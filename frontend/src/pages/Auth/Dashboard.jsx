import { useState, useEffect, lazy, Suspense, useMemo } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
    AlertTriangle,
    ArrowRight,
    LayoutDashboard,
    RefreshCw,
    Calendar,
    DollarSign,
    Activity,
    Users,
    ChevronRight,
    Search,
    Sparkles,
    ShieldCheck,
    Utensils,
    Music,
    Building,
    MapPin,
    Star,
    X,
    Check,
    AlertCircle,
    Phone,
    Mail
} from "lucide-react";
// eslint-disable-next-line
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

const AiAssistant = lazy(() => import("../../components/AiAssistant"));

export default function Dashboard() {
    const navigate = useNavigate();
    const { user, events, selectedEventId, syncTimestamp, addNotification } = useOutletContext();
    const [healthData, setHealthData] = useState(null);
    const [risks, setRisks] = useState([]);
    const [budgetOpts, setBudgetOpts] = useState([]);
    const [timeline, setTimeline] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL;

    const fetchAiInsights = async (eventId) => {
        if (!eventId) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const [healthRes, riskRes, budgetRes] = await Promise.all([
                fetch(`${API_URL}/ai/health/${eventId}`),
                fetch(`${API_URL}/ai/risk/${eventId}`),
                fetch(`${API_URL}/ai/budget-opt/${eventId}`)
            ]);

            const health = healthRes.ok ? await healthRes.json() : null;
            const riskData = riskRes.ok ? await riskRes.json() : [];
            const budgetData = budgetRes.ok ? await budgetRes.json() : [];

            setHealthData(health);
            setRisks(riskData);
            setBudgetOpts(budgetData);

            // Comprehensive Alert Logic
            if (health) {
                if (health.metrics.overdueTasks > 0) {
                    addNotification("Operational Lag", `You have ${health.metrics.overdueTasks} overdue tasks in this event context.`);
                }
                if (health.summary === "Critical" || health.summary === "At Risk") {
                    addNotification("Health Warning", `Event health state is currently '${health.summary}'. Intervention required.`);
                }
            }

            if (riskData.some(r => r.impact === "High")) {
                addNotification("Risk Alert", "High-impact risk factors identified. Review the Intelligence Board.");
            }

            const event = events.find(e => (e.id || e._id) === eventId);
            if (event) {
                const [timelineRes, vendorRes] = await Promise.all([
                    fetch(`${API_URL}/ai/timeline?type=${event.type || "Wedding"}`),
                    fetch(`${API_URL}/ai/vendors?type=${event.type || "Wedding"}&eventId=${eventId}`)
                ]);
                const timelineData = timelineRes.ok ? await timelineRes.json() : [];
                const vendorData = vendorRes.ok ? await vendorRes.json() : [];
                setTimeline(timelineData);
                setVendors(vendorData);

                // Budget & Deadline Checks
                const daysLeft = getDaysToEvent(event.date);
                if (daysLeft > 0 && daysLeft <= 7) {
                    addNotification("Approaching Deadline", `${event.name} is only ${daysLeft} days away. Finalize all vendor logistics.`);
                }

                if (budgetData.length > 0) {
                    const totalSpent = budgetData.reduce((sum, b) => sum + (parseInt(b.optimized) || 0), 0);
                    if (totalSpent > (parseInt(event.budget) || 0)) {
                        addNotification("Budget Exceeded", `Total allocation (₹${totalSpent}) exceeds defined budget for this event.`);
                    }
                }
            }

        } catch (err) {
            console.error("AI Insights fetch error:", err);
            setError("Failed to fetch event data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedEventId) {
            fetchAiInsights(selectedEventId);
        } else if (events.length === 0) {
            setLoading(false);
        }
    }, [selectedEventId, events, syncTimestamp]);

    const [selectedVendorModal, setSelectedVendorModal] = useState(null);

    const getDaysToEvent = (eventDate) => {
        if (!eventDate) return 0;
        const today = new Date();
        const target = new Date(eventDate);
        const diffTime = target - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    const getHealthColor = (score) => {
        if (score >= 80) return "#10b981"; // Success Green
        if (score >= 50) return "#f59e0b"; // Warning Orange
        return "#ef4444"; // Danger Red
    };

    const getBudgetColor = (usage) => {
        if (usage <= 80) return "#10b981";
        if (usage <= 100) return "#f59e0b";
        return "#ef4444";
    };

    const handleResolve = () => {
        if (risks.length === 0) return;
        const category = risks[0].category;

        if (category === "Timeline") navigate("/tasks");
        else if (category === "Budget" || category === "Partners") navigate("/vendors");
        else if (category === "Audience" || category === "Guests") navigate("/guests");
        else navigate("/events");
    };

    const getCategoryStyles = (service) => {
        const styles = {
            "Catering": { bg: "#fff7ed", color: "#c2410c", icon: <Utensils size={14} /> },
            "Decor": { bg: "#faf5ff", color: "#7e22ce", icon: <Sparkles size={14} /> },
            "AV": { bg: "#eff6ff", color: "#1d4ed8", icon: <Music size={14} /> },
            "Venue": { bg: "#f0fdf4", color: "#15803d", icon: <Building size={14} /> },
            "Other": { bg: "#f8fafc", color: "#475569", icon: <MapPin size={14} /> }
        };
        return styles[service] || styles["Other"];
    };

    const safeEvents = Array.isArray(events) ? events : [];

    if (loading) {
        return (
            <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
                    <Skeleton animation="wave" variant="rounded" height={150} sx={{ borderRadius: '20px' }} />
                    <Skeleton animation="wave" variant="rounded" height={150} sx={{ borderRadius: '20px' }} />
                    <Skeleton animation="wave" variant="rounded" height={150} sx={{ borderRadius: '20px' }} />
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 4 }}>
                    <Skeleton animation="wave" variant="rounded" height={400} sx={{ borderRadius: '24px' }} />
                    <Skeleton animation="wave" variant="rounded" height={400} sx={{ borderRadius: '32px' }} />
                </Box>
                <Skeleton animation="wave" variant="rounded" height={80} sx={{ borderRadius: '100px' }} />
            </Box>
        );
    }

    if (safeEvents.length === 0 && !loading) {
        return (
            <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "6rem 2rem",
                textAlign: "center"
            }}>
                <div style={{
                    background: "rgba(255, 255, 255, 0.7)",
                    backdropFilter: "blur(24px)",
                    border: "1px solid rgba(255, 255, 255, 0.4)",
                    borderRadius: "32px",
                    padding: "4rem 3rem",
                    maxWidth: "600px",
                    width: "100%",
                    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.05)",
                    position: "relative",
                    overflow: "hidden"
                }}>
                    <div style={{
                        position: "absolute",
                        top: "-50px",
                        left: "-50px",
                        width: "150px",
                        height: "150px",
                        background: "radial-gradient(circle, rgba(37, 99, 235, 0.08) 0%, transparent 70%)",
                        borderRadius: "50%",
                        zIndex: 0
                    }}></div>

                    <div style={{ position: "relative", zIndex: 1 }}>
                        <div style={{
                            width: "80px",
                            height: "80px",
                            background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                            borderRadius: "24px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 2rem",
                            boxShadow: "0 15px 30px rgba(37, 99, 235, 0.25)",
                            transform: "rotate(-5deg)"
                        }}>
                            <Sparkles size={36} color="#fff" />
                        </div>

                        <h1 style={{
                            fontSize: "2.5rem",
                            fontWeight: 800,
                            color: "#1e293b",
                            marginBottom: "1rem",
                            letterSpacing: "-0.04em",
                            lineHeight: 1.1
                        }}>
                            Welcome to <span style={{ color: "#2563eb" }}>Planora OS</span>.
                        </h1>

                        <p style={{
                            fontSize: "1.05rem",
                            color: "#64748b",
                            marginBottom: "2.5rem",
                            maxWidth: "400px",
                            marginInline: "auto",
                            lineHeight: 1.6,
                            fontWeight: 500
                        }}>
                            The next-generation workspace for event managers. Connect your first event to unlock AI-powered insights and real-time automation.
                        </p>

                        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
                            <button
                                className="btn btn-primary"
                                style={{
                                    padding: "1rem 2.5rem",
                                    borderRadius: "14px",
                                    fontSize: "0.95rem",
                                    fontWeight: 700,
                                    boxShadow: "0 10px 25px rgba(37, 99, 235, 0.3)"
                                }}
                                onClick={() => navigate('/events')}
                            >
                                Get Started
                            </button>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: "3rem", display: "flex", gap: "2rem" }}>
                    {[
                        { icon: <ShieldCheck size={18} />, label: "Secure Data" },
                        { icon: <Activity size={18} />, label: "Real-time Sync" },
                        { icon: <LayoutDashboard size={18} />, label: "Smart Layout" }
                    ].map((feat, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", color: "#94a3b8", fontSize: "0.85rem", fontWeight: 600 }}>
                            <span style={{ color: "#2563eb" }}>{feat.icon}</span>
                            {feat.label}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const selectedEvent = events.find(e => (e.id || e._id) === selectedEventId);
    const daysRemaining = getDaysToEvent(selectedEvent?.date);

    return (
        <div className="responsive-container" style={{
            fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
            background: "transparent",
            minHeight: "100vh",
            color: "var(--text-primary)",
            padding: "1.5rem"
        }}>
            {/* Glossy Top Alert Bar */}
            {risks.length > 0 && (
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 20px",
                    background: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.2)",
                    borderRadius: "12px",
                    marginBottom: "2rem",
                    fontSize: "13px"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <AlertTriangle size={16} color="#ef4444" />
                        <span style={{ color: "#ef4444", fontWeight: 600 }}>{risks[0].message}</span>
                    </div>
                    <button
                        onClick={handleResolve}
                        style={{ color: "#ef4444", fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                    >
                        Resolve <ArrowRight size={14} />
                    </button>
                </div>
            )}

            {/* Header */}
            <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginBottom: "2rem" }}>
                <div style={{ fontSize: "10px", fontWeight: 900, color: "#f97316", letterSpacing: "0.15em", textTransform: "uppercase" }}>Mission Control</div>
                <h1 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.01em" }}>Overview</h1>
            </div>

            {/* Top KPI Grid */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "1.5rem",
                marginBottom: "2rem"
            }}>
                {/* Operational Vitality */}
                <div style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "16px",
                    padding: "1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    gridColumn: "span 1"
                }}>
                    <div style={{ fontSize: "11px", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, marginBottom: "1.5rem" }}>
                        Operational Vitality
                    </div>
                    
                    <div style={{ display: "flex", alignItems: "flex-end", gap: "12px", marginBottom: "1.25rem" }}>
                        <div style={{ fontSize: "63px", fontWeight: 900, color: "var(--text-primary)", lineHeight: 0.9, letterSpacing: "-0.04em" }}>
                            {healthData?.score || 93}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#10b981", fontSize: "12px", fontWeight: 700 }}>
                                +2 <ArrowRight size={10} style={{ transform: "rotate(-45deg)" }} />
                                <span style={{ fontSize: "10px", opacity: 0.7, fontWeight: 500 }}>from last week</span>
                            </div>
                            <div style={{ display: "flex", gap: "3px" }}>
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} style={{ 
                                        width: "12px", 
                                        height: "4px", 
                                        borderRadius: "2px", 
                                        background: i <= 4 ? "#f97316" : "rgba(255,255,255,0.05)" 
                                    }} />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div style={{ color: "var(--text-secondary)", fontWeight: 600, fontSize: "13px", display: "flex", alignItems: "center", gap: "6px", marginBottom: "1.5rem" }}>
                        Health Score <Sparkles size={14} color="#f97316" />
                    </div>

                    {/* Filling the empty space with Intelligence metrics */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "2rem" }}>
                        {[
                            { label: "Task Velocity", value: "Optimal", color: "#10b981" },
                            { label: "Budget Safety", value: "92%", color: "#f97316" },
                            { label: "Risk Level", value: "Minimal", color: "#3b82f6" }
                        ].map((item, i) => (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "rgba(255,255,255,0.02)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.03)" }}>
                                <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)" }}>{item.label}</span>
                                <span style={{ fontSize: "11px", fontWeight: 800, color: item.color }}>{item.value}</span>
                            </div>
                        ))}
                    </div>
                    
                    <div style={{ 
                        display: "flex", 
                        gap: "0.75rem", 
                        marginTop: "auto", 
                        paddingTop: "1.25rem", 
                        borderTop: "1px solid rgba(255,255,255,0.04)",
                        width: "100%"
                    }}>
                        <div style={{ 
                            padding: "4px 10px", 
                            background: "rgba(255,255,255,0.03)", 
                            border: "1px solid rgba(255,255,255,0.05)", 
                            borderRadius: "100px", 
                            display: "flex", 
                            alignItems: "center", 
                            gap: "6px" 
                        }}>
                            <DollarSign size={10} color="#f97316" />
                            <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-primary)" }}>{healthData?.metrics?.budgetUsage || 0}% Used</span>
                        </div>
                        <div style={{ 
                            padding: "4px 10px", 
                            background: "rgba(255,255,255,0.03)", 
                            border: "1px solid rgba(255,255,255,0.05)", 
                            borderRadius: "100px", 
                            display: "flex", 
                            alignItems: "center", 
                            gap: "6px" 
                        }}>
                            <Activity size={10} color="#f97316" />
                            <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-primary)" }}>Tasks {timeline.length > 0 ? "Tracking" : "N/A"}</span>
                        </div>
                    </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", gridColumn: "span 1" }}>
                    {/* Remaining Budget */}
                    <div style={{
                        background: "var(--bg-surface)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "16px",
                        padding: "1.5rem",
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between"
                    }}>
                        <div>
                            <div style={{ fontSize: "11px", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, marginBottom: "0.75rem" }}>Remaining Budget</div>
                            <div style={{ fontSize: "32px", fontWeight: 900, color: "var(--text-primary)", lineHeight: 1, letterSpacing: "-0.03em" }}>
                                ₹{((selectedEvent?.budget || 4000000) - (healthData?.metrics?.totalSpent || 0)).toLocaleString('en-IN')}
                            </div>
                            <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 600, marginTop: "6px" }}>92% of total</div>
                        </div>
                        
                        <div style={{ height: "40px", width: "100%", marginTop: "1rem" }}>
                            <svg width="100%" height="100%" viewBox="0 0 100 40" preserveAspectRatio="none">
                                <path 
                                    d="M0 35 Q 10 32, 20 36 T 40 25 T 60 28 T 80 15 T 100 20" 
                                    fill="none" 
                                    stroke="#f97316" 
                                    strokeWidth="2" 
                                    strokeLinecap="round" 
                                    style={{
                                        strokeDasharray: "200",
                                        strokeDashoffset: "200",
                                        animation: "draw 2s ease-out forwards"
                                    }}
                                />
                                <path 
                                    d="M0 35 Q 10 32, 20 36 T 40 25 T 60 28 T 80 15 T 100 20 V 40 H 0 Z" 
                                    fill="url(#gradient-spark)" 
                                    opacity="0.1" 
                                    style={{
                                        animation: "fadeIn 2s ease-out 0.5s forwards",
                                        opacity: 0
                                    }}
                                />
                                <defs>
                                    <linearGradient id="gradient-spark" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="#f97316" />
                                        <stop offset="100%" stopColor="transparent" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                    </div>

                    {/* Days to Event */}
                    <div style={{
                        background: "var(--bg-surface)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "16px",
                        padding: "1.5rem",
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: "1.5rem"
                    }}>
                        <div style={{ position: "relative", width: "72px", height: "72px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg width="72" height="72" viewBox="0 0 36 36">
                                <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                                <circle cx="18" cy="18" r="16" fill="none" stroke="#f97316" strokeWidth="3" 
                                    strokeDasharray="75 100" strokeLinecap="round" transform="rotate(-90 18 18)" />
                            </svg>
                            <div style={{ position: "absolute", fontSize: "18px", fontWeight: 900, color: "var(--text-primary)" }}>{daysRemaining}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: "10px", color: "#f97316", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "2px" }}>
                                {selectedEvent?.name || "Hackathon"}
                            </div>
                            <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>Days to Kickoff</div>
                            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Total Prep Window: 90D</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Split Layout */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "1.5rem" }}>
                <div style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "16px",
                    padding: "1.5rem",
                    gridColumn: "1 / -1"
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                        <h3 style={{ fontSize: "16px", fontWeight: 800, margin: 0, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>Efficiency Trend</h3>
                    </div>
                    <div style={{ height: "260px", width: "100%" }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={[
                                    { name: "Mon", efficiency: 65 },
                                    { name: "Tue", efficiency: 68 },
                                    { name: "Wed", efficiency: 72 },
                                    { name: "Thu", efficiency: 70 },
                                    { name: "Fri", efficiency: 82 },
                                    { name: "Sat", efficiency: 88 },
                                    { name: "Sun", efficiency: 94 }
                                ]}
                                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                            >
                                <defs>
                                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                        <feGaussianBlur stdDeviation="3" result="blur" />
                                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                    </filter>
                                </defs>
                                <CartesianGrid strokeDasharray="0" stroke="rgba(255,255,255,1)" strokeOpacity={0.05} vertical={false} />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} label={{ value: 'Efficiency %', angle: -90, position: 'insideLeft', style: { fill: '#64748b', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }, offset: 20 }} />
                                <Tooltip
                                    contentStyle={{ background: "#0c0c0c", border: "1px solid #222", borderRadius: "12px", boxShadow: "0 10px 20px rgba(0,0,0,0.5)" }}
                                    itemStyle={{ color: "#f97316", fontSize: "12px", fontWeight: 800 }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="efficiency" 
                                    stroke="#f97316" 
                                    strokeWidth={3} 
                                    dot={{ r: 4, fill: "#f97316", strokeWidth: 0, filter: 'url(#glow)' }} 
                                    activeDot={{ r: 6, fill: "#fff", stroke: "#f97316", strokeWidth: 2 }} 
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* New Compact KPI Row */}
                <div style={{ gridColumn: "1 / -1", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
                    {[
                        { label: "Active Vendors", value: "12", trend: "+2", color: "#10b981" },
                        { label: "Pending Tasks", value: "08", trend: "-3", color: "#f97316" },
                        { label: "Upcoming Deadlines", value: "03", trend: "0", color: "#64748b" }
                    ].map((kpi, i) => (
                        <div key={i} style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "16px", padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                <div style={{ fontSize: "10px", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>{kpi.label}</div>
                                <div style={{ fontSize: "24px", fontWeight: 900, color: "var(--text-primary)" }}>{kpi.value}</div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: "11px", fontWeight: 800, color: kpi.color, display: "flex", alignItems: "center", gap: "2px" }}>
                                    {kpi.trend !== "0" && <ArrowRight size={10} style={{ transform: kpi.trend.startsWith('+') ? "rotate(-45deg)" : "rotate(45deg)" }} />}
                                    {kpi.trend}
                                </div>
                                <div style={{ fontSize: "9px", color: "var(--text-muted)", fontWeight: 600 }}>Trend</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Event Milestones */}
                <div style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "16px",
                    padding: "2rem"
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                        <h3 style={{ fontSize: "18px", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>Event Milestones</h3>
                        <button onClick={() => navigate("/tasks")} style={{ fontSize: "12px", color: "var(--text-secondary)", background: "transparent", border: "none", cursor: "pointer", fontWeight: 600 }}>View All</button>
                    </div>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                        {timeline.slice(0, 5).map((step, idx) => {
                            const currentPhaseIdx = timeline.findIndex(s => daysRemaining >= s.daysBefore);
                            const isActive = idx === (currentPhaseIdx === -1 ? timeline.length - 1 : currentPhaseIdx);
                            const isPast = idx < (currentPhaseIdx === -1 ? timeline.length - 1 : currentPhaseIdx);
                            
                            const milestoneDate = new Date(selectedEvent?.date || new Date());
                            milestoneDate.setDate(milestoneDate.getDate() - step.daysBefore);
                            const month = milestoneDate.toLocaleString('default', { month: 'short' }).toUpperCase();
                            const day = milestoneDate.getDate().toString().padStart(2, '0');

                            return (
                                <div key={idx} style={{ display: "flex", gap: "1.5rem", position: "relative" }}>
                                    {idx !== Math.min(timeline.length, 5) - 1 && (
                                        <div style={{ position: "absolute", left: "64px", top: "24px", bottom: "-30px", width: "1px", background: "var(--border-subtle)" }}></div>
                                    )}
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "40px", flexShrink: 0 }}>
                                        <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 700, letterSpacing: "0.05em" }}>{month}</div>
                                        <div style={{ fontSize: "18px", color: "var(--text-primary)", fontWeight: 800 }}>{day}</div>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", flex: 1, paddingTop: "4px" }}>
                                        <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: isActive ? "var(--accent-primary)" : (isPast ? "rgba(249, 115, 22, 0.2)" : "rgba(255,255,255,0.05)"), position: "relative", zIndex: 2, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            {isPast && <Check size={10} color="var(--accent-primary)" strokeWidth={4} />}
                                            {isActive && <div style={{ width: "6px", height: "6px", background: "var(--bg-base)", borderRadius: "50%" }}></div>}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: "14px", fontWeight: 600, color: isActive ? "var(--accent-primary)" : "var(--text-primary)", marginBottom: "4px" }}>
                                                {step.title}
                                            </div>
                                            <div style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.2 }}>
                                                {isPast ? "Completed" : (isActive ? "Current Phase" : "Pending")}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {timeline.length === 0 && (
                            <div style={{ color: "var(--text-muted)", fontSize: "14px" }}>No timeline data available.</div>
                        )}
                    </div>
                </div>

                {/* AI Vendor Matches */}
                <div style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "16px",
                    padding: "2rem"
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                        <h3 style={{ fontSize: "18px", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>Smart Match Vendors</h3>
                        <div style={{ fontSize: "12px", color: "var(--accent-primary)", fontWeight: 600, border: "1px solid var(--border-accent)", padding: "4px 8px", borderRadius: "6px" }}>AI Suggested</div>
                    </div>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {vendors.slice(0, 5).map((vendor, i) => (
                            <div
                                key={i}
                                onClick={() => setSelectedVendorModal(vendor)}
                                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem", background: "rgba(255,255,255,0.02)", borderRadius: "12px", cursor: "pointer", transition: "background 0.2s" }}
                                onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.05)"}
                                onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.02)"}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
                                    <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "var(--bg-base)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-primary)" }}>
                                        <Star size={16} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "2px" }}>{vendor.name}</div>
                                        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{vendor.service}</div>
                                    </div>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "2px" }}>{vendor.priceRange}</div>
                                    <div style={{ fontSize: "11px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px", justifyContent: "flex-end" }}><Star size={10} color="#f59e0b" fill="#f59e0b" /> {vendor.rating}</div>
                                </div>
                            </div>
                        ))}
                        {vendors.length === 0 && (
                            <div style={{ color: "var(--text-muted)", fontSize: "14px" }}>No vendor recommendations available.</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Vendor Modal */}
            {selectedVendorModal && (
                <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
                    <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", width: "100%", maxWidth: "500px", borderRadius: "24px", padding: "2rem", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)", position: "relative", animation: "modalIn 0.3s ease-out" }}>
                        <button
                            onClick={() => setSelectedVendorModal(null)}
                            aria-label="Close vendor details"
                            style={{ position: "absolute", top: "1.5rem", right: "1.5rem", border: "1px solid var(--border-subtle)", background: "var(--bg-base)", width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-secondary)" }}
                        >
                            <X size={16} />
                        </button>

                        <div style={{ marginBottom: "2rem" }}>
                            <h3 style={{ fontSize: "1.75rem", fontWeight: 850, color: "var(--text-primary)", marginBottom: "0.25rem", letterSpacing: "-0.02em" }}>{selectedVendorModal.name}</h3>
                            <p style={{ color: "var(--accent-primary)", fontSize: "14px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{selectedVendorModal.service} Experts</p>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
                            <div style={{ padding: "1rem", background: "rgba(255,255,255,0.02)", borderRadius: "16px", border: "1px solid var(--border-subtle)" }}>
                                <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 800, textTransform: "uppercase", marginBottom: "0.5rem" }}>Rating</div>
                                <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "6px" }}>
                                    <Star size={18} fill="#f59e0b" color="#f59e0b" /> {selectedVendorModal.rating}/5.0
                                </div>
                            </div>
                            <div style={{ padding: "1rem", background: "rgba(255,255,255,0.02)", borderRadius: "16px", border: "1px solid var(--border-subtle)" }}>
                                <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 800, textTransform: "uppercase", marginBottom: "0.5rem" }}>Pricing</div>
                                <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>
                                    {selectedVendorModal.startingPrice ? (
                                        <span style={{ fontSize: "16px" }}>
                                            Starts at <span style={{ color: "var(--accent-primary)" }}>₹{new Intl.NumberFormat("en-IN").format(selectedVendorModal.startingPrice)}</span>
                                        </span>
                                    ) : (
                                        <span style={{ letterSpacing: "1px" }}>{selectedVendorModal.priceRange}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Location and Contact Details */}
                        <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: "20px", padding: "1.5rem", marginBottom: "2rem", border: "1px solid var(--border-subtle)" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                                    <div style={{ padding: "8px", background: "var(--bg-base)", borderRadius: "10px", color: "var(--accent-primary)" }}><MapPin size={16} /></div>
                                    <div>
                                        <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 800, textTransform: "uppercase" }}>Location</div>
                                        <div style={{ fontSize: "13px", color: "var(--text-primary)", fontWeight: 600, lineHeight: "1.4" }}>{selectedVendorModal.location || "Location details upon request"}</div>
                                    </div>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                                        <div style={{ padding: "8px", background: "var(--bg-base)", borderRadius: "10px", color: "var(--accent-primary)" }}><Phone size={16} /></div>
                                        <div>
                                            <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 800, textTransform: "uppercase" }}>Phone</div>
                                            <div style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 600 }}>{selectedVendorModal.contact}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                                        <div style={{ padding: "8px", background: "var(--bg-base)", borderRadius: "10px", color: "var(--accent-primary)" }}><Mail size={16} /></div>
                                        <div>
                                            <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 800, textTransform: "uppercase" }}>Email</div>
                                            <div style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", maxWidth: "120px" }}>{selectedVendorModal.email || "Corporate mail only"}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginBottom: "1rem" }}>
                            <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 800, textTransform: "uppercase", marginBottom: "0.75rem" }}>
                                {selectedVendorModal.specialty ? "Core Specialty" : "Overview"}
                            </div>
                            <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.6", fontWeight: 500, margin: 0 }}>
                                {selectedVendorModal.description || `Superior quality and reliability in ${selectedVendorModal.service} services for all categories of events.`}
                                {selectedVendorModal.specialty && (
                                    <span style={{ display: "block", marginTop: "0.5rem", color: "var(--accent-primary)", fontWeight: 700 }}>
                                        Featured Specialty: {selectedVendorModal.specialty}
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <Suspense fallback={null}>
                <AiAssistant eventId={selectedEventId} />
            </Suspense>
            <style>{`
                @keyframes draw {
                    to { stroke-dashoffset: 0; }
                }
                @keyframes fadeIn {
                    to { opacity: 0.1; }
                }
                @keyframes pulse {
                    0% { transform: scale(0.95); opacity: 0.9; }
                    50% { transform: scale(1.1); opacity: 1; }
                    100% { transform: scale(0.95); opacity: 0.9; }
                }
                @keyframes modalIn {
                    from { transform: translateY(40px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                *::-webkit-scrollbar { width: 6px; height: 6px; }
                *::-webkit-scrollbar-track { background: transparent; }
                *::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
            `}</style>
        </div>
    );
}
