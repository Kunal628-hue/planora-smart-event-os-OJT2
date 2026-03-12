import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function Tasks() {
    const { user } = useOutletContext();
    const [tasks, setTasks] = useState([]);
    const [events, setEvents] = useState([]);
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
        try {
            const [tasksRes, eventsRes] = await Promise.all([
                fetch(`${API_URL}/tasks?user=${user.uid}`),
                fetch(`${API_URL}/events?user=${user.uid}`)
            ]);
            const tasksData = await tasksRes.json();
            const eventsData = await eventsRes.json();
            setTasks(tasksData);
            setEvents(eventsData);
            if (eventsData.length > 0) {
                setNewTask(prev => ({ ...prev, eventId: eventsData[0].id }));
            }
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

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
                setNewTask({ title: "", dueDate: "", priority: "Medium", eventId: events[0]?.id || "" });
                fetchData();
            }
        } catch (err) {
            console.error("Failed to add task:", err);
        }
    };

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                    <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)" }}>Tasks & Milestones</h1>
                    <p style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Organize your workflow across all events.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn btn-primary"
                    disabled={events.length === 0}
                    style={{ background: "var(--accent-primary)", borderRadius: "50px", padding: "0.6rem 1.5rem" }}
                >
                    Add New Task
                </button>
            </div>

            {loading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "5rem" }}>
                    <div style={{ width: "40px", height: "40px", border: "4px solid var(--accent-primary)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                </div>
            ) : tasks.length === 0 ? (
                <div className="card" style={{ padding: "5rem 2rem", textAlign: "center", border: "1px dashed var(--border-subtle)" }}>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: 850 }}>No tasks found</h2>
                    <p style={{ color: "var(--text-secondary)", marginTop: "1rem" }}>{events.length === 0 ? "Create an event first to add tasks." : "Stay productive by adding your first milestone."}</p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {tasks.map(task => (
                        <div key={task._id} className="card hover-lift" style={{ padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
                                <div style={{
                                    width: "12px",
                                    height: "12px",
                                    borderRadius: "50%",
                                    background: task.status === "Completed" ? "#10b981" : task.priority === "High" ? "#ef4444" : "#f59e0b"
                                }}></div>
                                <div>
                                    <h3 style={{ fontWeight: 800, fontSize: "1rem" }}>{task.title}</h3>
                                    <div style={{ display: "flex", gap: "1rem", marginTop: "0.25rem" }}>
                                        <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>Due: {task.dueDate}</p>
                                        <p style={{ color: "var(--accent-primary)", fontSize: "0.8rem", fontWeight: 600 }}>Event: {events.find(e => e.id === task.event)?.name || "External"}</p>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: "0.75rem" }}>
                                <span style={{ fontSize: "0.7rem", padding: "0.3rem 0.6rem", background: "var(--bg-elevated)", borderRadius: "6px", fontWeight: 700 }}>{task.priority}</span>
                                <span style={{ fontSize: "0.7rem", padding: "0.3rem 0.6rem", background: task.status === "Completed" ? "#f0fdf4" : "var(--bg-elevated)", color: task.status === "Completed" ? "#16a34a" : "var(--text-muted)", borderRadius: "6px", fontWeight: 800 }}>{task.status}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" }}>
                    <div className="card" style={{ width: "100%", maxWidth: "450px", padding: "2.5rem" }}>
                        <h2 style={{ fontSize: "1.5rem", fontWeight: 850, marginBottom: "1.5rem" }}>Create New Task</h2>
                        <form onSubmit={handleCreateTask} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.5rem" }}>Task Title</label>
                                <input className="auth-input" placeholder="e.g. Finalize Catering Menu" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} required />
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.5rem" }}>Associate with Event</label>
                                <select
                                    className="auth-input"
                                    value={newTask.eventId}
                                    onChange={e => setNewTask({ ...newTask, eventId: e.target.value })}
                                    required
                                >
                                    {events.map(event => (
                                        <option key={event.id} value={event.id}>{event.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.5rem" }}>Due Date</label>
                                    <input className="auth-input" type="date" value={newTask.dueDate} onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })} required />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.5rem" }}>Priority</label>
                                    <select className="auth-input" value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value })}>
                                        <option>Low</option>
                                        <option>Medium</option>
                                        <option>High</option>
                                    </select>
                                </div>
                            </div>
                            <button className="btn btn-primary" type="submit" style={{ width: "100%", marginTop: "1rem", background: "var(--accent-primary)" }}>Save Task</button>
                            <button className="btn btn-ghost" type="button" onClick={() => setShowModal(false)} style={{ width: "100%" }}>Cancel</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
