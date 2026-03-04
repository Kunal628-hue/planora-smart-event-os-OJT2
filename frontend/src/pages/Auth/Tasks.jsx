import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function Tasks() {
    const { user } = useOutletContext();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newTask, setNewTask] = useState({
        title: "",
        dueDate: "",
        priority: "Medium"
    });

    const fetchTasks = async () => {
        if (!user) return;
        try {
            const response = await fetch(`${API_URL}/tasks?user=${user.uid}`);
            const data = await response.json();
            setTasks(data);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, [user]);

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/tasks`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...newTask, user: user.uid, event: "000000000000000000000000" }) // Temporary placeholder for global task list
            });
            if (response.ok) {
                setShowModal(false);
                setNewTask({ title: "", dueDate: "", priority: "Medium" });
                fetchTasks();
            }
        } catch (err) {
            console.error("Failed to add task:", err);
        }
    };

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                    <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)" }}>Tasks / Timeline</h1>
                    <p style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Stay on top of your event checklist.</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn btn-primary">Add Task</button>
            </div>

            {loading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "5rem" }}>
                    <div style={{ width: "40px", height: "40px", border: "4px solid var(--accent-primary)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                </div>
            ) : tasks.length === 0 ? (
                <div className="card" style={{ padding: "5rem 2rem", textAlign: "center", border: "1px dashed var(--border-subtle)" }}>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: 850 }}>All caught up!</h2>
                    <p style={{ color: "var(--text-secondary)", marginTop: "1rem" }}>Create tasks manually to stay organized.</p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {tasks.map(task => (
                        <div key={task._id} className="card" style={{ padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                <h3 style={{ fontWeight: 800 }}>{task.title}</h3>
                                <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>Due: {task.dueDate}</p>
                            </div>
                            <span style={{ fontSize: "0.7rem", padding: "0.25rem 0.5rem", background: "var(--accent-soft)", borderRadius: "6px" }}>{task.priority}</span>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
                    <div className="card" style={{ width: "100%", maxWidth: "400px", padding: "2rem" }}>
                        <h2>Create New Task</h2>
                        <form onSubmit={handleCreateTask} style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1.5rem" }}>
                            <input className="auth-input" placeholder="Task Title" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} required />
                            <input className="auth-input" type="date" value={newTask.dueDate} onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })} required />
                            <select className="auth-input" value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value })}>
                                <option>Low</option>
                                <option>Medium</option>
                                <option>High</option>
                            </select>
                            <button className="btn btn-primary" type="submit">Save Task</button>
                            <button className="btn btn-ghost" type="button" onClick={() => setShowModal(false)}>Cancel</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
