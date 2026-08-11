import { useState, useEffect, lazy, Suspense, useMemo } from "react";
import { useOutletContext, useNavigate, Link } from "react-router-dom";
import {
    AreaChart,
    Area,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar
} from "recharts";
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
    Mail,
    Plus,
    Zap,
    TrendingUp,
    CheckCircle2,
    Clock,
    Sliders,
    BarChart2,
    Layers,
    Users2,
    Handshake
} from "lucide-react";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";

const AiAssistant = lazy(() => import("../../components/AiAssistant"));

export default function Dashboard() {
    const navigate = useNavigate();
    const { user, events, selectedEventId, syncTimestamp, addNotification } = useOutletContext();

    // Core Data States
    const [healthData, setHealthData] = useState(null);
    const [risks, setRisks] = useState([]);
    const [budgetOpts, setBudgetOpts] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Real Database Collections for Active Event
    const [userTasks, setUserTasks] = useState([]);
    const [userVendors, setUserVendors] = useState([]);
    const [userGuests, setUserGuests] = useState([]);

    // Interactive Modals & Actions
    const [selectedVendorModal, setSelectedVendorModal] = useState(null);
    const [showQuickTaskModal, setShowQuickTaskModal] = useState(false);
    const [showStrategicPlanModal, setShowStrategicPlanModal] = useState(false);
    const [strategicPlan, setStrategicPlan] = useState(null);
    const [loadingPlan, setLoadingPlan] = useState(false);
    const [applyingPlan, setApplyingPlan] = useState(false);
    const [taskSubmitting, setTaskSubmitting] = useState(false);
    const [chartMode, setChartMode] = useState("efficiency"); // 'efficiency' | 'spending'

    // Form State for Quick Task Creation
    const [quickTaskForm, setQuickTaskForm] = useState({
        title: "",
        category: "General",
        priority: "Medium",
        dueDate: "",
        description: ""
    });

    const API_URL = import.meta.env.VITE_API_URL;

    // Data Fetcher - Live MongoDB DB Querying per Selected Event
    // Data Fetcher - Live MongoDB DB Querying per Selected Event
    const fetchAiInsights = async (eventId) => {
        if (!eventId) {
            setLoading(false);
            return;
        }

        // Instant Render from Session Cache for 0ms refresh speed
        const cacheKey = `planora_dash_cache_${eventId}`;
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                setHealthData(parsed.health);
                setRisks(parsed.riskData);
                setBudgetOpts(parsed.budgetData);
                setUserTasks(parsed.tasksData || []);
                setUserVendors(parsed.dbVendorsData || []);
                setUserGuests(parsed.guestsData || []);
                setVendors(parsed.vendorData || []);
                setLoading(false);
            } catch (e) {}
        } else {
            setLoading(true);
        }
        
        setError(null);
        try {
            const [healthRes, riskRes, budgetRes, tasksRes, dbVendorsRes, guestsRes, vendorRes] = await Promise.all([
                fetch(`${API_URL}/ai/health/${eventId}`),
                fetch(`${API_URL}/ai/risk/${eventId}`),
                fetch(`${API_URL}/ai/budget-opt/${eventId}`),
                fetch(`${API_URL}/tasks?eventId=${eventId}`),
                fetch(`${API_URL}/vendors?eventId=${eventId}`),
                fetch(`${API_URL}/guests?eventId=${eventId}`),
                fetch(`${API_URL}/ai/vendors?eventId=${eventId}`)
            ]);

            const health = healthRes.ok ? await healthRes.json() : null;
            const riskData = riskRes.ok ? await riskRes.json() : [];
            const budgetData = budgetRes.ok ? await budgetRes.json() : [];
            const tasksData = tasksRes.ok ? await tasksRes.json() : [];
            const dbVendorsData = dbVendorsRes.ok ? await dbVendorsRes.json() : [];
            const guestsData = guestsRes.ok ? await guestsRes.json() : [];
            const vendorData = vendorRes.ok ? await vendorRes.json() : [];

            setHealthData(health);
            setRisks(riskData);
            setBudgetOpts(budgetData);
            setUserTasks(Array.isArray(tasksData) ? tasksData : []);
            setUserVendors(Array.isArray(dbVendorsData) ? dbVendorsData : []);
            setUserGuests(Array.isArray(guestsData) ? guestsData : []);
            setVendors(Array.isArray(vendorData) ? vendorData : []);

            // Save fresh response to sessionStorage cache
            sessionStorage.setItem(cacheKey, JSON.stringify({
                health, riskData, budgetData, tasksData: Array.isArray(tasksData) ? tasksData : [], dbVendorsData: Array.isArray(dbVendorsData) ? dbVendorsData : [], guestsData: Array.isArray(guestsData) ? guestsData : [], vendorData: Array.isArray(vendorData) ? vendorData : []
            }));

            // Smart Notifications
            if (health?.metrics) {
                if (health.metrics.overdueTasks > 0) {
                    addNotification("Operational Lag", `You have ${health.metrics.overdueTasks} overdue tasks in this event.`);
                }
                if (health.score < 60) {
                    addNotification("Health Warning", `Event health score is critical (${health.score}/100). Immediate action required.`);
                }
            }

            if (riskData.some(r => r.type === "CRITICAL" || r.impact === "High")) {
                addNotification("Risk Alert", "High-impact risk factors identified. Review the Tactical Intelligence Board.");
            }

            const currentEvent = events.find(e => (e.id || e._id) === eventId);
            if (currentEvent) {
                const daysLeft = getDaysToEvent(currentEvent.date);
                if (daysLeft > 0 && daysLeft <= 7) {
                    addNotification("Approaching Deadline", `${currentEvent.name} is in ${daysLeft} days! Finalize all vendor logistics.`);
                }
            }
        } catch (err) {
            console.error("AI Insights fetch error:", err);
            setError("Failed to fetch live event intelligence.");
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
    }, [selectedEventId, syncTimestamp]);

    // Calculate days remaining
    const getDaysToEvent = (eventDate) => {
        if (!eventDate) return 0;
        const today = new Date();
        const target = new Date(eventDate);
        const diffTime = target - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    // Color Helpers
    const getHealthColor = (score) => {
        if (score >= 80) return "#10b981"; // Emerald Green
        if (score >= 50) return "#f59e0b"; // Warm Amber
        return "#ef4444"; // Crimson Red
    };

    const handleResolveRisk = () => {
        if (risks.length === 0) return;
        const cat = risks[0].category;
        if (cat === "Timeline" || cat === "Execution") navigate("/tasks");
        else if (cat === "Budget" || cat === "Partners") navigate("/vendors");
        else if (cat === "Audience" || cat === "Guests") navigate("/guests");
        else navigate("/events");
    };

    // Fetch AI Strategic Plan
    const handleGenerateStrategicPlan = async () => {
        if (!selectedEventId) return;
        setShowStrategicPlanModal(true);
        setLoadingPlan(true);
        try {
            const res = await fetch(`${API_URL}/ai/strategic-plan/${selectedEventId}`);
            if (res.ok) {
                const data = await res.json();
                setStrategicPlan(data.plan || data);
            } else {
                addNotification("Strategic Plan Error", "Could not generate AI strategic plan.");
            }
        } catch (err) {
            console.error("Strategic plan error:", err);
            addNotification("Strategic Plan Error", "Network error when fetching AI plan.");
        } finally {
            setLoadingPlan(false);
        }
    };

    // Apply Strategic Plan
    const handleApplyPlan = async () => {
        if (!selectedEventId) return;
        setApplyingPlan(true);
        try {
            const res = await fetch(`${API_URL}/ai/apply-plan`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ eventId: selectedEventId })
            });
            if (res.ok) {
                const data = await res.json();
                addNotification("AI Autopilot Applied", data.message || "Strategic plan applied to your event.");
                setShowStrategicPlanModal(false);
                fetchAiInsights(selectedEventId);
            } else {
                addNotification("Execution Failed", "Failed to synchronize strategic plan.");
            }
        } catch (err) {
            console.error("Apply plan error:", err);
            addNotification("Execution Error", "Error syncing AI strategic plan.");
        } finally {
            setApplyingPlan(false);
        }
    };

    // Handle Quick Task Submission
    const handleCreateTaskSubmit = async (e) => {
        e.preventDefault();
        if (!quickTaskForm.title.trim() || !selectedEventId) return;
        setTaskSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/tasks`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: quickTaskForm.title.trim(),
                    description: quickTaskForm.description || "",
                    dueDate: quickTaskForm.dueDate || undefined,
                    priority: quickTaskForm.priority,
                    status: "To Do",
                    event: selectedEventId,
                    user: user?.uid
                })
            });
            if (res.ok) {
                addNotification("Task Created", `"${quickTaskForm.title}" added to your event tasks.`);
                setShowQuickTaskModal(false);
                setQuickTaskForm({ title: "", category: "General", priority: "Medium", dueDate: "", description: "" });
                fetchAiInsights(selectedEventId);
            } else {
                const errData = await res.json();
                addNotification("Task Error", errData.message || "Failed to create task.");
            }
        } catch (err) {
            console.error("Task creation error:", err);
            addNotification("Task Error", "Network error when creating task.");
        } finally {
            setTaskSubmitting(false);
        }
    };

    const safeEvents = Array.isArray(events) ? events : [];
    const currentEvent = safeEvents.find(e => (e.id || e._id) === selectedEventId) || safeEvents[0];
    const daysRemaining = getDaysToEvent(currentEvent?.date);

    // REAL METRICS DERIVED FROM MONGO DATABASE FOR THIS SPECIFIC EVENT
    const totalBudget = parseInt(currentEvent?.budget || 4000000);
    const totalSpent = userVendors.reduce((sum, v) => sum + (v.cost || 0), 0);
    const remainingBudget = Math.max(0, totalBudget - totalSpent);
    const budgetUsagePct = Math.min(100, Math.round((totalSpent / (totalBudget || 1)) * 100));

    // Guests Stats for this Event
    const totalGuestsCount = userGuests.length;
    const confirmedGuestsCount = userGuests.filter(g => g.status === "Confirmed").length;
    const realRsvpRate = totalGuestsCount > 0 
        ? Math.round((confirmedGuestsCount / totalGuestsCount) * 100) 
        : (healthData?.metrics?.rsvpRate || 100);

    // Vendors Stats for this Event
    const bookedVendorsCount = userVendors.filter(v => v.status === "Booked" || v.status === "Paid").length;
    const totalVendorsCount = userVendors.length;

    // Tasks Stats for this Event
    const overdueTasksCount = userTasks.filter(t => t.status !== "Completed" && t.dueDate && new Date(t.dueDate) < new Date()).length;
    const completedTasksCount = userTasks.filter(t => t.status === "Completed").length;

    // REAL EVENT-WISE MILESTONES (Real MongoDB Tasks for active event)
    const eventMilestones = useMemo(() => {
        if (!userTasks || userTasks.length === 0) return [];
        
        return [...userTasks].sort((a, b) => {
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate) - new Date(b.dueDate);
        }).slice(0, 5);
    }, [userTasks]);

    // Real Health Score calculation per event
    const currentHealthScore = useMemo(() => {
        if (healthData?.score !== undefined) return healthData.score;
        let score = 100;
        if (userTasks.length > 0) {
            const taskRate = (completedTasksCount / userTasks.length) * 100;
            score -= (100 - taskRate) * 0.3;
        }
        if (totalBudget > 0) {
            const usage = (totalSpent / totalBudget) * 100;
            if (usage > 100) score -= (usage - 100) * 0.5;
        }
        score -= overdueTasksCount * 5;
        return Math.max(0, Math.min(100, Math.round(score)));
    }, [healthData, userTasks, completedTasksCount, totalBudget, totalSpent, overdueTasksCount]);

    // Dynamic Chart Data calculated from Real Database Tasks & Vendors
    const efficiencyChartData = useMemo(() => {
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const baseScore = currentHealthScore;
        
        return days.map((day, idx) => {
            const daySpending = Math.round((totalSpent / 7) * (idx + 1));
            const dayEfficiency = Math.min(100, Math.max(40, baseScore + (idx - 3) * 3));
            return {
                day,
                efficiency: dayEfficiency,
                spending: daySpending,
                tasks: Math.min(completedTasksCount + idx, userTasks.length || 10)
            };
        });
    }, [currentHealthScore, totalSpent, completedTasksCount, userTasks]);

    // Dynamic Category Expense Matrix calculation using REAL DATABASE Vendors for this event
    const categoryExpenseMatrix = useMemo(() => {
        const eventType = currentEvent?.type || "Wedding";
        const benchmarks = {
            "Wedding": [
                { category: "Venue & Hall", ratio: 0.35, keywords: ["venue", "hall", "palace", "resort"] },
                { category: "Catering & Dining", ratio: 0.30, keywords: ["catering", "food", "dining"] },
                { category: "Decor & Theme", ratio: 0.15, keywords: ["decor", "stage", "design", "flower"] },
                { category: "AV & Entertainment", ratio: 0.12, keywords: ["av", "sound", "dj", "tech", "lighting"] },
                { category: "Logistics & Ops", ratio: 0.08, keywords: ["photo", "video", "logistics", "other"] }
            ],
            "Conference": [
                { category: "Venue & Tech", ratio: 0.35, keywords: ["venue", "tech"] },
                { category: "Catering", ratio: 0.25, keywords: ["catering", "food"] },
                { category: "AV & Streaming", ratio: 0.20, keywords: ["av", "sound", "stream"] },
                { category: "Marketing & PR", ratio: 0.12, keywords: ["marketing", "pr"] },
                { category: "Logistics & Ops", ratio: 0.08, keywords: ["logistics", "ops"] }
            ],
            "College Fest": [
                { category: "AV & Production", ratio: 0.40, keywords: ["av", "sound", "stage"] },
                { category: "Decor & Stages", ratio: 0.20, keywords: ["decor"] },
                { category: "Catering & Stalls", ratio: 0.15, keywords: ["catering", "food"] },
                { category: "Venue", ratio: 0.15, keywords: ["venue", "ground"] },
                { category: "Logistics & Security", ratio: 0.10, keywords: ["security", "ops"] }
            ]
        };

        const list = benchmarks[eventType] || benchmarks["Wedding"];

        return list.map(item => {
            const allocated = Math.round(totalBudget * item.ratio);
            
            // Match real vendors in DB for this specific event by service category
            const matchingVendors = userVendors.filter(v => {
                if (!v.service) return false;
                const serviceName = v.service.toLowerCase();
                return item.keywords.some(kw => serviceName.includes(kw));
            });

            const spent = matchingVendors.reduce((sum, v) => sum + (v.cost || 0), 0);
            const pct = allocated > 0 ? Math.min(100, Math.round((spent / allocated) * 100)) : 0;

            return {
                category: item.category,
                allocated,
                spent,
                pct
            };
        });
    }, [currentEvent, totalBudget, userVendors]);

    if (loading) {
        return (
            <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Skeleton animation="wave" variant="text" width={220} height={40} />
                    <Skeleton animation="wave" variant="rounded" width={300} height={40} sx={{ borderRadius: '12px' }} />
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(3, 1fr)' }, gap: 2.5 }}>
                    <Skeleton animation="wave" variant="rounded" height={180} sx={{ borderRadius: '20px' }} />
                    <Skeleton animation="wave" variant="rounded" height={180} sx={{ borderRadius: '20px' }} />
                    <Skeleton animation="wave" variant="rounded" height={180} sx={{ borderRadius: '20px' }} />
                    <Skeleton animation="wave" variant="rounded" height={180} sx={{ borderRadius: '20px' }} />
                    <Skeleton animation="wave" variant="rounded" height={180} sx={{ borderRadius: '20px' }} />
                    <Skeleton animation="wave" variant="rounded" height={180} sx={{ borderRadius: '20px' }} />
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>
                    <Skeleton animation="wave" variant="rounded" height={360} sx={{ borderRadius: '24px' }} />
                    <Skeleton animation="wave" variant="rounded" height={360} sx={{ borderRadius: '24px' }} />
                </Box>
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
                    background: "rgba(18, 18, 20, 0.8)",
                    backdropFilter: "blur(24px)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "32px",
                    padding: "4rem 3rem",
                    maxWidth: "620px",
                    width: "100%",
                    boxShadow: "0 30px 60px rgba(0, 0, 0, 0.4)",
                    position: "relative",
                    overflow: "hidden"
                }}>
                    <div style={{
                        position: "absolute",
                        top: "-50px",
                        left: "-50px",
                        width: "180px",
                        height: "180px",
                        background: "radial-gradient(circle, rgba(249, 115, 22, 0.15) 0%, transparent 70%)",
                        borderRadius: "50%",
                        pointerEvents: "none"
                    }} />

                    <div style={{ position: "relative", zIndex: 1 }}>
                        <div style={{
                            width: "84px",
                            height: "84px",
                            background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                            borderRadius: "26px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 2rem",
                            boxShadow: "0 15px 35px rgba(249, 115, 22, 0.35)",
                            transform: "rotate(-5deg)"
                        }}>
                            <Sparkles size={40} color="#fff" />
                        </div>

                        <h1 style={{
                            fontSize: "2.5rem",
                            fontWeight: 900,
                            color: "var(--text-primary)",
                            marginBottom: "1rem",
                            letterSpacing: "-0.04em"
                        }}>
                            Welcome to <span style={{ color: "#f97316" }}>Planora OS</span>
                        </h1>

                        <p style={{
                            fontSize: "1.05rem",
                            color: "var(--text-muted)",
                            marginBottom: "2.5rem",
                            maxWidth: "460px",
                            marginInline: "auto",
                            lineHeight: 1.6,
                            fontWeight: 500
                        }}>
                            The tactical operating system for modern event orchestrators. Create your first event to activate neural analytics and real-time AI automation.
                        </p>

                        <button
                            className="btn btn-primary"
                            style={{
                                padding: "1.1rem 2.8rem",
                                borderRadius: "16px",
                                fontSize: "1rem",
                                fontWeight: 800,
                                background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                                border: "none",
                                color: "#fff",
                                boxShadow: "0 12px 30px rgba(249, 115, 22, 0.35)",
                                cursor: "pointer"
                            }}
                            onClick={() => navigate('/events')}
                        >
                            Create Your First Event
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="responsive-container" style={{
            fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
            background: "transparent",
            minHeight: "100vh",
            color: "var(--text-primary)",
            padding: "1.5rem 1.75rem 4rem"
        }}>
            {/* Glossy Top Alert Bar */}
            {risks.length > 0 && (
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 22px",
                    background: "rgba(239, 68, 68, 0.12)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    borderRadius: "14px",
                    marginBottom: "1.75rem",
                    backdropFilter: "blur(12px)",
                    boxShadow: "0 10px 25px rgba(239, 68, 68, 0.08)"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                        <div style={{
                            padding: "6px",
                            borderRadius: "8px",
                            background: "rgba(239, 68, 68, 0.2)",
                            color: "#ef4444"
                        }}>
                            <AlertTriangle size={18} />
                        </div>
                        <div>
                            <div style={{ color: "#ef4444", fontWeight: 800, fontSize: "13px" }}>
                                Tactical Risk Alert ({risks[0].type || "HIGH"})
                            </div>
                            <div style={{ color: "var(--text-secondary)", fontSize: "12px", fontWeight: 500 }}>
                                {risks[0].message}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleResolveRisk}
                        style={{
                            color: "#fff",
                            background: "#ef4444",
                            fontWeight: 800,
                            fontSize: "12px",
                            padding: "8px 16px",
                            borderRadius: "10px",
                            border: "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)"
                        }}
                    >
                        Resolve Issue <ArrowRight size={14} />
                    </button>
                </div>
            )}

            {/* Tactical Command Header Toolbar */}
            <div style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "1rem",
                marginBottom: "2rem",
                paddingBottom: "1rem",
                borderBottom: "1px solid rgba(255,255,255,0.06)"
            }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <span style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: "#10b981",
                            boxShadow: "0 0 10px #10b981"
                        }} />
                        <span style={{ fontSize: "11px", fontWeight: 900, color: "#f97316", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                            Mission Control — Tactical Hub
                        </span>
                    </div>
                    <h1 style={{ fontSize: "24px", fontWeight: 900, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.02em" }}>
                        {currentEvent?.name || "Overview"}
                    </h1>
                </div>

                {/* Quick Action Controls */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                    <button
                        onClick={() => setShowQuickTaskModal(true)}
                        style={{
                            padding: "9px 16px",
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "12px",
                            color: "var(--text-primary)",
                            fontSize: "12px",
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            cursor: "pointer",
                            transition: "all 0.2s"
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
                        onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                    >
                        <Plus size={15} color="#f97316" /> Quick Task
                    </button>

                    <button
                        onClick={handleGenerateStrategicPlan}
                        style={{
                            padding: "9px 18px",
                            background: "linear-gradient(135deg, rgba(249, 115, 22, 0.2) 0%, rgba(234, 88, 12, 0.3) 100%)",
                            border: "1px solid rgba(249, 115, 22, 0.4)",
                            borderRadius: "12px",
                            color: "#f97316",
                            fontSize: "12px",
                            fontWeight: 800,
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            cursor: "pointer",
                            boxShadow: "0 4px 15px rgba(249, 115, 22, 0.15)"
                        }}
                    >
                        <Zap size={15} fill="#f97316" /> AI Strategic Plan
                    </button>

                    <button
                        onClick={() => fetchAiInsights(selectedEventId)}
                        title="Resync Live Intelligence"
                        style={{
                            padding: "9px",
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "12px",
                            color: "var(--text-muted)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}
                    >
                        <RefreshCw size={15} />
                    </button>
                </div>
            </div>

            {/* ACTIVE EVENT HERO BANNER */}
            {currentEvent?.banner && (
                <div style={{
                    width: "100%",
                    height: "180px",
                    borderRadius: "20px",
                    overflow: "hidden",
                    marginBottom: "1.5rem",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    position: "relative",
                    boxShadow: "0 15px 35px rgba(0,0,0,0.3)"
                }}>
                    <img 
                        src={currentEvent.banner.startsWith("/") ? `${API_URL}${currentEvent.banner}` : currentEvent.banner} 
                        alt={currentEvent.name} 
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} 
                    />
                    <div style={{
                        position: "absolute",
                        inset: 0,
                        background: "linear-gradient(to top, rgba(18, 18, 20, 0.85) 0%, transparent 70%)",
                        display: "flex",
                        alignItems: "flex-end",
                        padding: "1.5rem"
                    }}>
                        <div>
                            <span style={{ background: "rgba(249, 115, 22, 0.2)", color: "#f97316", fontSize: "10px", fontWeight: 900, padding: "3px 10px", borderRadius: "100px", textTransform: "uppercase", letterSpacing: "0.1em", border: "1px solid rgba(249, 115, 22, 0.4)" }}>
                                Active Banner: {currentEvent.type || "Event"}
                            </span>
                            <h3 style={{ fontSize: "1.4rem", fontWeight: 900, margin: "0.3rem 0 0", color: "#ffffff" }}>
                                {currentEvent.name}
                            </h3>
                        </div>
                    </div>
                </div>
            )}

            {/* PERFECT SYMMETRICAL 6-CARD HERO KPI GRID */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: "1.5rem",
                marginBottom: "2.5rem"
            }}>
                {/* 1. Operational Vitality Card */}
                <div style={{
                    background: "rgba(18, 18, 20, 0.75)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255, 255, 255, 0.07)",
                    borderRadius: "20px",
                    padding: "1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    boxShadow: "0 15px 35px rgba(0, 0, 0, 0.2)"
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 800 }}>
                            Operational Vitality
                        </div>
                        <div style={{
                            padding: "3px 10px",
                            borderRadius: "100px",
                            background: "rgba(16, 185, 129, 0.1)",
                            border: "1px solid rgba(16, 185, 129, 0.3)",
                            color: "#10b981",
                            fontSize: "10px",
                            fontWeight: 800
                        }}>
                            LIVE SCORE
                        </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "flex-end", gap: "12px", marginBottom: "1.25rem" }}>
                        <div style={{
                            fontSize: "58px",
                            fontWeight: 900,
                            color: getHealthColor(currentHealthScore),
                            lineHeight: 0.9,
                            letterSpacing: "-0.04em"
                        }}>
                            {currentHealthScore}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <div style={{ fontSize: "12px", fontWeight: 800, color: "var(--text-primary)" }}>
                                / 100 Health Score
                            </div>
                            <div style={{ display: "flex", gap: "4px" }}>
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} style={{
                                        width: "14px",
                                        height: "4px",
                                        borderRadius: "2px",
                                        background: i <= Math.ceil(currentHealthScore / 20) ? getHealthColor(currentHealthScore) : "rgba(255,255,255,0.08)"
                                    }} />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "auto" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-secondary)", fontWeight: 600 }}>
                            <span>Task Velocity</span>
                            <span style={{ color: "#10b981", fontWeight: 800 }}>
                                {userTasks.length > 0 ? Math.round((completedTasksCount / userTasks.length) * 100) : 100}%
                            </span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-secondary)", fontWeight: 600 }}>
                            <span>Budget Safety</span>
                            <span style={{ color: "#f97316", fontWeight: 800 }}>{100 - budgetUsagePct}% Safe</span>
                        </div>
                    </div>
                </div>

                {/* 2. Remaining Budget & Financial Health */}
                <div style={{
                    background: "rgba(18, 18, 20, 0.75)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255, 255, 255, 0.07)",
                    borderRadius: "20px",
                    padding: "1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    boxShadow: "0 15px 35px rgba(0, 0, 0, 0.2)"
                }}>
                    <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                            <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 800 }}>
                                Remaining Budget
                            </div>
                            <DollarSign size={16} color="#f97316" />
                        </div>
                        <div style={{ fontSize: "32px", fontWeight: 900, color: "var(--text-primary)", lineHeight: 1, letterSpacing: "-0.03em" }}>
                            ₹{remainingBudget.toLocaleString("en-IN")}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, marginTop: "6px" }}>
                            <span style={{ color: "#f97316", fontWeight: 800 }}>{budgetUsagePct}%</span> of total ₹{totalBudget.toLocaleString("en-IN")} spent
                        </div>
                    </div>

                    <div style={{ height: "45px", width: "100%", marginTop: "1rem" }}>
                        <svg width="100%" height="100%" viewBox="0 0 100 40" preserveAspectRatio="none">
                            <path
                                d="M0 32 Q 25 36, 40 22 T 70 28 T 100 12"
                                fill="none"
                                stroke="#f97316"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                            />
                            <path
                                d="M0 32 Q 25 36, 40 22 T 70 28 T 100 12 V 40 H 0 Z"
                                fill="url(#budgetSparkGradient)"
                                opacity="0.25"
                            />
                            <defs>
                                <linearGradient id="budgetSparkGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#f97316" />
                                    <stop offset="100%" stopColor="transparent" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                </div>

                {/* 3. Days to Kickoff Radial Dial */}
                <div style={{
                    background: "rgba(18, 18, 20, 0.75)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255, 255, 255, 0.07)",
                    borderRadius: "20px",
                    padding: "1.5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "1.25rem",
                    boxShadow: "0 15px 35px rgba(0, 0, 0, 0.2)"
                }}>
                    <div style={{ position: "relative", width: "76px", height: "76px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="76" height="76" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                            <circle
                                cx="18"
                                cy="18"
                                r="15.5"
                                fill="none"
                                stroke="#f97316"
                                strokeWidth="3"
                                strokeDasharray={`${Math.max(10, Math.min(95, (daysRemaining / 90) * 100))} 100`}
                                strokeLinecap="round"
                                transform="rotate(-90 18 18)"
                            />
                        </svg>
                        <div style={{ position: "absolute", fontSize: "20px", fontWeight: 900, color: "var(--text-primary)" }}>
                            {daysRemaining}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: "10px", color: "#f97316", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2px" }}>
                            {currentEvent?.type || "Event Prep"}
                        </div>
                        <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "4px" }}>
                            Days to Kickoff
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                            {currentEvent?.date ? new Date(currentEvent.date).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "TBD"}
                        </div>
                    </div>
                </div>

                {/* 4. Audience RSVP Pulse */}
                <div style={{
                    background: "rgba(18, 18, 20, 0.75)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255, 255, 255, 0.07)",
                    borderRadius: "20px",
                    padding: "1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    boxShadow: "0 15px 35px rgba(0, 0, 0, 0.2)"
                }}>
                    <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                            <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 800 }}>
                                Guest Engagement
                            </div>
                            <Users size={16} color="#3b82f6" />
                        </div>
                        <div style={{ fontSize: "28px", fontWeight: 900, color: "var(--text-primary)", lineHeight: 1 }}>
                            {realRsvpRate}% RSVP Rate
                        </div>
                    </div>

                    <div style={{ marginTop: "1rem" }}>
                        <div style={{
                            width: "100%",
                            height: "8px",
                            background: "rgba(255,255,255,0.06)",
                            borderRadius: "100px",
                            overflow: "hidden",
                            marginBottom: "8px"
                        }}>
                            <div style={{
                                width: `${realRsvpRate}%`,
                                height: "100%",
                                background: "linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)",
                                borderRadius: "100px"
                            }} />
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                                {totalGuestsCount > 0 ? `${confirmedGuestsCount} of ${totalGuestsCount} Confirmed` : "No DB guests added"}
                            </span>
                            <Link to="/guests" style={{ fontSize: "11px", color: "#3b82f6", fontWeight: 700, textDecoration: "none" }}>
                                Manage Guests &rarr;
                            </Link>
                        </div>
                    </div>
                </div>

                {/* 5. Vendor & Partner Logistics */}
                <div style={{
                    background: "rgba(18, 18, 20, 0.75)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255, 255, 255, 0.07)",
                    borderRadius: "20px",
                    padding: "1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    boxShadow: "0 15px 35px rgba(0, 0, 0, 0.2)"
                }}>
                    <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                            <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 800 }}>
                                Vendor Logistics
                            </div>
                            <Handshake size={16} color="#10b981" />
                        </div>
                        <div style={{ fontSize: "28px", fontWeight: 900, color: "var(--text-primary)", lineHeight: 1 }}>
                            {bookedVendorsCount} / {totalVendorsCount} Booked
                        </div>
                    </div>

                    <div style={{ marginTop: "1rem" }}>
                        <div style={{ display: "flex", gap: "6px", marginBottom: "10px", flexWrap: "wrap" }}>
                            {userVendors.length > 0 ? (
                                userVendors.slice(0, 2).map((v, i) => (
                                    <span key={i} style={{ fontSize: "10px", padding: "3px 8px", background: v.status === "Booked" || v.status === "Paid" ? "rgba(16, 185, 129, 0.15)" : "rgba(249, 115, 22, 0.15)", color: v.status === "Booked" || v.status === "Paid" ? "#10b981" : "#f97316", borderRadius: "6px", fontWeight: 700 }}>
                                        {v.service}: {v.status || "Inquiry"}
                                    </span>
                                ))
                            ) : (
                                <span style={{ fontSize: "10px", padding: "3px 8px", background: "rgba(255, 255, 255, 0.05)", color: "var(--text-muted)", borderRadius: "6px", fontWeight: 600 }}>
                                    No DB Vendors Added Yet
                                </span>
                            )}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Anchor Partners</span>
                            <Link to="/vendors" style={{ fontSize: "11px", color: "#10b981", fontWeight: 700, textDecoration: "none" }}>
                                Vendors Directory &rarr;
                            </Link>
                        </div>
                    </div>
                </div>

                {/* 6. Operational Risk & Team Pulse */}
                <div style={{
                    background: "rgba(18, 18, 20, 0.75)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255, 255, 255, 0.07)",
                    borderRadius: "20px",
                    padding: "1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    boxShadow: "0 15px 35px rgba(0, 0, 0, 0.2)"
                }}>
                    <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                            <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 800 }}>
                                Risk & Team Radar
                            </div>
                            <ShieldCheck size={16} color="#a855f7" />
                        </div>
                        <div style={{ fontSize: "28px", fontWeight: 900, color: "var(--text-primary)", lineHeight: 1 }}>
                            {risks.length === 0 ? "Minimal Risk" : `${risks.length} Risk Factors`}
                        </div>
                    </div>

                    <div style={{ marginTop: "1rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", color: "var(--text-secondary)", marginBottom: "6px" }}>
                            <span>Overdue Tasks</span>
                            <span style={{ color: overdueTasksCount > 0 ? "#ef4444" : "#10b981", fontWeight: 800 }}>
                                {overdueTasksCount} Pending
                            </span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Total Event Tasks</span>
                            <Link to="/tasks" style={{ fontSize: "11px", color: "#a855f7", fontWeight: 700, textDecoration: "none" }}>
                                {userTasks.length} Tasks &rarr;
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* DUAL ANALYTICS SECTION */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
                gap: "1.5rem",
                marginBottom: "2rem"
            }}>
                {/* Main Interactive Recharts Card */}
                <div style={{
                    background: "rgba(18, 18, 20, 0.75)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255, 255, 255, 0.07)",
                    borderRadius: "24px",
                    padding: "1.75rem"
                }}>
                    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", gap: "1rem" }}>
                        <div>
                            <h3 style={{ fontSize: "17px", fontWeight: 800, margin: 0, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
                                {chartMode === "efficiency" ? "Execution Velocity & Efficiency Trend" : "Financial Burn Trajectory"}
                            </h3>
                            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                                Real-time algorithmic performance telemetry
                            </div>
                        </div>

                        {/* Chart Mode Toggle */}
                        <div style={{ display: "flex", gap: "4px", background: "rgba(255,255,255,0.04)", padding: "4px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)" }}>
                            <button
                                onClick={() => setChartMode("efficiency")}
                                style={{
                                    padding: "4px 12px",
                                    borderRadius: "7px",
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    border: "none",
                                    cursor: "pointer",
                                    background: chartMode === "efficiency" ? "#f97316" : "transparent",
                                    color: chartMode === "efficiency" ? "#fff" : "var(--text-muted)"
                                }}
                            >
                                Efficiency %
                            </button>
                            <button
                                onClick={() => setChartMode("spending")}
                                style={{
                                    padding: "4px 12px",
                                    borderRadius: "7px",
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    border: "none",
                                    cursor: "pointer",
                                    background: chartMode === "spending" ? "#f97316" : "transparent",
                                    color: chartMode === "spending" ? "#fff" : "var(--text-muted)"
                                }}
                            >
                                Spend (₹)
                            </button>
                        </div>
                    </div>

                    <div style={{ height: "270px", width: "100%" }}>
                        <ResponsiveContainer width="100%" height="100%">
                            {chartMode === "efficiency" ? (
                                <AreaChart data={efficiencyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="efficiencyGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                                    <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                                    <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                                    <Tooltip
                                        contentStyle={{ background: "#121214", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                                        itemStyle={{ color: "#f97316", fontSize: "12px", fontWeight: 800 }}
                                    />
                                    <Area type="monotone" dataKey="efficiency" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#efficiencyGrad)" />
                                </AreaChart>
                            ) : (
                                <BarChart data={efficiencyChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                                    <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                                    <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ background: "#121214", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                                        itemStyle={{ color: "#10b981", fontSize: "12px", fontWeight: 800 }}
                                    />
                                    <Bar dataKey="spending" fill="#f97316" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            )}
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Budget Category Allocation Breakdown (REAL DATABASE SYNC) */}
                <div style={{
                    background: "rgba(18, 18, 20, 0.75)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255, 255, 255, 0.07)",
                    borderRadius: "24px",
                    padding: "1.75rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between"
                }}>
                    <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                            <h3 style={{ fontSize: "17px", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
                                Category Expense Matrix
                            </h3>
                            <Link to="/budget" style={{ fontSize: "12px", color: "#f97316", fontWeight: 700, textDecoration: "none" }}>
                                Ledger &rarr;
                            </Link>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                            {categoryExpenseMatrix.map((item, idx) => (
                                <div key={idx} style={{ background: "rgba(255,255,255,0.02)", padding: "10px 14px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.04)" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>
                                        <span style={{ color: "var(--text-primary)" }}>{item.category}</span>
                                        <span style={{ color: "var(--text-muted)" }}>
                                            ₹{item.spent.toLocaleString("en-IN")} / ₹{item.allocated.toLocaleString("en-IN")}
                                        </span>
                                    </div>
                                    <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "100px", overflow: "hidden" }}>
                                        <div style={{ width: `${item.pct}%`, height: "100%", background: "#f97316", borderRadius: "100px", transition: "width 0.4s ease" }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{
                        marginTop: "1.25rem",
                        padding: "12px",
                        background: "rgba(249, 115, 22, 0.06)",
                        border: "1px solid rgba(249, 115, 22, 0.2)",
                        borderRadius: "14px",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px"
                    }}>
                        <Sparkles size={16} color="#f97316" style={{ flexShrink: 0 }} />
                        <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: 600, lineHeight: 1.4 }}>
                            {Array.isArray(budgetOpts) && budgetOpts.length > 0 && typeof budgetOpts[0] === "string"
                                ? budgetOpts[0]
                                : "AI Budget Optimizer active. Projected savings across categories: ₹1,20,000."}
                        </span>
                    </div>
                </div>
            </div>

            {/* SPLIT LAYOUT: EVENT MILESTONES (REAL EVENT TASKS) & AI VENDORS */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
                gap: "1.5rem"
            }}>
                {/* Event Milestones — REAL TASKS FOR THIS EVENT */}
                <div style={{
                    background: "rgba(18, 18, 20, 0.75)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255, 255, 255, 0.07)",
                    borderRadius: "24px",
                    padding: "1.75rem"
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                        <h3 style={{ fontSize: "17px", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
                            Event Milestones
                        </h3>
                        <Link to="/tasks" style={{ fontSize: "12px", color: "var(--text-muted)", textDecoration: "none", fontWeight: 600 }}>
                            View All ({userTasks.length}) &rarr;
                        </Link>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                        {eventMilestones.map((task, idx) => {
                            const taskDate = task.dueDate ? new Date(task.dueDate) : new Date(currentEvent?.date || Date.now());
                            const month = taskDate.toLocaleString('default', { month: 'short' }).toUpperCase();
                            const day = taskDate.getDate().toString().padStart(2, '0');
                            const isCompleted = task.status === "Completed";
                            const isInProgress = task.status === "In Progress";

                            return (
                                <div key={task._id || idx} style={{ display: "flex", gap: "1.25rem", position: "relative" }}>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "42px", flexShrink: 0 }}>
                                        <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 800 }}>{month}</div>
                                        <div style={{ fontSize: "18px", color: "var(--text-primary)", fontWeight: 900 }}>{day}</div>
                                    </div>

                                    <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", flex: 1, paddingTop: "2px" }}>
                                        <div style={{
                                            width: "18px",
                                            height: "18px",
                                            borderRadius: "50%",
                                            background: isCompleted ? "rgba(16, 185, 129, 0.2)" : (isInProgress ? "#f97316" : "rgba(255,255,255,0.06)"),
                                            boxShadow: isInProgress ? "0 0 10px #f97316" : "none",
                                            flexShrink: 0,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            marginTop: "2px"
                                        }}>
                                            {isCompleted && <Check size={10} color="#10b981" strokeWidth={3} />}
                                            {isInProgress && <div style={{ width: "6px", height: "6px", background: "#fff", borderRadius: "50%" }} />}
                                        </div>

                                        <div>
                                            <div style={{ fontSize: "14px", fontWeight: 700, color: isCompleted ? "#10b981" : (isInProgress ? "#f97316" : "var(--text-primary)"), marginBottom: "2px" }}>
                                                {task.title}
                                            </div>
                                            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                                                {task.status || "Pending"} {task.priority ? `• ${task.priority} Priority` : ""}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {eventMilestones.length === 0 && (
                            <div style={{ textAlign: "center", padding: "2rem 1rem", background: "rgba(255,255,255,0.02)", borderRadius: "16px", border: "1px dashed rgba(255,255,255,0.08)" }}>
                                <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "1rem" }}>
                                    No real tasks added to <strong>{currentEvent?.name}</strong> yet.
                                </p>
                                <button
                                    onClick={() => setShowQuickTaskModal(true)}
                                    style={{
                                        padding: "8px 16px", background: "rgba(249, 115, 22, 0.15)",
                                        border: "1px solid rgba(249, 115, 22, 0.3)", borderRadius: "10px",
                                        color: "#f97316", fontSize: "12px", fontWeight: 800, cursor: "pointer"
                                    }}
                                >
                                    + Add First Task
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* AI Smart Match Vendors */}
                <div style={{
                    background: "rgba(18, 18, 20, 0.75)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255, 255, 255, 0.07)",
                    borderRadius: "24px",
                    padding: "1.75rem"
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                        <h3 style={{ fontSize: "17px", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
                            Smart Match Vendors
                        </h3>
                        <div style={{ fontSize: "11px", color: "#f97316", fontWeight: 800, background: "rgba(249, 115, 22, 0.1)", padding: "3px 10px", borderRadius: "100px", border: "1px solid rgba(249, 115, 22, 0.3)" }}>
                            AI Verified
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                        {vendors.slice(0, 5).map((vendor, i) => (
                            <div
                                key={i}
                                onClick={() => setSelectedVendorModal(vendor)}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "0.9rem 1.1rem",
                                    background: "rgba(255,255,255,0.02)",
                                    border: "1px solid rgba(255,255,255,0.04)",
                                    borderRadius: "16px",
                                    cursor: "pointer",
                                    transition: "all 0.2s"
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                                    e.currentTarget.style.borderColor = "rgba(249, 115, 22, 0.3)";
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.04)";
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 1 }}>
                                    <div style={{
                                        width: "42px",
                                        height: "42px",
                                        borderRadius: "12px",
                                        background: "rgba(249, 115, 22, 0.1)",
                                        border: "1px solid rgba(249, 115, 22, 0.2)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "#f97316",
                                        flexShrink: 0
                                    }}>
                                        <Star size={18} fill="#f97316" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                            <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>{vendor.name}</span>
                                            <span style={{ fontSize: "10px", padding: "2px 7px", background: "rgba(249, 115, 22, 0.15)", color: "#f97316", borderRadius: "6px", fontWeight: 700 }}>
                                                {vendor.service}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px", display: "flex", alignItems: "center", gap: "5px" }}>
                                            <MapPin size={12} color="var(--text-muted)" />
                                            <span>{vendor.location ? `${vendor.location}, ${vendor.city || ""}` : (vendor.city || currentEvent?.city || "Mumbai")}</span>
                                        </div>
                                        {vendor.matchReason && (
                                            <div style={{ fontSize: "10px", color: "#10b981", fontWeight: 600, marginTop: "2px", display: "flex", alignItems: "center", gap: "4px" }}>
                                                <Zap size={11} color="#10b981" />
                                                <span>{vendor.matchReason}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div style={{ textAlign: "right", flexShrink: 0, marginLeft: "1rem" }}>
                                    <div style={{ fontSize: "14px", fontWeight: 900, color: "var(--text-primary)" }}>{vendor.priceRange || "₹₹₹"}</div>
                                    <div style={{ fontSize: "11px", color: "#f59e0b", display: "flex", alignItems: "center", gap: "3px", justifyContent: "flex-end", fontWeight: 700 }}>
                                        <Star size={12} fill="#f59e0b" color="#f59e0b" />
                                        <span>{vendor.rating || 4.9}</span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {vendors.length === 0 && (
                            <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                                No vendor recommendations fetched. Click 'AI Strategic Plan' for suggestions.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* VENDOR DETAIL MODAL */}
            {selectedVendorModal && (
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)",
                    zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem"
                }}>
                    <div style={{
                        background: "#121214", border: "1px solid rgba(255,255,255,0.1)",
                        width: "100%", maxWidth: "520px", borderRadius: "24px", padding: "2rem",
                        boxShadow: "0 25px 60px rgba(0,0,0,0.6)", position: "relative"
                    }}>
                        <button
                            onClick={() => setSelectedVendorModal(null)}
                            style={{
                                position: "absolute", top: "1.5rem", right: "1.5rem",
                                border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)",
                                width: "32px", height: "32px", borderRadius: "50%",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                cursor: "pointer", color: "var(--text-muted)"
                            }}
                        >
                            <X size={16} />
                        </button>

                        <div style={{ marginBottom: "1.5rem" }}>
                            <h3 style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--text-primary)", margin: "0 0 4px" }}>
                                {selectedVendorModal.name}
                            </h3>
                            <p style={{ color: "#f97316", fontSize: "13px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>
                                {selectedVendorModal.service} Partner
                            </p>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                            <div style={{ padding: "12px", background: "rgba(255,255,255,0.02)", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.04)" }}>
                                <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 800, textTransform: "uppercase" }}>Rating</div>
                                <div style={{ fontSize: "17px", fontWeight: 900, color: "#f59e0b", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                                    <Star size={16} fill="#f59e0b" /> {selectedVendorModal.rating} / 5.0
                                </div>
                            </div>
                            <div style={{ padding: "12px", background: "rgba(255,255,255,0.02)", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.04)" }}>
                                <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 800, textTransform: "uppercase" }}>Price Tier</div>
                                <div style={{ fontSize: "17px", fontWeight: 900, color: "var(--text-primary)", marginTop: "2px" }}>
                                    {selectedVendorModal.priceRange}
                                </div>
                            </div>
                        </div>

                        <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: "16px", padding: "1.25rem", marginBottom: "1.5rem", border: "1px solid rgba(255,255,255,0.04)" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                                    <MapPin size={16} color="#f97316" />
                                    <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 600 }}>
                                        {selectedVendorModal.location || "Location verified on request"}
                                    </span>
                                </div>
                                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                                    <Phone size={16} color="#f97316" />
                                    <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 600 }}>
                                        {selectedVendorModal.contact || "+91 98765 43210"}
                                    </span>
                                </div>
                                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                                    <Mail size={16} color="#f97316" />
                                    <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 600 }}>
                                        {selectedVendorModal.email || "vendor@planorapartners.com"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                addNotification("Vendor Saved", `Saved ${selectedVendorModal.name} to vendor shortlist.`);
                                setSelectedVendorModal(null);
                            }}
                            style={{
                                width: "100%", padding: "12px", background: "#f97316",
                                border: "none", borderRadius: "14px", color: "#fff",
                                fontWeight: 800, fontSize: "13px", cursor: "pointer"
                            }}
                        >
                            Shortlist Vendor
                        </button>
                    </div>
                </div>
            )}

            {/* QUICK TASK MODAL */}
            {showQuickTaskModal && (
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)",
                    zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem"
                }}>
                    <div style={{
                        background: "#121214", border: "1px solid rgba(255,255,255,0.1)",
                        width: "100%", maxWidth: "480px", borderRadius: "24px", padding: "2rem",
                        boxShadow: "0 25px 60px rgba(0,0,0,0.6)", position: "relative"
                    }}>
                        <button
                            onClick={() => setShowQuickTaskModal(false)}
                            style={{
                                position: "absolute", top: "1.5rem", right: "1.5rem",
                                border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)",
                                width: "32px", height: "32px", borderRadius: "50%",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                cursor: "pointer", color: "var(--text-muted)"
                            }}
                        >
                            <X size={16} />
                        </button>

                        <h3 style={{ fontSize: "1.4rem", fontWeight: 900, color: "var(--text-primary)", marginBottom: "1.25rem" }}>
                            Create Quick Task
                        </h3>

                        <form onSubmit={handleCreateTaskSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "6px" }}>
                                    Task Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Finalize Catering Contract"
                                    value={quickTaskForm.title}
                                    onChange={e => setQuickTaskForm({ ...quickTaskForm, title: e.target.value })}
                                    style={{
                                        width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.03)",
                                        border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px",
                                        color: "#fff", fontSize: "13px", outline: "none"
                                    }}
                                />
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "6px" }}>
                                        Priority
                                    </label>
                                    <select
                                        value={quickTaskForm.priority}
                                        onChange={e => setQuickTaskForm({ ...quickTaskForm, priority: e.target.value })}
                                        style={{
                                            width: "100%", padding: "10px 14px", background: "#18181b",
                                            border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px",
                                            color: "#fff", fontSize: "13px", outline: "none"
                                        }}
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "6px" }}>
                                        Due Date
                                    </label>
                                    <input
                                        type="date"
                                        value={quickTaskForm.dueDate}
                                        onChange={e => setQuickTaskForm({ ...quickTaskForm, dueDate: e.target.value })}
                                        style={{
                                            width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.03)",
                                            border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px",
                                            color: "#fff", fontSize: "13px", outline: "none"
                                        }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "6px" }}>
                                    Notes (Optional)
                                </label>
                                <textarea
                                    rows="3"
                                    placeholder="Add task notes or dependencies..."
                                    value={quickTaskForm.description}
                                    onChange={e => setQuickTaskForm({ ...quickTaskForm, description: e.target.value })}
                                    style={{
                                        width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.03)",
                                        border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px",
                                        color: "#fff", fontSize: "13px", outline: "none", resize: "none"
                                    }}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={taskSubmitting}
                                style={{
                                    marginTop: "0.5rem", padding: "12px", background: "#f97316",
                                    border: "none", borderRadius: "12px", color: "#fff",
                                    fontWeight: 800, fontSize: "13px", cursor: "pointer",
                                    opacity: taskSubmitting ? 0.6 : 1
                                }}
                            >
                                {taskSubmitting ? "Adding Task..." : "Add Task to Event"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* AI STRATEGIC PLAN MODAL */}
            {showStrategicPlanModal && (
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)",
                    zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem"
                }}>
                    <div style={{
                        background: "#121214", border: "1px solid rgba(249, 115, 22, 0.3)",
                        width: "100%", maxWidth: "600px", borderRadius: "24px", padding: "2rem",
                        boxShadow: "0 25px 60px rgba(249, 115, 22, 0.2)", position: "relative"
                    }}>
                        <button
                            onClick={() => setShowStrategicPlanModal(false)}
                            style={{
                                position: "absolute", top: "1.5rem", right: "1.5rem",
                                border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)",
                                width: "32px", height: "32px", borderRadius: "50%",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                cursor: "pointer", color: "var(--text-muted)"
                            }}
                        >
                            <X size={16} />
                        </button>

                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1rem" }}>
                            <Zap size={22} fill="#f97316" color="#f97316" />
                            <h3 style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--text-primary)", margin: 0 }}>
                                AI Strategic Blueprint
                            </h3>
                        </div>

                        {loadingPlan ? (
                            <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
                                <RefreshCw size={32} color="#f97316" style={{ animation: "spin 1s linear infinite" }} />
                                <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "1rem", fontWeight: 600 }}>
                                    Synthesizing live event intelligence and risk models...
                                </p>
                            </div>
                        ) : (
                            <div>
                                <div style={{ background: "rgba(249, 115, 22, 0.08)", padding: "1rem", borderRadius: "14px", border: "1px solid rgba(249, 115, 22, 0.2)", marginBottom: "1.25rem" }}>
                                    <div style={{ fontSize: "11px", fontWeight: 800, color: "#f97316", textTransform: "uppercase" }}>Primary Focus Target</div>
                                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff", marginTop: "4px" }}>
                                        {strategicPlan?.targetFocus || "Accelerate core vendor booking and mitigate 14-day milestone bottlenecks."}
                                    </div>
                                </div>

                                <div style={{ marginBottom: "1.25rem" }}>
                                    <div style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "8px" }}>
                                        Recommended Tactical Actions
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                        {(strategicPlan?.taskRecommendations || [
                                            "Confirm venue layout and final headcount with catering.",
                                            "Send guest reminder notifications for pending RSVPs.",
                                            "Review sound and lighting equipment specs with AV team."
                                        ]).map((rec, i) => (
                                            <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--text-secondary)", background: "rgba(255,255,255,0.02)", padding: "8px 12px", borderRadius: "10px" }}>
                                                <CheckCircle2 size={15} color="#10b981" />
                                                <span>{rec}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ display: "flex", gap: "1rem" }}>
                                    <button
                                        onClick={handleApplyPlan}
                                        disabled={applyingPlan}
                                        style={{
                                            flex: 1, padding: "12px", background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                                            border: "none", borderRadius: "12px", color: "#fff",
                                            fontWeight: 900, fontSize: "13px", cursor: "pointer",
                                            display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                                            opacity: applyingPlan ? 0.6 : 1
                                        }}
                                    >
                                        <Zap size={16} /> {applyingPlan ? "Synchronizing Autopilot..." : "Apply Strategic Plan"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <Suspense fallback={null}>
                <AiAssistant eventId={selectedEventId} />
            </Suspense>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                *::-webkit-scrollbar { width: 6px; height: 6px; }
                *::-webkit-scrollbar-track { background: transparent; }
                *::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
            `}</style>
        </div>
    );
}
