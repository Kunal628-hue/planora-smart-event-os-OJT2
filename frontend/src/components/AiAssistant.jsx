import { useState, useRef, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export default function AiAssistant({ eventId }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: "assistant", text: "Hello! I'm your Planora AI. How can I help you with your event today?" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || !eventId) return;

        const userMsg = { role: "user", text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/ai/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: input, eventId })
            });
            const data = await response.json();
            setMessages(prev => [...prev, { role: "assistant", text: data.response }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: "assistant", text: "I'm having trouble connecting to my brain. Please try again later." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: "fixed", bottom: "2rem", right: "2rem", zIndex: 1000 }}>
            {isOpen && (
                <div className="card shadow-2xl" style={{
                    width: "350px",
                    height: "450px",
                    display: "flex",
                    flexDirection: "column",
                    marginBottom: "1rem",
                    padding: 0,
                    overflow: "hidden",
                    border: "1px solid var(--border-accent)"
                }}>
                    <div style={{
                        padding: "1rem",
                        background: "var(--accent-primary)",
                        color: "#fff",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }}></div>
                            <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>Planora AI Assistant</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} style={{ background: "none", color: "#fff", opacity: 0.8 }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        </button>
                    </div>

                    <div ref={scrollRef} style={{ flex: 1, padding: "1rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.75rem", background: "var(--bg-base)" }}>
                        {messages.map((msg, idx) => (
                            <div key={idx} style={{
                                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                                maxWidth: "80%",
                                padding: "0.75rem",
                                borderRadius: "12px",
                                fontSize: "0.85rem",
                                background: msg.role === "user" ? "var(--accent-primary)" : "var(--bg-surface)",
                                color: msg.role === "user" ? "#fff" : "var(--text-primary)",
                                boxShadow: "var(--shadow-sm)",
                                border: msg.role === "assistant" ? "1px solid var(--border-subtle)" : "none"
                            }}>
                                {msg.text}
                            </div>
                        ))}
                        {loading && (
                            <div style={{ alignSelf: "flex-start", padding: "0.5rem", display: "flex", gap: "4px" }}>
                                <div className="dot" style={{ width: 6, height: 6, background: "var(--text-muted)", borderRadius: "50%", animation: "pulse 1s infinite 0s" }}></div>
                                <div className="dot" style={{ width: 6, height: 6, background: "var(--text-muted)", borderRadius: "50%", animation: "pulse 1s infinite 0.2s" }}></div>
                                <div className="dot" style={{ width: 6, height: 6, background: "var(--text-muted)", borderRadius: "50%", animation: "pulse 1s infinite 0.4s" }}></div>
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSendMessage} style={{ padding: "1rem", borderTop: "1px solid var(--border-subtle)", background: "var(--bg-surface)", display: "flex", gap: "0.5rem" }}>
                        <input
                            className="auth-input"
                            placeholder="Ask about progress, budget..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            style={{ borderRadius: "20px" }}
                        />
                        <button type="submit" className="btn btn-primary" style={{ width: "40px", height: "40px", borderRadius: "50%", padding: 0 }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                        </button>
                    </form>
                </div>
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="btn-primary hover-lift anim-pulse-glow"
                style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 8px 25px rgba(59, 130, 246, 0.5)",
                    border: "2px solid rgba(255,255,255,0.2)"
                }}
            >
                {isOpen ? (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                ) : (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /><path d="M8 9h8" /><path d="M8 13h6" /></svg>
                )}
            </button>
            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 0.3; transform: scale(0.8); }
                    50% { opacity: 1; transform: scale(1.1); }
                }
            `}</style>
        </div>
    );
}
