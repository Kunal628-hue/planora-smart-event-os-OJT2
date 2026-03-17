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
            const res = await fetch(`${API_URL}/tasks?user=${user.uid}`);
            const data = await res.json();
            setTasks(data);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

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

    const filteredTasks = tasks.filter(t => t.event === selectedEventId);

    return (
        <div className="stagger-in">
            <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2.5rem" }}>
                <div>
                    <h1 style={{ fontSize: "2.5rem", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: "0.5rem" }}>
                        Workflow <span className="gradient-text">Milestones</span>
                    </h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
                        Organize your chronological operations across all active event contexts.
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn btn-primary btn-lg"
                    disabled={events.length === 0}
                    style={{ borderRadius: "14px", padding: "1rem 2rem", display: "flex", alignItems: "center", gap: "0.5rem" }}
                >
                    <Plus size={20} strokeWidth={3} />
                    <span>New Task</span>
                </button>
            </div>

            {loading ? (
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "8rem 0", gap: "1.5rem" }}>
                    <div style={{ width: "48px", height: "48px", border: "5px solid var(--accent-primary)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                    <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Optimizing Flows...</p>
                </div>
            ) : filteredTasks.length === 0 ? (
                <div className="glass-panel" style={{ padding: "6rem 2rem", textAlign: "center", borderRadius: "32px", border: "2px dashed var(--border-medium)", background: "var(--bg-elevated)", position: "relative", overflow: "hidden" }}>
                    <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "center" }}>
                        <div className="anim-float" style={{ width: "80px", height: "80px", borderRadius: "24px", background: "var(--bg-card)", display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px solid var(--border-subtle)" }}>
                            <ListTodo size={40} color="var(--accent-primary)" />
                        </div>
                    </div>
                    <h2 style={{ fontSize: "1.75rem", fontWeight: 850 }}>No active milestones found</h2>
                    <p style={{ color: "var(--text-secondary)", marginTop: "1rem", maxWidth: "450px", margin: "1rem auto", fontSize: "1.1rem", fontWeight: 500 }}>
                        {events.length === 0 ? "You need an active event context before defining tasks. Create an event first." : "Stay productive by adding your first operational milestone."}
                    </p>
                    {events.length > 0 && (
                        <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ marginTop: "1rem" }}>Define First Task</button>
                    )}
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 120px 100px", padding: "0.75rem 2rem", color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        <span>Requirement</span>
                        <span style={{ textAlign: "center" }}>Context</span>
                        <span style={{ textAlign: "center" }}>Deadline</span>
                        <span style={{ textAlign: "right" }}>Priority</span>
                    </div>
                    {filteredTasks.map(task => (
                        <div key={task._id} className="glass-panel task-row" style={{ padding: "1.25rem 2rem", display: "grid", gridTemplateColumns: "1fr 120px 120px 100px", alignItems: "center", borderRadius: "18px" }}>
                            <div style={{ display: "flex", gap: "1.25rem", alignItems: "center" }}>
                                <div
                                    onClick={() => toggleStatus(task._id, task.status)}
                                    style={{
                                        width: "24px",
                                        height: "24px",
                                        borderRadius: "8px",
                                        border: `2px solid ${task.status === "Completed" ? "var(--accent-success)" : "var(--border-medium)"}`,
                                        background: task.status === "Completed" ? "var(--accent-success)" : "transparent",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "pointer",
                                        transition: "all 0.2s"
                                    }}
                                >
                                    {task.status === "Completed" && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><polyline points="20 6 9 17 4 12" /></svg>}
                                </div>
                                <div>
                                    <h3 style={{
                                        fontWeight: 800,
                                        fontSize: "1.05rem",
                                        color: task.status === "Completed" ? "var(--text-muted)" : "var(--text-primary)",
                                        textDecoration: task.status === "Completed" ? "line-through" : "none"
                                    }}>{task.title}</h3>
                                </div>
                            </div>

                            <div style={{ textAlign: "center" }}>
                                <span className="category-badge" style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)", fontSize: "0.7rem" }}>
                                    {events.find(e => (e.id || e._id) === task.event)?.name || "External"}
                                </span>
                            </div>

                            <div style={{ textAlign: "center", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)" }}>
                                {task.dueDate}
                            </div>

                            <div style={{ textAlign: "right" }}>
                                <span style={{
                                    fontSize: "0.65rem",
                                    padding: "0.3rem 0.6rem",
                                    background: task.priority === "High" ? "rgba(239, 68, 68, 0.1)" : task.priority === "Medium" ? "rgba(245, 158, 11, 0.1)" : "rgba(59, 130, 246, 0.1)",
                                    color: task.priority === "High" ? "#ef4444" : task.priority === "Medium" ? "#f59e0b" : "#3b82f6",
                                    borderRadius: "6px",
                                    fontWeight: 900,
                                    textTransform: "uppercase"
                                }}>{task.priority}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(12px)" }}>
                    <div className="glass-panel" style={{ width: "100%", maxWidth: "500px", padding: "3rem", borderRadius: "32px", boxShadow: "0 30px 60px -12px rgba(0,0,0,0.25)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                <ListTodo size={24} color="var(--accent-primary)" />
                                <h2 style={{ fontSize: "1.75rem", fontWeight: 900, letterSpacing: "-0.03em" }}>Define Milestone</h2>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{ background: "var(--bg-elevated)", border: "none", color: "var(--text-primary)", width: "36px", height: "36px", borderRadius: "12px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                            ><X size={20} fontWeight={900} /></button>
                        </div>
                        <form onSubmit={handleCreateTask} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 800, color: "var(--text-muted)", marginBottom: "0.6rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Milestone Title</label>
                                <input className="auth-input" placeholder="e.g. Finalize Catering Menu" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} required style={{ borderRadius: "14px", padding: "1rem" }} />
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 800, color: "var(--text-muted)", marginBottom: "0.6rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Associated Context</label>
                                <select
                                    className="auth-input"
                                    value={newTask.eventId}
                                    onChange={e => setNewTask({ ...newTask, eventId: e.target.value })}
                                    required
                                    style={{ borderRadius: "14px", padding: "1rem", fontWeight: 700 }}
                                >
                                    {events.map(event => (
                                        <option key={event.id || event._id} value={event.id || event._id}>{event.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 800, color: "var(--text-muted)", marginBottom: "0.6rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Deadline</label>
                                    <input className="auth-input" type="date" value={newTask.dueDate} onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })} required style={{ borderRadius: "14px", padding: "1rem" }} />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 800, color: "var(--text-muted)", marginBottom: "0.6rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Priority Index</label>
                                    <select className="auth-input" value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value })} style={{ borderRadius: "14px", padding: "1rem", fontWeight: 700 }}>
                                        <option>Low</option>
                                        <option>Medium</option>
                                        <option>High</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: "1.25rem", marginTop: "1rem" }}>
                                <button className="btn btn-ghost" type="button" onClick={() => setShowModal(false)} style={{ flex: 1, borderRadius: "14px", fontWeight: 700 }}>Cancel</button>
                                <button className="btn btn-primary" type="submit" style={{ flex: 2, borderRadius: "14px", fontWeight: 900 }}>Create Task</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
