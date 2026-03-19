import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { animate, stagger } from "animejs";
import { Plus, ListTodo, Calendar, Clock, AlertCircle, Loader2, X } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export default function Tasks() {
    const { user, events, selectedEventId } = useOutletContext();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
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
            let url = `${API_URL}/tasks?user=${user.uid}`;
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

    useEffect(() => {
        fetchData();
    }, [user, selectedEventId]);

    useEffect(() => {
        if (selectedEventId) {
            setNewTask(prev => ({ ...prev, eventId: selectedEventId }));
        }
    }, [selectedEventId]);

    useEffect(() => {
        if (!loading && tasks.length > 0) {
            animate('.task-row', {
                translateX: [-20, 0],
                opacity: [0, 1],
                delay: stagger(50),
                easing: 'easeOutExpo',
                duration: 600
            });
        }
    }, [loading, tasks.length]);

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/tasks`, {
                method: "POST",
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
                setNewTask({
                    title: "",
                    dueDate: "",
                    priority: "Medium",
                    eventId: selectedEventId
                });
                fetchData();
            }
        } catch (err) {
            console.error("Failed to add task:", err);
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
            }
        } catch (err) {
            console.error("Failed to update status:", err);
        }
    };

    const filteredTasks = selectedEventId
        ? tasks.filter(t => (t.event?._id || t.event) === selectedEventId)
        : tasks;

    return (
        <div style={{
            fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
            padding: "2.5rem",
            background: "#fcfdff",
            minHeight: "100vh",
            color: "#0f172a"
        }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "3.5rem" }}>
                <div>
                    <h1 style={{ fontSize: "2.75rem", fontWeight: 800, letterSpacing: "-0.04em", margin: "0 0 0.5rem" }}>
                        Workflow <span style={{ color: "#2563eb" }}>Milestones</span>
                    </h1>
                    <p style={{ color: "#64748b", fontSize: "1.1rem", fontWeight: 500, margin: 0 }}>
                        Organize your chronological operations across all active event contexts.
                    </p>
                </div>
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
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 10px 25px rgba(37, 99, 235, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 8px 20px rgba(37, 99, 235, 0.2)";
                    }}
                >
                    <Plus size={20} strokeWidth={3} />
                    <span>New Task</span>
                </button>
            </div>

            {loading ? (
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "10rem 0", gap: "1.5rem" }}>
                    <div style={{ width: "48px", height: "48px", border: "5px solid #2563eb", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                    <p style={{ fontSize: "0.9rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>Optimizing Flows...</p>
                </div>
            ) : filteredTasks.length === 0 ? (
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
                            <ListTodo size={48} strokeWidth={2.5} />
                        </div>
                    </div>
                    <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "#0f172a", margin: "0 0 1rem" }}>No active milestones</h2>
                    <p style={{ color: "#64748b", margin: "0 auto 2.5rem", maxWidth: "450px", fontSize: "1.1rem", fontWeight: 500, lineHeight: "1.6" }}>
                        {events.length === 0 ? "You need an active event context before defining tasks. Create an event first to begin tracking." : "Scale your productivity by defining the first operational step for this event context."}
                    </p>
                    {events.length > 0 && (
                        <button
                            onClick={() => setShowModal(true)}
                            style={{
                                background: "#fff",
                                border: "1.5px solid #e2e8f0",
                                padding: "1rem 2rem",
                                borderRadius: "14px",
                                fontWeight: 800,
                                cursor: "pointer",
                                transition: "all 0.2s"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}
                        >Define First Task</button>
                    )}
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 180px 180px 140px",
                        padding: "0 2.5rem 1rem",
                        color: "#94a3b8",
                        fontSize: "11px",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.1em"
                    }}>
                        <span>Requirement</span>
                        <span style={{ textAlign: "center" }}>Context</span>
                        <span style={{ textAlign: "center" }}>Deadline</span>
                        <span style={{ textAlign: "right" }}>Priority</span>
                    </div>
                    {filteredTasks.map(task => (
                        <div key={task._id} className="task-row" style={{
                            background: "#fff",
                            padding: "1.5rem 2.5rem",
                            display: "grid",
                            gridTemplateColumns: "1fr 180px 180px 140px",
                            alignItems: "center",
                            borderRadius: "24px",
                            border: "1px solid #f1f5f9",
                            boxShadow: "0 2px 10px rgba(0,0,0,0.01)",
                            transition: "all 0.2s ease"
                        }}>
                            <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
                                <div
                                    onClick={() => toggleStatus(task._id, task.status)}
                                    style={{
                                        width: "28px",
                                        height: "28px",
                                        borderRadius: "10px",
                                        border: `2px solid ${task.status === "Completed" ? "#10b981" : "#e2e8f0"}`,
                                        background: task.status === "Completed" ? "#10b981" : "transparent",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "pointer",
                                        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                                    }}
                                >
                                    {task.status === "Completed" && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><polyline points="20 6 9 17 4 12" /></svg>}
                                </div>
                                <div>
                                    <h3 style={{
                                        fontWeight: 700,
                                        fontSize: "16px",
                                        margin: 0,
                                        color: task.status === "Completed" ? "#94a3b8" : "#0f172a",
                                        textDecoration: task.status === "Completed" ? "line-through" : "none",
                                        transition: "color 0.2s"
                                    }}>{task.title}</h3>
                                </div>
                            </div>

                            <div style={{ textAlign: "center" }}>
                                <span style={{
                                    background: "#f1f5f9",
                                    color: "#475569",
                                    fontSize: "11px",
                                    fontWeight: 800,
                                    padding: "6px 12px",
                                    borderRadius: "100px",
                                    textTransform: "uppercase"
                                }}>
                                    {events.find(e => (e.id || e._id) === task.event)?.name || "External"}
                                </span>
                            </div>

                            <div style={{ textAlign: "center", fontSize: "14px", fontWeight: 700, color: task.status === "Completed" ? "#cbd5e1" : "#64748b" }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                                    <Clock size={14} />
                                    {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </div>
                            </div>

                            <div style={{ textAlign: "right" }}>
                                <span style={{
                                    fontSize: "10px",
                                    padding: "6px 14px",
                                    background: task.priority === "High" ? "#fff1f2" : task.priority === "Medium" ? "#fffbeb" : "#eff6ff",
                                    color: task.priority === "High" ? "#be123c" : task.priority === "Medium" ? "#92400e" : "#2563eb",
                                    borderRadius: "100px",
                                    fontWeight: 900,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                    border: `1px solid ${task.priority === "High" ? "#be123c20" : task.priority === "Medium" ? "#92400e20" : "#2563eb20"}`
                                }}>{task.priority}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, backdropFilter: "blur(8px)" }}>
                    <div style={{ background: "#fff", width: "100%", maxWidth: "520px", padding: "3rem", borderRadius: "32px", boxShadow: "0 25px 60px rgba(0,0,0,0.2)", animation: "modalIn 0.3s ease-out" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
                                <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563eb" }}>
                                    <ListTodo size={24} strokeWidth={2.5} />
                                </div>
                                <h2 style={{ fontSize: "1.75rem", fontWeight: 800, margin: 0, letterSpacing: "-0.03em" }}>Define Milestone</h2>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{ background: "#f1f5f9", border: "none", color: "#64748b", width: "36px", height: "36px", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                            ><X size={20} strokeWidth={2.5} /></button>
                        </div>
                        <form onSubmit={handleCreateTask} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#64748b", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Milestone Title</label>
                                <input style={{ width: "100%", padding: "1rem", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "15px", fontWeight: 600 }} placeholder="e.g. Finalize Catering Menu" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} required />
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#64748b", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Associated Context</label>
                                <select
                                    style={{ width: "100%", padding: "1rem", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "15px", fontWeight: 700 }}
                                    value={newTask.eventId}
                                    onChange={e => setNewTask({ ...newTask, eventId: e.target.value })}
                                    required
                                >
                                    {events.map(event => (
                                        <option key={event.id || event._id} value={event.id || event._id}>{event.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#64748b", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Deadline</label>
                                    <input type="date" style={{ width: "100%", padding: "1rem", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "15px", fontWeight: 600 }} value={newTask.dueDate} onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })} required />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#64748b", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Priority Level</label>
                                    <select style={{ width: "100%", padding: "1rem", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "15px", fontWeight: 700 }} value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value })}>
                                        <option>Low</option>
                                        <option>Medium</option>
                                        <option>High</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: "1.25rem", marginTop: "1rem" }}>
                                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: "1.1rem", borderRadius: "14px", border: "none", background: "#f1f5f9", fontWeight: 800, cursor: "pointer" }}>Cancel</button>
                                <button type="submit" style={{ flex: 2, padding: "1.1rem", borderRadius: "14px", border: "none", background: "#2563eb", color: "#fff", fontWeight: 900, cursor: "pointer", boxShadow: "0 8px 20px rgba(37, 99, 235, 0.2)" }}>Create Milestone</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes modalIn {
                    from { transform: translateY(40px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
