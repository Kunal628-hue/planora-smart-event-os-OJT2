import { useState, useRef, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export default function AiAssistant({ eventId }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: "assistant", text: "Hello! I'm your Planora AI. How can I assist with your event strategy today?" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: "smooth"
            });
        }
    }, [messages, loading]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || !eventId || loading) return;

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
            setMessages(prev => [...prev, { role: "assistant", text: "I'm having a bit of trouble connecting to the neural network. Please try again." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: "fixed", bottom: "2rem", right: "2rem", zIndex: 1000, fontFamily: "'Inter', sans-serif" }}>
            {isOpen && (
                <div style={{
                    width: "380px",
                    height: "520px",
                    maxHeight: "calc(100vh - 120px)",
                    display: "flex",
                    flexDirection: "column",
                    marginBottom: "1rem",
                    background: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    borderRadius: "24px",
                    overflow: "hidden",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    boxShadow: "0 20px 50px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.02)",
                    animation: "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
                }}>
                    {/* Header */}
                    <div style={{
                        padding: "1.25rem 1.5rem",
                        background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
                        color: "#fff",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                            <div style={{ position: "relative" }}>
                                <div style={{
                                    width: "42px",
                                    height: "42px",
                                    background: "rgba(255,255,255,0.2)",
                                    borderRadius: "12px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backdropFilter: "blur(4px)"
                                }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" /></svg>
                                </div>
                                <div style={{
                                    position: "absolute",
                                    bottom: "-2px",
                                    right: "-2px",
                                    width: "12px",
                                    height: "12px",
                                    background: "#22c55e",
                                    borderRadius: "50%",
                                    border: "2px solid #1e3a8a"
                                }}></div>
                            </div>
                            <div>
                                <div style={{ fontWeight: 800, fontSize: "1rem", letterSpacing: "-0.01em" }}>Planora Intelligence</div>
                                <div style={{ fontSize: "0.7rem", opacity: 0.8, fontWeight: 600 }}>Always active • Ready to assist</div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            style={{
                                background: "rgba(255,255,255,0.15)",
                                border: "none",
                                color: "#fff",
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                transition: "all 0.2s"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div
                        ref={scrollRef}
                        style={{
                            flex: 1,
                            padding: "1.5rem",
                            overflowY: "auto",
                            display: "flex",
                            flexDirection: "column",
                            gap: "1.25rem",
                            background: "#f8fafc",
                            scrollbarWidth: "thin"
                        }}
                    >
                        {messages.map((msg, idx) => (
                            <div key={idx} style={{
                                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                                maxWidth: "85%",
                                padding: "1rem 1.25rem",
                                borderRadius: msg.role === "user" ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
                                fontSize: "0.925rem",
                                lineHeight: "1.5",
                                background: msg.role === "user" ? "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)" : "#fff",
                                color: msg.role === "user" ? "#fff" : "#1e293b",
                                boxShadow: msg.role === "user" ? "0 4px 15px rgba(37, 99, 235, 0.2)" : "0 2px 8px rgba(0,0,0,0.04)",
                                border: msg.role === "assistant" ? "1px solid #e2e8f0" : "none",
                                position: "relative",
                                animation: "fadeIn 0.3s ease-out"
                            }}>
                                {msg.text}
                            </div>
                        ))}
                        {loading && (
                            <div style={{ alignSelf: "flex-start", padding: "0.75rem 1.25rem", background: "#fff", borderRadius: "20px 20px 20px 4px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                                <div style={{ display: "flex", gap: "6px" }}>
                                    <div className="bot-dot" style={{ width: 8, height: 8, background: "#3b82f6", borderRadius: "50%", animation: "botBounce 1s infinite 0s" }}></div>
                                    <div className="bot-dot" style={{ width: 8, height: 8, background: "#3b82f6", borderRadius: "50%", animation: "botBounce 1s infinite 0.2s" }}></div>
                                    <div className="bot-dot" style={{ width: 8, height: 8, background: "#3b82f6", borderRadius: "50%", animation: "botBounce 1s infinite 0.4s" }}></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <form
                        onSubmit={handleSendMessage}
                        style={{
                            padding: "1.25rem 1.5rem",
                            background: "#fff",
                            borderTop: "1px solid #e2e8f0",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.85rem",
                            boxShadow: "0 -4px 15px rgba(0,0,0,0.02)"
                        }}
                    >
                        <div style={{ position: "relative", flex: 1 }}>
                            <input
                                placeholder="Type a message..."
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "0.85rem 1.25rem",
                                    background: "#f1f5f9",
                                    border: "1px solid transparent",
                                    borderRadius: "16px",
                                    fontSize: "0.95rem",
                                    outline: "none",
                                    transition: "all 0.2s",
                                    color: "#1e293b"
                                }}
                                onFocus={(e) => {
                                    e.target.style.background = "#fff";
                                    e.target.style.borderColor = "#3b82f6";
                                    e.target.style.boxShadow = "0 0 0 4px rgba(59, 130, 246, 0.1)";
                                }}
                                onBlur={(e) => {
                                    e.target.style.background = "#f1f5f9";
                                    e.target.style.borderColor = "transparent";
                                    e.target.style.boxShadow = "none";
                                }}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!input.trim() || loading}
                            style={{
                                width: "48px",
                                height: "48px",
                                borderRadius: "14px",
                                padding: 0,
                                background: input.trim() ? "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)" : "#e2e8f0",
                                color: "#fff",
                                border: "none",
                                cursor: input.trim() ? "pointer" : "default",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                boxShadow: input.trim() ? "0 4px 12px rgba(37, 99, 235, 0.3)" : "none",
                                transform: input.trim() ? "scale(1)" : "scale(0.95)"
                            }}
                        >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" transform="rotate(45)" style={{ marginLeft: "-2px", marginTop: "-2px" }}><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                        </button>
                    </form>
                </div>
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "20px",
                    background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 10px 30px rgba(30, 58, 138, 0.4), inset 0 1px 1px rgba(255,255,255,0.3)",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                    transform: isOpen ? "rotate(90deg) scale(0.9)" : "rotate(0) scale(1)",
                    color: "#fff"
                }}
                className="hover-lift"
            >
                {isOpen ? (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                ) : (
                    <div style={{ position: "relative" }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /><path d="M8 9h8" /><path d="M8 13h6" /></svg>
                        <div style={{
                            position: "absolute",
                            top: "-4px",
                            right: "-4px",
                            width: "12px",
                            height: "12px",
                            background: "#ff4d4d",
                            borderRadius: "50%",
                            border: "2px solid #3b82f6"
                        }}></div>
                    </div>
                )}
            </button>
            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(30px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes botBounce {
                    0%, 100% { transform: translateY(0); opacity: 0.4; }
                    50% { transform: translateY(-6px); opacity: 1; }
                }
                .hover-lift:hover {
                    transform: translateY(-4px) scale(1.05) !important;
                    box-shadow: 0 15px 40px rgba(30, 58, 138, 0.5) !important;
                }
                div::-webkit-scrollbar {
                    width: 6px;
                }
                div::-webkit-scrollbar-track {
                    background: transparent;
                }
                div::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 10px;
                }
                div::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>
        </div>
    );
}
