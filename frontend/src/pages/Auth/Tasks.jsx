import { useState, useEffect, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { useDialog } from "../../context/DialogContext";
import {
    Plus,
    ListTodo,
    Clock,
    X,
    Edit2,
    Trash2,
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    AlertCircle,
    Calendar,
    Sparkles,
    Flag,
    Layers,
    Check,
    Search,
    Filter,
    UserCheck,
    Tag
} from "lucide-react";
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

const API_URL = import.meta.env.VITE_API_URL;

export default function Tasks() {
    const { user, events, selectedEventId, addNotification, syncTimestamp } = useOutletContext();
    const { showConfirm, showAlert } = useDialog();
    
    // State
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [statusFilter, setStatusFilter] = useState("All");
    const [priorityFilter, setPriorityFilter] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    const [viewMode, setViewMode] = useState("timeline"); // "timeline" | "list"
    
    const [newTask, setNewTask] = useState({
        title: "",
        dueDate: "",
        priority: "Medium",
        eventId: ""
    });

    // Fetch Data
    const fetchData = async (isInitial = false) => {
        if (!user) return;
        if (isInitial) setLoading(true);
        try {
            let url = `${API_URL}/tasks`;
            if (selectedEventId) url += `?eventId=${selectedEventId}`;
            const res = await fetch(url, {
                headers: { "x-user-id": user.uid, "x-user-email": user.email || "" }
            });
            const data = await res.json();
            setTasks(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Fetch tasks error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        fetchData(true); 
    }, [user, selectedEventId]);

    useEffect(() => {
        if (syncTimestamp) {
            fetchData(false);
        }
    }, [syncTimestamp]);

    useEffect(() => {
        if (selectedEventId) {
            setNewTask(prev => ({ ...prev, eventId: selectedEventId }));
        }
    }, [selectedEventId]);

    const activeEvent = useMemo(() => {
        return events.find(e => (e.id || e._id) === selectedEventId) || events[0] || null;
    }, [events, selectedEventId]);

    // Handlers
    const handleCreateTask = async (e) => {
        e.preventDefault();
        if (!newTask.title.trim()) {
            await showAlert("Validation Notice", "Please enter a valid milestone requirement title.");
            return;
        }

        const targetEventId = newTask.eventId || selectedEventId || (events[0]?.id || events[0]?._id);
        if (!targetEventId) {
            await showAlert("Event Required", "Please select an active event context to assign this task.");
            return;
        }

        try {
            const method = editingTask ? "PATCH" : "POST";
            const url = editingTask ? `${API_URL}/tasks/${editingTask._id}` : `${API_URL}/tasks`;
            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: newTask.title.trim(),
                    dueDate: newTask.dueDate,
                    priority: newTask.priority || "Medium",
                    user: user.uid,
                    event: targetEventId
                })
            });

            if (response.ok) {
                setShowModal(false);
                setEditingTask(null);
                setNewTask({ title: "", dueDate: "", priority: "Medium", eventId: selectedEventId });
                fetchData(false);
                addNotification(editingTask ? "Milestone Updated" : "Milestone Created", `The directive '${newTask.title}' is now active.`);
            } else {
                const errData = await response.json();
                await showAlert("Operation Error", errData.message || "Could not save milestone.");
            }
        } catch (err) {
            console.error("Failed to save task:", err);
        }
    };

    const handleEditTask = (task) => {
        setEditingTask(task);
        setNewTask({
            title: task.title,
            dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "",
            priority: task.priority || "Medium",
            eventId: task.event?._id || task.event || selectedEventId || ""
        });
        setShowModal(true);
    };

    const handleDeleteTask = async (taskId) => {
        const confirmed = await showConfirm("Delete Milestone", "Are you sure you want to remove this task from your active workflow?");
        if (!confirmed) return;
        
        // Instant removal from state
        setTasks(prev => prev.filter(t => t._id !== taskId));
        
        try {
            const response = await fetch(`${API_URL}/tasks/${taskId}`, { method: "DELETE" });
            if (response.ok) {
                addNotification("Milestone Terminated", "Task removed from active workflow.");
            }
        } catch (err) {
            console.error("Failed to delete task:", err);
            fetchData(false);
        }
    };

    const toggleStatus = (taskId, currentStatus) => {
        const newStatus = currentStatus === "Completed" ? "Pending" : "Completed";
        
        // INSTANT 0ms local state mutation
        setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));

        // Fire-and-forget sync to backend
        fetch(`${API_URL}/tasks/${taskId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus })
        }).catch(err => {
            console.error("Failed to update status:", err);
            // Rollback on network failure
            setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: currentStatus } : t));
        });
    };

    // Filter & Sorting
    const filteredTasks = useMemo(() => {
        let list = selectedEventId ? tasks.filter(t => String(t.event?._id || t.event) === String(selectedEventId)) : tasks;
        
        if (statusFilter !== "All") {
            list = list.filter(t => (t.status || "Pending") === statusFilter);
        }
        if (priorityFilter !== "All") {
            list = list.filter(t => (t.priority || "Medium") === priorityFilter);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            list = list.filter(t => t.title?.toLowerCase().includes(q));
        }

        return list;
    }, [tasks, selectedEventId, statusFilter, priorityFilter, searchQuery]);

    const paginatedTasks = useMemo(() => {
        return filteredTasks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    }, [filteredTasks, currentPage]);

    const totalPages = Math.ceil(filteredTasks.length / itemsPerPage) || 1;

    const sortedTasks = useMemo(() => {
        return [...filteredTasks].sort((a, b) => {
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate) - new Date(b.dueDate);
        });
    }, [filteredTasks]);

    // Analytics Metrics
    const completedCount = useMemo(() => tasks.filter(t => t.status === "Completed").length, [tasks]);
    const completionRate = useMemo(() => tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0, [completedCount, tasks.length]);
    
    const upcomingDeadlines = useMemo(() => {
        const now = new Date();
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        return tasks.filter(t => {
            if (!t.dueDate || t.status === "Completed") return false;
            const due = new Date(t.dueDate);
            return due >= now && due <= weekFromNow;
        }).length;
    }, [tasks]);

    const overdueCount = useMemo(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        return tasks.filter(t => {
            if (!t.dueDate || t.status === "Completed") return false;
            const due = new Date(t.dueDate);
            return due < now;
        }).length;
    }, [tasks]);

    // Formatting Helpers
    const getContextCode = (eventName) => {
        if (!eventName) return "MAIN";
        const words = eventName.split(" ");
        return words.slice(0, 2).map(w => w.substring(0, 3).toUpperCase()).join("-");
    };

    const formatTimelineDate = (dateStr) => {
        if (!dateStr) return "SCHEDULED";
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
    };

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

    if (loading) {
        return (
            <div className="responsive-container" style={{ paddingBottom: "4rem" }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: "1.25rem", mb: "1.75rem" }}>
                    <Skeleton animation="wave" variant="rounded" height={120} sx={{ borderRadius: '16px', bgcolor: 'rgba(255,255,255,0.05)' }} />
                    <Skeleton animation="wave" variant="rounded" height={120} sx={{ borderRadius: '16px', bgcolor: 'rgba(255,255,255,0.05)' }} />
                    <Skeleton animation="wave" variant="rounded" height={120} sx={{ borderRadius: '16px', bgcolor: 'rgba(255,255,255,0.05)' }} />
                </Box>
                <Skeleton animation="wave" variant="rounded" height={420} sx={{ borderRadius: '16px', bgcolor: 'rgba(255,255,255,0.05)' }} />
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
                            Workflow Milestones
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
                            {activeEvent ? activeEvent.name : "Active Monitoring"}
                        </span>
                    </div>
                </div>

                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                    <button 
                        onClick={() => {
                            setEditingTask(null);
                            setNewTask({ title: "", dueDate: "", priority: "Medium", eventId: selectedEventId || (events[0]?.id || events[0]?._id || "") });
                            setShowModal(true);
                        }} 
                        disabled={events.length === 0}
                        style={{ 
                            background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", 
                            color: "#fff", 
                            border: "none", 
                            padding: "0.6rem 1.35rem", 
                            borderRadius: "10px", 
                            fontWeight: 800, 
                            cursor: events.length === 0 ? "not-allowed" : "pointer", 
                            display: "flex", 
                            alignItems: "center", 
                            gap: "8px", 
                            fontSize: "13px", 
                            height: "40px",
                            boxShadow: "0 4px 14px rgba(249, 115, 22, 0.35)",
                            opacity: events.length === 0 ? 0.5 : 1,
                            transition: "all 0.2s"
                        }}
                    >
                        <Plus size={16} strokeWidth={3} />
                        New Task
                    </button>
                </div>
            </div>

            {/* 3 KPI Cards Grid */}
            <div className="tasks-kpi-grid">
                {/* Completion Rate Card */}
                <div style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "16px",
                    padding: "1.25rem 1.5rem",
                    display: "flex",
                    justify: "space-between",
                    alignItems: "center"
                }}>
                    <div>
                        <div style={{ fontSize: "10px", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
                            COMPLETION RATE
                        </div>
                        <div style={{ fontSize: "24px", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                            {completionRate}%
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, marginTop: "2px" }}>
                            {completedCount} of {tasks.length} milestones secured
                        </div>
                    </div>
                    <div style={{ width: "42px", height: "42px", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="42" height="42" viewBox="0 0 36 36" style={{ transform: "rotate(-90deg)" }}>
                            <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                            <circle 
                                cx="18" cy="18" r="15.5" fill="none" 
                                stroke="#f97316" 
                                strokeWidth="3" 
                                strokeDasharray={`${completionRate} 100`} 
                                strokeLinecap="round" 
                            />
                        </svg>
                    </div>
                </div>

                {/* Upcoming Deadlines Card */}
                <div style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "16px",
                    padding: "1.25rem 1.5rem",
                    display: "flex",
                    justify: "space-between",
                    alignItems: "center"
                }}>
                    <div>
                        <div style={{ fontSize: "10px", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
                            UPCOMING DEADLINES
                        </div>
                        <div style={{ fontSize: "24px", fontWeight: 900, color: "#f97316", letterSpacing: "-0.02em" }}>
                            {String(upcomingDeadlines).padStart(2, '0')}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, marginTop: "2px" }}>
                            Due within next 7 days
                        </div>
                    </div>
                    <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(249, 115, 22, 0.1)", color: "#f97316", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Clock size={20} />
                    </div>
                </div>

                {/* Overdue Tasks Card */}
                <div style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "16px",
                    padding: "1.25rem 1.5rem",
                    display: "flex",
                    justify: "space-between",
                    alignItems: "center"
                }}>
                    <div>
                        <div style={{ fontSize: "10px", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
                            OVERDUE TASKS
                        </div>
                        <div style={{ fontSize: "24px", fontWeight: 900, color: overdueCount > 0 ? "#ef4444" : "var(--text-primary)", letterSpacing: "-0.02em" }}>
                            {String(overdueCount).padStart(2, '0')}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, marginTop: "2px" }}>
                            {overdueCount > 0 ? "Requires immediate attention" : "All deadlines on schedule"}
                        </div>
                    </div>
                    <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: overdueCount > 0 ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)", color: overdueCount > 0 ? "#ef4444" : "#10b981", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <AlertCircle size={20} />
                    </div>
                </div>
            </div>

            {/* Filter Controls & Search Bar Row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "1rem" }}>
                {/* Status Pills */}
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                    {[
                        { id: "All", count: tasks.length },
                        { id: "Pending", count: tasks.filter(t => t.status !== "Completed").length },
                        { id: "Completed", count: tasks.filter(t => t.status === "Completed").length }
                    ].map(status => (
                        <button 
                            key={status.id} 
                            onClick={() => { setStatusFilter(status.id); setCurrentPage(1); }}
                            style={{
                                padding: "0.45rem 0.95rem", 
                                borderRadius: "8px", 
                                fontWeight: 800, 
                                fontSize: "11px", 
                                cursor: "pointer",
                                border: statusFilter === status.id ? "none" : "1px solid var(--border-subtle)",
                                background: statusFilter === status.id ? "var(--accent-primary)" : "rgba(255,255,255,0.03)",
                                color: statusFilter === status.id ? "#fff" : "var(--text-secondary)",
                                display: "flex", 
                                alignItems: "center", 
                                gap: "6px", 
                                transition: "all 0.2s"
                            }}
                        >
                            {status.id}
                            <span style={{ 
                                background: statusFilter === status.id ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.06)", 
                                padding: "1px 6px", 
                                borderRadius: "4px", 
                                fontSize: "10px" 
                            }}>
                                {status.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Right controls: Search + Priority Filter + View Mode Switcher */}
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
                    {/* Search Input */}
                    <div style={{ position: "relative", minWidth: "220px" }}>
                        <Search size={14} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                        <input 
                            placeholder="Search milestone tasks..." 
                            value={searchQuery}
                            onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            style={{ 
                                width: "100%", 
                                background: "rgba(255,255,255,0.03)", 
                                border: "1px solid var(--border-subtle)", 
                                borderRadius: "8px", 
                                padding: "0.45rem 0.75rem 0.45rem 2.25rem", 
                                color: "var(--text-primary)", 
                                outline: "none", 
                                fontSize: "12px",
                                fontWeight: 600 
                            }}
                        />
                    </div>

                    {/* Priority Select Filter */}
                    <div className="custom-select">
                        <select value={priorityFilter} onChange={e => { setPriorityFilter(e.target.value); setCurrentPage(1); }}>
                            <option value="All">All Priorities</option>
                            <option value="High">High Priority</option>
                            <option value="Medium">Medium Priority</option>
                            <option value="Low">Low Priority</option>
                        </select>
                    </div>

                    {/* View Mode Toggle */}
                    <div style={{ display: "flex", background: "rgba(255,255,255,0.03)", padding: "3px", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
                        <button 
                            onClick={() => setViewMode("timeline")}
                            style={{ 
                                padding: "6px 12px", 
                                borderRadius: "7px", 
                                background: viewMode === "timeline" ? "var(--accent-primary)" : "transparent", 
                                color: viewMode === "timeline" ? "#fff" : "var(--text-muted)", 
                                border: "none", 
                                cursor: "pointer", 
                                display: "flex", 
                                alignItems: "center",
                                gap: "6px",
                                fontSize: "12px",
                                fontWeight: 700,
                                transition: "all 0.2s"
                            }}
                        >
                            <Clock size={14} />
                            Timeline
                        </button>

                        <button 
                            onClick={() => setViewMode("list")}
                            style={{ 
                                padding: "6px 12px", 
                                borderRadius: "7px", 
                                background: viewMode === "list" ? "var(--accent-primary)" : "transparent", 
                                color: viewMode === "list" ? "#fff" : "var(--text-muted)", 
                                border: "none", 
                                cursor: "pointer", 
                                display: "flex", 
                                alignItems: "center",
                                gap: "6px",
                                fontSize: "12px",
                                fontWeight: 700,
                                transition: "all 0.2s"
                            }}
                        >
                            <ListTodo size={14} />
                            List View
                        </button>
                    </div>
                </div>
            </div>

            {/* View Mode Content */}
            {viewMode === "timeline" ? (
                /* FULL-WIDTH TIMELINE CHRONOLOGICAL VIEW */
                <div style={{
                    background: "var(--bg-surface)",
                    borderRadius: "20px",
                    border: "1px solid var(--border-subtle)",
                    padding: "2rem 2.25rem",
                    width: "100%",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.1)"
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "1rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "rgba(249, 115, 22, 0.12)", color: "#f97316", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Clock size={20} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h2 style={{ fontSize: "18px", fontWeight: 900, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.02em" }}>
                                    Chronological Milestone Stream
                                </h2>
                                <span style={{ color: "var(--text-secondary)", fontSize: "12px", fontWeight: 500 }}>
                                    Displaying <strong style={{ color: "var(--text-primary)" }}>{sortedTasks.length} milestone requirements</strong> for tactical execution.
                                </span>
                            </div>
                        </div>

                        <span style={{ fontSize: "11px", fontWeight: 800, color: "#f97316", background: "rgba(249, 115, 22, 0.1)", padding: "0.3rem 0.75rem", borderRadius: "20px", border: "1px solid rgba(249, 115, 22, 0.2)" }}>
                            LIVE STREAM VIEW
                        </span>
                    </div>

                    {sortedTasks.length === 0 ? (
                        <div style={{ padding: "4rem 2rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                            <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "rgba(249, 115, 22, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#f97316", marginBottom: "1rem" }}>
                                <Calendar size={26} />
                            </div>
                            <h3 style={{ fontSize: "16px", fontWeight: 800, margin: "0 0 0.4rem", color: "var(--text-primary)" }}>No Scheduled Milestones</h3>
                            <p style={{ color: "var(--text-muted)", fontSize: "12px", maxWidth: "340px", margin: "0 0 1.5rem", lineHeight: 1.5 }}>
                                {searchQuery ? `No milestone task matching "${searchQuery}".` : "Create your first milestone task to populate the full-width timeline stream."}
                            </p>
                            <button 
                                onClick={() => {
                                    setEditingTask(null);
                                    setNewTask({ title: "", dueDate: "", priority: "Medium", eventId: selectedEventId || (events[0]?.id || events[0]?._id || "") });
                                    setShowModal(true);
                                }}
                                style={{ background: "var(--accent-primary)", color: "#fff", border: "none", padding: "0.6rem 1.35rem", borderRadius: "10px", fontWeight: 800, fontSize: "12px", cursor: "pointer" }}
                            >
                                + Define First Milestone Task
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", position: "relative", marginTop: "1rem" }}>
                            {/* Vertical Line track */}
                            <div style={{ position: "absolute", left: "155px", top: "20px", bottom: "20px", width: "3px", background: "linear-gradient(180deg, rgba(249, 115, 22, 0.6) 0%, rgba(249, 115, 22, 0.12) 100%)", borderRadius: "2px" }}></div>

                            {sortedTasks.map((task) => {
                                const eventName = events.find(e => (e.id || e._id) === (task.event?._id || task.event))?.name;
                                const isCompleted = task.status === "Completed";
                                const priorityColor = task.priority === "High" ? "#ef4444" : task.priority === "Medium" ? "#f97316" : "#64748b";

                                return (
                                    <div key={task._id} style={{ position: "relative", display: "flex", alignItems: "flex-start", width: "100%" }}>
                                        {/* Date Tag Left Column */}
                                        <div style={{ width: "135px", flexShrink: 0, textAlign: "right", paddingRight: "24px", paddingTop: "14px" }}>
                                            <div style={{ fontSize: "11px", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "0.05em", fontFamily: "'JetBrains Mono', monospace" }}>
                                                {formatTimelineDate(task.dueDate)}
                                            </div>
                                            <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 600, marginTop: "2px" }}>
                                                {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { weekday: 'short' }) : "Floating"}
                                            </div>
                                        </div>

                                        {/* Timeline Node Ring Marker */}
                                        <div 
                                            onClick={() => toggleStatus(task._id, task.status)}
                                            title="Click to toggle milestone status"
                                            style={{ 
                                                position: "absolute", 
                                                left: "147px", 
                                                top: "14px", 
                                                width: "18px", 
                                                height: "18px", 
                                                borderRadius: "50%", 
                                                background: isCompleted ? "#10b981" : "#f97316", 
                                                border: "3px solid var(--bg-surface)", 
                                                boxShadow: isCompleted ? "0 0 12px rgba(16, 185, 129, 0.7)" : "0 0 14px rgba(249, 115, 22, 0.8)", 
                                                zIndex: 2,
                                                cursor: "pointer",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                transition: "all 0.2s"
                                            }}
                                        >
                                            {isCompleted && <Check size={10} color="#fff" strokeWidth={4} />}
                                        </div>

                                        {/* Full Width Card Content Box */}
                                        <div style={{ paddingLeft: "42px", flex: 1 }}>
                                            <div style={{
                                                background: "rgba(255,255,255,0.02)",
                                                border: "1px solid var(--border-subtle)",
                                                borderRadius: "16px",
                                                padding: "1.25rem 1.5rem",
                                                display: "flex",
                                                justify: "space-between",
                                                alignItems: "center",
                                                flexWrap: "wrap",
                                                gap: "1rem",
                                                transition: "all 0.2s ease"
                                            }}>
                                                <div style={{ flex: 1, minWidth: "260px" }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "6px" }}>
                                                        <h3 
                                                            onClick={() => handleEditTask(task)}
                                                            style={{ 
                                                                fontSize: "15px", 
                                                                fontWeight: 800, 
                                                                color: isCompleted ? "var(--text-muted)" : "var(--text-primary)",
                                                                margin: 0,
                                                                cursor: "pointer",
                                                                textDecoration: isCompleted ? "line-through" : "none"
                                                            }}
                                                        >
                                                            {task.title}
                                                        </h3>

                                                        <span style={{
                                                            background: `${priorityColor}15`,
                                                            color: priorityColor,
                                                            border: `1px solid ${priorityColor}33`,
                                                            padding: "0.2rem 0.6rem",
                                                            borderRadius: "20px",
                                                            fontSize: "10px",
                                                            fontWeight: 900,
                                                            textTransform: "uppercase"
                                                        }}>
                                                            {task.priority || "Medium"} Priority
                                                        </span>

                                                        <span style={{
                                                            background: "rgba(255,255,255,0.04)", 
                                                            border: "1px solid var(--border-subtle)", 
                                                            padding: "0.2rem 0.65rem",
                                                            borderRadius: "6px", 
                                                            fontSize: "10px", 
                                                            fontWeight: 900, 
                                                            color: "var(--text-secondary)",
                                                            textTransform: "uppercase", 
                                                            letterSpacing: "0.05em"
                                                        }}>
                                                            {getContextCode(eventName)}
                                                        </span>
                                                    </div>

                                                    <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginTop: "8px", flexWrap: "wrap" }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                            <div style={{ display: "flex" }}>
                                                                {['1','2','3'].map((n, idx) => (
                                                                    <div key={n} style={{ 
                                                                        width: "24px", 
                                                                        height: "24px", 
                                                                        borderRadius: "50%",
                                                                        background: `url('https://api.dicebear.com/7.x/avataaars/svg?seed=${task._id}${n}&backgroundColor=ffdfbf') center/cover`,
                                                                        marginLeft: idx === 0 ? "0" : "-6px",
                                                                        border: "2px solid var(--bg-surface)"
                                                                    }}></div>
                                                                ))}
                                                            </div>
                                                            <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>Assigned Operations</span>
                                                        </div>

                                                        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>
                                                            <Calendar size={13} />
                                                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "No Date"}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Action controls */}
                                                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                                    <button 
                                                        onClick={() => toggleStatus(task._id, task.status)}
                                                        style={{
                                                            background: isCompleted ? "rgba(16, 185, 129, 0.1)" : "rgba(255,255,255,0.04)",
                                                            border: isCompleted ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid var(--border-subtle)",
                                                            color: isCompleted ? "#10b981" : "var(--text-secondary)",
                                                            padding: "0.45rem 0.85rem",
                                                            borderRadius: "8px",
                                                            fontSize: "11px",
                                                            fontWeight: 800,
                                                            cursor: "pointer",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: "6px",
                                                            transition: "all 0.2s"
                                                        }}
                                                    >
                                                        <Check size={13} />
                                                        {isCompleted ? "Secured" : "Complete"}
                                                    </button>

                                                    <button 
                                                        onClick={() => handleEditTask(task)} 
                                                        title="Edit Milestone"
                                                        style={{ background: "rgba(255, 255, 255, 0.04)", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)", padding: "0.45rem", borderRadius: "8px", cursor: "pointer" }}
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>

                                                    <button 
                                                        onClick={() => handleDeleteTask(task._id)} 
                                                        title="Remove Milestone"
                                                        style={{ background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)", color: "#ef4444", padding: "0.45rem", borderRadius: "8px", cursor: "pointer" }}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            ) : (
                /* TABULAR LIST VIEW */
                <div style={{ background: "var(--bg-surface)", borderRadius: "20px", border: "1px solid var(--border-subtle)", overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}>
                    {filteredTasks.length === 0 ? (
                        <div style={{ padding: "4rem 2rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                            <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "rgba(249, 115, 22, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#f97316", marginBottom: "1rem" }}>
                                <ListTodo size={26} />
                            </div>
                            <h3 style={{ fontSize: "16px", fontWeight: 800, margin: "0 0 0.4rem", color: "var(--text-primary)" }}>No Active Milestones</h3>
                            <p style={{ color: "var(--text-muted)", fontSize: "12px", maxWidth: "340px", margin: "0 0 1.5rem" }}>No milestone tasks matching status or search filters.</p>
                        </div>
                    ) : (
                        <>
                            <div style={{ width: "100%", overflowX: "auto" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead>
                                        <tr style={{ background: "rgba(255,255,255,0.01)", borderBottom: "1px solid var(--border-subtle)" }}>
                                            <th style={{ padding: "0.85rem 1rem 0.85rem 1.5rem", width: "40px" }}></th>
                                            <th style={{ textAlign: "left", padding: "0.85rem 1.5rem", fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>REQUIREMENT</th>
                                            <th style={{ textAlign: "left", padding: "0.85rem 1.5rem", fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>CONTEXT</th>
                                            <th style={{ textAlign: "left", padding: "0.85rem 1.5rem", fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>DEADLINE</th>
                                            <th style={{ textAlign: "left", padding: "0.85rem 1.5rem", fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>PRIORITY</th>
                                            <th style={{ textAlign: "right", padding: "0.85rem 1.5rem", fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>ACTIONS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedTasks.map(task => {
                                            const eventName = events.find(e => (e.id || e._id) === (task.event?._id || task.event))?.name;
                                            const isCompleted = task.status === "Completed";
                                            const priorityColor = task.priority === "High" ? "#ef4444" : task.priority === "Medium" ? "#f97316" : "#64748b";
                                            
                                            return (
                                                <tr key={task._id} className="event-row" style={{ borderBottom: "1px solid var(--border-subtle)", transition: "all 0.2s" }}>
                                                    <td style={{ padding: "1rem 0 1rem 1.5rem" }}>
                                                        <div 
                                                            onClick={() => toggleStatus(task._id, task.status)}
                                                            style={{
                                                                width: "20px", height: "20px", borderRadius: "6px", cursor: "pointer",
                                                                border: isCompleted ? "none" : "2px solid var(--border-medium)",
                                                                background: isCompleted ? "#10b981" : "transparent",
                                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                                transition: "all 0.2s"
                                                            }}
                                                        >
                                                            {isCompleted && <Check size={14} color="#fff" strokeWidth={3} />}
                                                        </div>
                                                    </td>

                                                    <td style={{ padding: "1rem 1.5rem" }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: priorityColor, boxShadow: `0 0 8px ${priorityColor}66` }}></div>
                                                            <span style={{
                                                                fontWeight: 800, fontSize: "14px",
                                                                color: isCompleted ? "var(--text-muted)" : "var(--text-primary)",
                                                                textDecoration: isCompleted ? "line-through" : "none"
                                                            }}>
                                                                {task.title}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    <td style={{ padding: "1rem 1.5rem" }}>
                                                        <span style={{
                                                            background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-subtle)", padding: "0.25rem 0.65rem",
                                                            borderRadius: "6px", fontSize: "10px", fontWeight: 900, color: "var(--text-secondary)",
                                                            textTransform: "uppercase", letterSpacing: "0.05em"
                                                        }}>
                                                            {getContextCode(eventName)}
                                                        </span>
                                                    </td>

                                                    <td style={{ padding: "1rem 1.5rem" }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 700, color: isCompleted ? "var(--text-muted)" : "var(--text-secondary)" }}>
                                                            <Clock size={13} />
                                                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "No deadline"}
                                                        </div>
                                                    </td>

                                                    <td style={{ padding: "1rem 1.5rem" }}>
                                                        <span style={{
                                                            background: `${priorityColor}15`,
                                                            color: priorityColor,
                                                            border: `1px solid ${priorityColor}33`,
                                                            padding: "0.25rem 0.65rem",
                                                            borderRadius: "20px",
                                                            fontSize: "10px",
                                                            fontWeight: 900,
                                                            textTransform: "uppercase"
                                                        }}>
                                                            {task.priority || "Medium"}
                                                        </span>
                                                    </td>

                                                    <td style={{ padding: "1rem 1.5rem", textAlign: "right" }}>
                                                        <div style={{ display: "flex", gap: "0.4rem", justifyContent: "flex-end" }}>
                                                            <button 
                                                                onClick={() => handleEditTask(task)} 
                                                                title="Edit Task"
                                                                style={{ background: "rgba(255, 255, 255, 0.04)", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)", padding: "0.45rem", borderRadius: "8px", cursor: "pointer" }}
                                                            >
                                                                <Edit2 size={14} />
                                                            </button>

                                                            <button 
                                                                onClick={() => handleDeleteTask(task._id)} 
                                                                title="Remove Task"
                                                                style={{ background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)", color: "#ef4444", padding: "0.45rem", borderRadius: "8px", cursor: "pointer" }}
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
                            </div>

                            {/* Pagination Row */}
                            <div style={{ padding: "1rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--text-secondary)", fontSize: "12px", borderTop: "1px solid var(--border-subtle)" }}>
                                <span>Showing <strong>{paginatedTasks.length}</strong> of <strong>{filteredTasks.length}</strong> requirements</span>
                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                    <button 
                                        disabled={currentPage === 1} 
                                        onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} 
                                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "0.4rem 0.6rem", color: "var(--text-primary)", cursor: currentPage === 1 ? "default" : "pointer", opacity: currentPage === 1 ? 0.3 : 1 }}
                                    >
                                        <ChevronLeft size={16} />
                                    </button>

                                    <button 
                                        disabled={currentPage >= totalPages} 
                                        onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} 
                                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "0.4rem 0.6rem", color: "var(--text-primary)", cursor: currentPage >= totalPages ? "default" : "pointer", opacity: currentPage >= totalPages ? 0.3 : 1 }}
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Add / Edit Task Modal */}
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
                        maxWidth: "460px",
                        padding: "2rem",
                        borderRadius: "20px",
                        border: "1px solid var(--border-medium)",
                        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
                        position: "relative"
                    }}>
                        <button 
                            onClick={() => { setShowModal(false); setEditingTask(null); }} 
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
                                <ListTodo size={22} strokeWidth={2.5} />
                            </div>
                            <h2 style={{ fontSize: "1.35rem", fontWeight: 900, letterSpacing: "-0.02em", margin: "0 0 0.25rem", color: "var(--text-primary)" }}>
                                {editingTask ? "Edit Milestone Task" : "Define Milestone Task"}
                            </h2>
                            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", fontWeight: 500, margin: 0 }}>
                                Schedule operational directive for chronological execution.
                            </p>
                        </div>

                        <form onSubmit={handleCreateTask} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <div>
                                <label style={labelStyle}>Milestone Title / Directive</label>
                                <input 
                                    placeholder="e.g. Confirm catering menu / Finalize stage light setup" 
                                    style={inputStyle} 
                                    value={newTask.title} 
                                    onChange={e => setNewTask({ ...newTask, title: e.target.value })} 
                                    required 
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>Event Context</label>
                                <select 
                                    style={inputStyle} 
                                    value={newTask.eventId} 
                                    onChange={e => setNewTask({ ...newTask, eventId: e.target.value })}
                                    required
                                >
                                    <option value="">Select Event Context</option>
                                    {events.map(event => (
                                        <option key={event.id || event._id} value={event.id || event._id}>
                                            {event.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                <div>
                                    <label style={labelStyle}>Target Due Date</label>
                                    <input 
                                        type="date" 
                                        style={inputStyle} 
                                        value={newTask.dueDate} 
                                        onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })} 
                                        required 
                                    />
                                </div>

                                <div>
                                    <label style={labelStyle}>Priority Level</label>
                                    <select 
                                        style={inputStyle} 
                                        value={newTask.priority} 
                                        onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                                    >
                                        <option value="Low">Low Priority</option>
                                        <option value="Medium">Medium Priority</option>
                                        <option value="High">High Priority</option>
                                    </select>
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
                                {editingTask ? "Update Milestone Directive" : "Create Milestone Directive"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
