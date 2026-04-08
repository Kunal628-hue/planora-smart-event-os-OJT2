import { useState, useRef, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import { MessageSquare, Sparkles, X as CloseIcon } from "lucide-react";
import { PlanoraSpinner } from "./ui/Loader";

const API_URL = import.meta.env.VITE_API_URL;

export default function AiAssistant({ eventId }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState(() => {
        const saved = localStorage.getItem(`planora_chat_${eventId || 'global'}`);
        return saved ? JSON.parse(saved) : [
            { role: "assistant", text: "**Planora OS Intelligence Unit online.** Tactical event data analysis is ready. How may I assist with your strategy?" }
        ];
    });

    useEffect(() => {
        const saved = localStorage.getItem(`planora_chat_${eventId || 'global'}`);
        setMessages(saved ? JSON.parse(saved) : [
            { role: "assistant", text: "**Planora OS Intelligence Unit online.** Tactical event data analysis is ready. How may I assist with your strategy?" }
        ]);
    }, [eventId]);

    useEffect(() => {
        localStorage.setItem(`planora_chat_${eventId || 'global'}`, JSON.stringify(messages));
    }, [messages, eventId]);

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
            setMessages(prev => [...prev, { role: "assistant", text: "Connection error with core intelligence. Please re-initiate query." }]);
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
                    background: "rgba(255, 255, 255, 0.75)",
                    backdropFilter: "blur(30px) saturate(180%)",
                    WebkitBackdropFilter: "blur(30px) saturate(180%)",
                    borderRadius: "20px",
                    overflow: "hidden",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.1)",
                    animation: "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                    zIndex: 1001
                }}>
                    {/* Header */}
                    <div style={{
                        padding: "1rem 1.25rem",
                        background: "#1e293b",
                        color: "#fff",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
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
                                <div style={{ fontWeight: 700, fontSize: "0.9rem", letterSpacing: "-0.01em" }}>Neural Planner AI</div>
                                <div style={{ fontSize: "0.65rem", opacity: 0.7, fontWeight: 500 }}>Intelligent Assistant</div>
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
                                padding: "0.75rem 1rem",
                                borderRadius: msg.role === "user" ? "16px 16px 2px 16px" : "16px 16px 16px 2px",
                                fontSize: "0.85rem",
                                fontWeight: 500,
                                lineHeight: "1.6",
                                background: msg.role === "user" ? "#1e293b" : "#fff",
                                color: msg.role === "user" ? "#fff" : "#334155",
                                border: msg.role === "assistant" ? "1px solid #e2e8f0" : "none",
                                boxShadow: msg.role === "assistant" ? "0 2px 8px rgba(0,0,0,0.02)" : "none",
                                position: "relative",
                                animation: "bubbleIn 0.4s cubic-bezier(0.2, 1, 0.3, 1)"
                            }}>
                                <ReactMarkdown components={{
                                    p: ({node, ...props}) => <div style={{ marginBottom: "0.5rem" }} {...props} />,
                                    ul: ({node, ...props}) => <ul style={{ margin: "0.5rem 0", paddingLeft: "1.25rem", color: "inherit" }} {...props} />,
                                    li: ({node, ...props}) => <li style={{ marginBottom: "0.25rem" }} {...props} />,
                                    strong: ({node, ...props}) => <strong style={{ fontWeight: 800, color: msg.role === "user" ? "#fff" : "#1e293b" }} {...props} />
                                }}>
                                    {msg.text}
                                </ReactMarkdown>
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
                                background: input.trim() ? "#1e293b" : "#f1f5f9",
                                color: input.trim() ? "#fff" : "#94a3b8",
                                border: "none",
                                cursor: input.trim() ? "pointer" : "default",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition: "all 0.2s"
                            }}
                        >
                            {loading ? (
                                <PlanoraSpinner size={20} color={input.trim() ? "#fff" : "#2563eb"} />
                            ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" transform="rotate(45)" style={{ marginLeft: "-2px", marginTop: "-2px" }}><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                            )}
                        </button>
                    </form>
                </div>
            )}

            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        background: "#1e293b",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        cursor: "pointer",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        transform: "rotate(0)",
                        color: "#fff",
                        padding: 0
                    }}
                    className="ai-trigger-btn"
                >
                    <MessageSquare size={22} strokeWidth={2.25} />
                </button>
            )}
            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(30px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes bubbleIn {
                    from { opacity: 0; transform: translateY(15px) scale(0.9); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes botBounce {
                    0%, 100% { transform: translateY(0); opacity: 0.4; }
                    50% { transform: translateY(-6px); opacity: 1; }
                }
                .ai-trigger-btn:hover {
                    transform: translateY(-2px) scale(1.05) !important;
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2) !important;
                    background: #334155 !important;
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
