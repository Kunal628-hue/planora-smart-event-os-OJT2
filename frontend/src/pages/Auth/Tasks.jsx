import { useState, useEffect, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { useDialog } from "../../context/DialogContext";
import { Plus, ListTodo, Clock, X, Edit2, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

const API_URL = import.meta.env.VITE_API_URL;

export default function Tasks() {
    const { user, events, selectedEventId, addNotification } = useOutletContext();
    const { showConfirm } = useDialog();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [statusFilter, setStatusFilter] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const [viewMode, setViewMode] = useState("list");
    const [newTask, setNewTask] = useState({
        title: "",
        dueDate: "",
        priority: "Medium",
        eventId: ""
    });

    const fetchData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            let url = `${API_URL}/tasks?user=${user.uid}&email=${user.email}`;
            if (selectedEventId) url += `&eventId=${selectedEventId}`;
            const res = await fetch(url);
            const data = await res.json();
            setTasks(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [user, selectedEventId]);

    useEffect(() => {
        if (selectedEventId) {
            setNewTask(prev => ({ ...prev, eventId: selectedEventId }));
        }
    }, [selectedEventId]);

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            const method = editingTask ? "PATCH" : "POST";
            const url = editingTask ? `${API_URL}/tasks/${editingTask._id}` : `${API_URL}/tasks`;
            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: newTask.title,
                    dueDate: newTask.dueDate,
                    priority: newTask.priority,
                    user: user.uid,
                    event: newTask.eventId
                })
            });
            if (response.ok) {
                setShowModal(false);
                setEditingTask(null);
                setNewTask({ title: "", dueDate: "", priority: "Medium", eventId: selectedEventId });
                fetchData();
                addNotification(editingTask ? "Milestone Updated" : "Milestone Created", `The directive '${newTask.title}' is now active.`);
            }
        } catch (err) {
            console.error("Failed to save task:", err);
        }
    };

    const handleEditTask = (task) => {
        setEditingTask(task);
        setNewTask({
            title: task.title,
            dueDate: task.dueDate ? task.dueDate.split('T')[0] : "",
            priority: task.priority || "Medium",
            eventId: task.event?._id || task.event || ""
        });
        setShowModal(true);
    };

    const handleDeleteTask = async (taskId) => {
        const confirmed = await showConfirm("Delete Milestone", "Are you sure you want to remove this task from your active workflow?");
        if (!confirmed) return;
        try {
            const response = await fetch(`${API_URL}/tasks/${taskId}`, { method: "DELETE" });
            if (response.ok) {
                setTasks(tasks.filter(t => t._id !== taskId));
                addNotification("Milestone Terminated", "Task has been removed from your active workflow.");
            }
        } catch (err) {
            console.error("Failed to delete task:", err);
        }
    };

    const toggleStatus = async (taskId, currentStatus) => {
        const newStatus = currentStatus === "Completed" ? "Pending" : "Completed";
        try {
            const response = await fetch(`${API_URL}/tasks/${taskId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            });
            if (response.ok) {
                setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
                if (newStatus === "Completed") {
                    addNotification("Objective Secured", "Target milestone has been marked as completed.");
                }
            }
        } catch (err) {
            console.error("Failed to update status:", err);
        }
    };

    const filteredTasks = useMemo(() => {
        let list = selectedEventId ? tasks.filter(t => (t.event?._id || t.event) === selectedEventId) : tasks;
        if (statusFilter !== "All") list = list.filter(t => (t.status || "Pending") === statusFilter);
        return list;
    }, [tasks, selectedEventId, statusFilter]);

    const paginatedTasks = filteredTasks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);

    // Analytics
    const completedCount = useMemo(() => tasks.filter(t => t.status === "Completed").length, [tasks]);
    const completionRate = useMemo(() => tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0, [completedCount, tasks.length]);
    const upcomingDeadlines = useMemo(() => {
        const now = new Date();
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        return tasks.filter(t => {
            const due = new Date(t.dueDate);
            return due >= now && due <= weekFromNow && t.status !== "Completed";
        }).length;
    }, [tasks]);
    const past24h = useMemo(() => {
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        return tasks.filter(t => new Date(t.dueDate) < now && new Date(t.dueDate) >= yesterday && t.status !== "Completed").length;
    }, [tasks]);

    const getContextCode = (eventName) => {
        if (!eventName) return "EXT";
        const words = eventName.split(" ");
        return words.slice(0, 2).map(w => w.substring(0, 3).toUpperCase()).join("-");
    };

    const thStyle = { padding: "1.25rem 1.5rem", color: "#64748b", fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", textAlign: "left" };
    const tdStyle = { padding: "1.25rem 1.5rem" };
    const inputStyle = { width: "100%", padding: "0.85rem 1rem", borderRadius: "10px", background: "#1a1a1a", border: "1px solid #222", color: "#fff", outline: "none", fontSize: "14px", fontWeight: 600 };

    return (
        <div style={{
            padding: "1.25rem 1.5rem",
            color: "#fff",
            fontFamily: "'Inter', sans-serif",
            maxWidth: "1400px",
            margin: "0 auto",
            minHeight: "100vh",
            backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px)",
            backgroundSize: "32px 32px"
        }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", paddingBottom: "1.25rem", borderBottom: "1px solid #1a1a1a" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
                    <h1 style={{ fontSize: "1.35rem", fontWeight: 900, margin: 0, letterSpacing: "-0.03em" }}>Workflow Milestones</h1>
                    <div style={{ display: "flex", gap: "8px", background: "rgba(255,255,255,0.03)", padding: "4px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <div style={{ padding: "6px 12px", borderRadius: "6px", background: "rgba(259, 115, 22, 0.1)", color: "#f97316", fontSize: "10px", fontWeight: 800, textTransform: "uppercase" }}>Active Monitoring</div>
                    </div>
                </div>
                <button onClick={() => setShowModal(true)} disabled={events.length === 0}
                    style={{ background: "#f97316", color: "#fff", border: "none", padding: "0.5rem 1rem", borderRadius: "8px", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "12px", height: "36px", opacity: events.length === 0 ? 0.5 : 1 }}>
                    <Plus size={14} strokeWidth={4} />
                    New Task
                </button>
            </div>

            {/* Quick Stats Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem", marginBottom: "1.5rem" }}>
                <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: "12px", padding: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <div style={{ fontSize: "10px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Completion Rate</div>
                        <div style={{ fontSize: "20px", fontWeight: 900, color: "#fff" }}>{completionRate}%</div>
                    </div>
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", border: "2px solid #222", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="24" height="24" viewBox="0 0 36 36" style={{ transform: "rotate(-90 18 18)" }}>
                            <circle cx="18" cy="18" r="16" fill="none" stroke="#f97316" strokeWidth="4" strokeDasharray={`${completionRate} 100`} strokeLinecap="round" />
                        </svg>
                    </div>
                </div>
                <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: "12px", padding: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <div style={{ fontSize: "10px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Upcoming Deadlines</div>
                        <div style={{ fontSize: "20px", fontWeight: 900, color: "#f97316" }}>{String(upcomingDeadlines).padStart(2, '0')}</div>
                    </div>
                    <Clock size={18} style={{ color: "#64748b" }} />
                </div>
                <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: "12px", padding: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <div style={{ fontSize: "10px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Overdue Tasks</div>
                        <div style={{ fontSize: "20px", fontWeight: 900, color: "#ef4444" }}>{String(past24h).padStart(2, '0')}</div>
                    </div>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444" }}></div>
                </div>
            </div>

            {/* Status Filter Pills & View Toggle */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    {[
                        { id: "All", count: tasks.length },
                        { id: "Pending", count: tasks.filter(t => t.status !== "Completed").length },
                        { id: "Completed", count: completedCount }
                    ].map(status => (
                        <button key={status.id} onClick={() => { setStatusFilter(status.id); setCurrentPage(1); }}
                            style={{
                                padding: "0.4rem 0.85rem", borderRadius: "8px", fontWeight: 800, fontSize: "11px", cursor: "pointer",
                                border: statusFilter === status.id ? "none" : "1px solid #1a1a1a",
                                background: statusFilter === status.id ? "#f97316" : "rgba(255,255,255,0.02)",
                                color: statusFilter === status.id ? "#fff" : "#64748b",
                                display: "flex", alignItems: "center", gap: "6px", transition: "all 0.2s"
                            }}>
                            {status.id}
                            <span style={{ 
                                background: statusFilter === status.id ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.05)", 
                                padding: "1px 6px", borderRadius: "4px", fontSize: "10px" 
                            }}>{status.count}</span>
                        </button>
                    ))}
                </div>
                <div style={{ display: "flex", background: "rgba(255,255,255,0.02)", padding: "4px", borderRadius: "8px", border: "1px solid #1a1a1a" }}>
                    <button 
                        onClick={() => setViewMode("list")}
                        style={{ padding: "4px 8px", borderRadius: "6px", background: viewMode === "list" ? "rgba(259, 115, 22, 0.1)" : "transparent", color: viewMode === "list" ? "#f97316" : "#64748b", border: "none", cursor: "pointer" }}
                    >
                        <ListTodo size={14} />
                    </button>
                    <button 
                        onClick={() => { setViewMode("kanban"); addNotification("Interface Locked", "Kanban visualization is currently in synchronized development."); }}
                        style={{ padding: "4px 8px", borderRadius: "6px", background: viewMode === "kanban" ? "rgba(259, 115, 22, 0.1)" : "transparent", color: viewMode === "kanban" ? "#f97316" : "#64748b", border: "none", cursor: "pointer" }}
                    >
                        <Box sx={{ width: 14, height: 14, border: "2px solid currentColor", borderRadius: "3px" }} />
                    </button>
                </div>
            </div>

            {/* Table */}
            <div style={{ background: "#111", borderRadius: "20px", border: "1px solid #1a1a1a", overflow: "hidden" }}>
                {loading ? (
                    <Box sx={{ padding: '2rem' }}>
                        {Array.from(new Array(4)).map((_, i) => (
                            <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 3 }}>
                                <Skeleton animation="wave" variant="rounded" width={24} height={24} sx={{ borderRadius: '6px', bgcolor: '#1a1a1a' }} />
                                <Skeleton animation="wave" height={20} width="25%" sx={{ bgcolor: '#1a1a1a' }} />
                                <Skeleton animation="wave" height={20} width="12%" sx={{ bgcolor: '#1a1a1a' }} />
                                <Skeleton animation="wave" height={20} width="15%" sx={{ bgcolor: '#1a1a1a' }} />
                                <Skeleton animation="wave" height={20} width="10%" sx={{ bgcolor: '#1a1a1a' }} />
                            </Box>
                        ))}
                    </Box>
                ) : filteredTasks.length === 0 ? (
                    <div style={{ padding: "3rem 1.5rem", textAlign: "center", minHeight: "280px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(255,255,255,0.02)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem" }}>
                            <ListTodo size={24} style={{ color: "#333" }} />
                        </div>
                        <h3 style={{ fontSize: "1rem", fontWeight: 900, margin: "0 0 0.5rem", color: "#fff" }}>No Active Milestones</h3>
                        <p style={{ color: "#64748b", fontSize: "13px", maxWidth: "300px", margin: "0 auto", lineHeight: 1.5 }}>
                            {events.length === 0 ? "Onboard your first event context to begin tactical operations." : "Initialize your first chronological requirement."}
                        </p>
                    </div>
                ) : (
                    <>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ borderBottom: "1px solid #1a1a1a" }}>
                                    <th style={{ ...thStyle, width: "40px", padding: "1.25rem 0 1.25rem 1.5rem" }}></th>
                                    <th style={thStyle}>REQUIREMENT</th>
                                    <th style={thStyle}>CONTEXT</th>
                                    <th style={thStyle}>DEADLINE</th>
                                    <th style={thStyle}>PRIORITY</th>
                                    <th style={{ ...thStyle, textAlign: "right" }}>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedTasks.map(task => {
                                    const eventName = events.find(e => (e.id || e._id) === (task.event?._id || task.event))?.name;
                                    const isCompleted = task.status === "Completed";
                                    const priorityColor = task.priority === "High" ? "#ef4444" : task.priority === "Medium" ? "#f97316" : "#64748b";
                                    
                                    return (
                                        <tr key={task._id} className="task-row" style={{ borderBottom: "1px solid #1a1a1a", cursor: "pointer", transition: "all 0.2s" }}>
                                            <td style={{ padding: "0.75rem 0 0.75rem 1.5rem" }}>
                                                <div onClick={() => toggleStatus(task._id, task.status)}
                                                    style={{
                                                        width: "18px", height: "18px", borderRadius: "5px", cursor: "pointer",
                                                        border: isCompleted ? "none" : "2px solid #333",
                                                        background: isCompleted ? "#3b82f6" : "transparent",
                                                        display: "flex", alignItems: "center", justifyContent: "center",
                                                        transition: "all 0.2s"
                                                    }}>
                                                    {isCompleted && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><polyline points="20 6 9 17 4 12" /></svg>}
                                                </div>
                                            </td>
                                            <td style={{ padding: "0.75rem 1.5rem" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: priorityColor, boxShadow: `0 0 8px ${priorityColor}44` }}></div>
                                                    <span style={{
                                                        fontWeight: 800, fontSize: "13px",
                                                        color: isCompleted ? "#4a5568" : "#fff",
                                                        textDecoration: isCompleted ? "line-through" : "none"
                                                    }}>{task.title}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: "0.75rem 1.5rem" }}>
                                                <span style={{
                                                    background: "rgba(255,255,255,0.02)", border: "1px solid #1a1a1a", padding: "2px 8px",
                                                    borderRadius: "4px", fontSize: "10px", fontWeight: 900, color: "#64748b",
                                                    textTransform: "uppercase", letterSpacing: "0.05em"
                                                }}>
                                                    {getContextCode(eventName)}
                                                </span>
                                            </td>
                                            <td style={{ padding: "0.75rem 1.5rem" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: 700, color: isCompleted ? "#4a5568" : "#94a3b8", background: "rgba(255,255,255,0.02)", padding: "2px 8px", borderRadius: "4px", width: "fit-content" }}>
                                                    <Clock size={12} />
                                                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "—"}
                                                </div>
                                            </td>
                                            <td style={{ padding: "0.75rem 1.5rem" }}>
                                                <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "rgba(249, 115, 22, 0.1)", border: "1px solid rgba(249, 115, 22, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#f97316", fontSize: "10px", fontWeight: 900 }}>
                                                    {user.email[0].toUpperCase()}
                                                </div>
                                            </td>
                                            <td style={{ padding: "0.75rem 1.5rem", textAlign: "right" }}>
                                                <div style={{ display: "flex", gap: "0.25rem", justifyContent: "flex-end" }}>
                                                    <button onClick={() => handleEditTask(task)} style={{ background: "transparent", border: "none", color: "#4a5568", padding: "4px", borderRadius: "4px", cursor: "pointer" }}>
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button onClick={() => handleDeleteTask(task._id)} style={{ background: "transparent", border: "none", color: "#ef4444", padding: "4px", borderRadius: "4px", cursor: "pointer", opacity: 0.6 }}>
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        <div style={{ padding: "1.25rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", color: "#64748b", fontSize: "0.85rem", borderTop: "1px solid #1a1a1a" }}>
                            <span>Showing <strong>{paginatedTasks.length}</strong> of <strong>{filteredTasks.length}</strong> operational requirements</span>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="t-p-btn"><ChevronLeft size={18} /></button>
                                <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)} className="t-p-btn"><ChevronRight size={18} /></button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <style>{`
                .t-p-btn { background: #111; border: 1px solid #1a1a1a; border-radius: 8px; padding: 0.5rem; cursor: pointer; color: #fff; }
                .t-p-btn:disabled { opacity: 0.3; cursor: default; }
                .task-row:hover { background: rgba(255,255,255,0.02) !important; }
                select option { background: #0c0c0c; color: #fff; }
            `}</style>

            {/* Modal */}
            {showModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, backdropFilter: "blur(10px)" }}>
                    <div style={{ background: "#0c0c0c", width: "100%", maxWidth: "520px", padding: "2.5rem", borderRadius: "24px", border: "1px solid #1a1a1a" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2rem" }}>
                            <h2 style={{ fontSize: "1.5rem", fontWeight: 800 }}>{editingTask ? "Edit Milestone" : "Define Milestone"}</h2>
                            <button onClick={() => { setShowModal(false); setEditingTask(null); setNewTask({ title: "", dueDate: "", priority: "Medium", eventId: selectedEventId }); }}
                                style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleCreateTask} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                            <input style={inputStyle} placeholder="Milestone Title" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} required />
                            <select style={inputStyle} value={newTask.eventId} onChange={e => setNewTask({ ...newTask, eventId: e.target.value })} required>
                                <option value="">Select Event Context</option>
                                {events.map(event => <option key={event.id || event._id} value={event.id || event._id}>{event.name}</option>)}
                            </select>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                <input type="date" style={inputStyle} value={newTask.dueDate} onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })} required />
                                <select style={inputStyle} value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value })}>
                                    <option>Low</option><option>Medium</option><option>High</option>
                                </select>
                            </div>
                            <button type="submit" style={{ background: "#f97316", color: "#fff", padding: "1rem", borderRadius: "12px", fontWeight: 700, border: "none", cursor: "pointer", marginTop: "0.5rem" }}>
                                {editingTask ? "Update Milestone" : "Create Milestone"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .t-p-btn { background: #111; border: 1px solid #1a1a1a; border-radius: 8px; padding: 0.5rem; cursor: pointer; color: #fff; }
                .t-p-btn:disabled { opacity: 0.3; cursor: default; }
                .t-card { background: #111; border-radius: 20px; border: 1px solid #1a1a1a; padding: 1.15rem; }
                select option { background: #0c0c0c; color: #fff; }
            `}</style>
        </div>
    );
}
