import { useState, useRef, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import { MessageSquare, Sparkles, X as CloseIcon, Send, Trash2, Zap, ShieldAlert, BarChart3, ChevronRight } from "lucide-react";
import { PlanoraSpinner } from "./ui/Loader";

const API_URL = import.meta.env.VITE_API_URL;

const QUICK_ACTIONS = [
    { label: "Operational Status", icon: <BarChart3 size={12} />, prompt: "Provide a comprehensive operational status report for this event." },
    { label: "Financial Risk", icon: <ShieldAlert size={12} />, prompt: "Analyze the current budget and identify potential financial risks." },
    { label: "Next Milestones", icon: <Zap size={12} />, prompt: "What are the most critical pending milestones I should focus on next?" }
];

export default function AiAssistant({ eventId }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState(() => {
        const saved = localStorage.getItem(`planora_chat_${eventId || 'global'}`);
        return saved ? JSON.parse(saved) : [
            { role: "assistant", text: "**Neural Strategic Unit online.** Event context loaded. I have established a direct link to your live budget and task data. How shall we proceed with your tactical planning?" }
        ];
    });

    useEffect(() => {
        const saved = localStorage.getItem(`planora_chat_${eventId || 'global'}`);
        setMessages(saved ? JSON.parse(saved) : [
            { role: "assistant", text: "**Neural Strategic Unit online.** Event context loaded. I have established a direct link to your live budget and task data. How shall we proceed with your tactical planning?" }
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
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading]);

    const handleSendMessage = async (e, customPrompt = null) => {
        if (e) e.preventDefault();
        const textToSend = customPrompt || input;
        if (!textToSend.trim() || !eventId || loading) return;

        const userMsg = { role: "user", text: textToSend };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/ai/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: textToSend, eventId })
            });
            const data = await response.json();
            setMessages(prev => [...prev, { role: "assistant", text: data.response }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: "assistant", text: "Connection error with core intelligence. Please re-initiate query." }]);
        } finally {
            setLoading(false);
        }
    };

    const clearChat = () => {
        const initialMsg = [{ role: "assistant", text: "**Memory purge complete.** Tactical context re-initialized. Awaiting fresh instructions." }];
        setMessages(initialMsg);
        localStorage.removeItem(`planora_chat_${eventId || 'global'}`);
    };

    return (
        <div style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 1000, fontFamily: "'Inter', sans-serif" }}>
            {isOpen && (
                <div style={{
                    width: "400px",
                    height: "600px",
                    maxHeight: "calc(100vh - 100px)",
                    display: "flex",
                    flexDirection: "column",
                    marginBottom: "1rem",
                    background: "rgba(10, 10, 12, 0.9)",
                    backdropFilter: "blur(40px) saturate(200%)",
                    WebkitBackdropFilter: "blur(40px) saturate(200%)",
                    borderRadius: "24px",
                    overflow: "hidden",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    boxShadow: "0 25px 60px -12px rgba(0, 0, 0, 0.8)",
                    animation: "slideUpChat 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                    zIndex: 1001
                }}>
                    {/* Header */}
                    <div style={{
                        padding: "1.25rem 1.5rem",
                        background: "rgba(255, 255, 255, 0.03)",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                            <div style={{ position: "relative" }}>
                                <div style={{
                                    width: "44px",
                                    height: "44px",
                                    background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                                    borderRadius: "14px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    boxShadow: "0 0 20px rgba(249, 115, 22, 0.3)"
                                }}>
                                    <Sparkles size={22} color="#fff" strokeWidth={2.5} />
                                </div>
                                <div style={{
                                    position: "absolute",
                                    bottom: "-2px",
                                    right: "-2px",
                                    width: "12px",
                                    height: "12px",
                                    background: "#10b981",
                                    borderRadius: "50%",
                                    border: "2px solid #0a0a0c"
                                }}></div>
                            </div>
                            <div>
                                <div style={{ fontWeight: 900, fontSize: "14px", color: "#fff", letterSpacing: "-0.01em" }}>Planora OS Intelligence</div>
                                <div style={{ fontSize: "10px", color: "var(--accent-primary)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>Strategic Mode Active</div>
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: "8px" }}>
                            <button onClick={clearChat} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", padding: "8px" }} title="Clear context">
                                <Trash2 size={16} />
                            </button>
                            <button onClick={() => setIsOpen(false)} style={{ background: "rgba(255,255,255,0.05)", border: "none", color: "#fff", width: "32px", height: "32px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                                <CloseIcon size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div
                        ref={scrollRef}
                        className="custom-scrollbar"
                        style={{
                            flex: 1,
                            padding: "1.5rem",
                            overflowY: "auto",
                            display: "flex",
                            flexDirection: "column",
                            gap: "1.5rem",
                            background: "transparent",
                        }}
                    >
                        {messages.map((msg, idx) => (
                            <div key={idx} style={{
                                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                                maxWidth: "88%",
                                position: "relative"
                            }}>
                                <div style={{
                                    padding: "1rem 1.25rem",
                                    borderRadius: msg.role === "user" ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
                                    fontSize: "13.5px",
                                    fontWeight: 500,
                                    lineHeight: "1.6",
                                    background: msg.role === "user" ? "var(--accent-primary)" : "rgba(255,255,255,0.04)",
                                    color: msg.role === "user" ? "#fff" : "#e4e4e7",
                                    border: msg.role === "assistant" ? "1px solid rgba(255,255,255,0.08)" : "none",
                                    boxShadow: msg.role === "assistant" ? "0 4px 15px rgba(0,0,0,0.1)" : "none",
                                    animation: "bubbleIn 0.4s cubic-bezier(0.2, 1, 0.3, 1)"
                                }}>
                                    <ReactMarkdown components={{
                                        p: ({ node, ...props }) => <div style={{ marginBottom: "0.75rem" }} {...props} />,
                                        ul: ({ node, ...props }) => <ul style={{ margin: "0.75rem 0", paddingLeft: "1.25rem", color: "inherit" }} {...props} />,
                                        li: ({ node, ...props }) => <li style={{ marginBottom: "0.4rem" }} {...props} />,
                                        strong: ({ node, ...props }) => <strong style={{ fontWeight: 800, color: msg.role === "user" ? "#fff" : "var(--accent-primary)" }} {...props} />,
                                        table: ({ node, ...props }) => <div style={{ overflowX: "auto", margin: "1rem 0" }}><table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }} {...props} /></div>,
                                        th: ({ node, ...props }) => <th style={{ border: "1px solid rgba(255,255,255,0.1)", padding: "8px", background: "rgba(255,255,255,0.05)", textAlign: "left" }} {...props} />,
                                        td: ({ node, ...props }) => <td style={{ border: "1px solid rgba(255,255,255,0.1)", padding: "8px" }} {...props} />
                                    }}>
                                        {msg.text}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div style={{ alignSelf: "flex-start", padding: "1rem 1.5rem", background: "rgba(255,255,255,0.03)", borderRadius: "20px 20px 20px 4px", border: "1px solid rgba(255,255,255,0.05)" }}>
                                <div style={{ display: "flex", gap: "8px" }}>
                                    <div className="bot-dot" style={{ width: 8, height: 8, background: "var(--accent-primary)", borderRadius: "50%", animation: "botBounce 1s infinite 0s" }}></div>
                                    <div className="bot-dot" style={{ width: 8, height: 8, background: "var(--accent-primary)", borderRadius: "50%", animation: "botBounce 1s infinite 0.2s" }}></div>
                                    <div className="bot-dot" style={{ width: 8, height: 8, background: "var(--accent-primary)", borderRadius: "50%", animation: "botBounce 1s infinite 0.4s" }}></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    {!loading && (
                        <div style={{ 
                            padding: "0.5rem 1.25rem", 
                            display: "flex", 
                            gap: "8px", 
                            overflowX: "auto", 
                            whiteSpace: "nowrap",
                            background: "transparent",
                            scrollbarWidth: "none"
                        }} className="no-scrollbar">
                            {QUICK_ACTIONS.map((action, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSendMessage(null, action.prompt)}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px",
                                        padding: "8px 12px",
                                        borderRadius: "10px",
                                        background: "rgba(255, 255, 255, 0.05)",
                                        border: "1px solid rgba(255, 255, 255, 0.08)",
                                        color: "#a1a1aa",
                                        fontSize: "11px",
                                        fontWeight: 700,
                                        cursor: "pointer",
                                        transition: "all 0.2s"
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.background = "rgba(249, 115, 22, 0.1)";
                                        e.currentTarget.style.borderColor = "rgba(249, 115, 22, 0.3)";
                                        e.currentTarget.style.color = "#fff";
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                                        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                                        e.currentTarget.style.color = "#a1a1aa";
                                    }}
                                >
                                    {action.icon}
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input Area */}
                    <form
                        onSubmit={handleSendMessage}
                        style={{
                            padding: "1.25rem 1.5rem",
                            background: "rgba(255, 255, 255, 0.02)",
                            borderTop: "1px solid rgba(255, 255, 255, 0.05)",
                            display: "flex",
                            alignItems: "center",
                            gap: "1rem",
                        }}
                    >
                        <div style={{ position: "relative", flex: 1 }}>
                            <input
                                placeholder="Command core intelligence..."
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "1rem 1.5rem",
                                    background: "rgba(255, 255, 255, 0.05)",
                                    border: "1px solid rgba(255, 255, 255, 0.08)",
                                    borderRadius: "16px",
                                    fontSize: "14px",
                                    outline: "none",
                                    transition: "all 0.3s",
                                    color: "#fff"
                                }}
                                onFocus={(e) => {
                                    e.target.style.background = "rgba(255, 255, 255, 0.08)";
                                    e.target.style.borderColor = "var(--accent-primary)";
                                }}
                                onBlur={(e) => {
                                    e.target.style.background = "rgba(255, 255, 255, 0.05)";
                                    e.target.style.borderColor = "rgba(255, 255, 255, 0.08)";
                                }}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!input.trim() || loading}
                            style={{
                                width: "52px",
                                height: "52px",
                                borderRadius: "16px",
                                background: input.trim() ? "var(--accent-primary)" : "rgba(255, 255, 255, 0.03)",
                                color: "#fff",
                                border: "none",
                                cursor: input.trim() ? "pointer" : "default",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition: "all 0.3s",
                                boxShadow: input.trim() ? "0 8px 20px rgba(249, 115, 22, 0.3)" : "none"
                            }}
                        >
                            {loading ? (
                                <PlanoraSpinner size={22} color="#fff" />
                            ) : (
                                <Send size={20} strokeWidth={2.5} />
                            )}
                        </button>
                    </form>
                </div>
            )}

            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "20px",
                        background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 10px 30px rgba(234, 88, 12, 0.4), inset 0 1px 1px rgba(255,255,255,0.2)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        cursor: "pointer",
                        transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                        color: "#fff",
                        padding: 0,
                        position: "relative",
                        overflow: "hidden"
                    }}
                    className="ai-trigger-pulse"
                >
                    <MessageSquare size={26} strokeWidth={2.5} />
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "linear-gradient(rgba(255,255,255,0.2), transparent)", pointerEvents: "none" }}></div>
                </button>
            )}
            <style>{`
                @keyframes slideUpChat {
                    from { opacity: 0; transform: translateY(40px) scale(0.95); filter: blur(10px); }
                    to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
                }
                @keyframes bubbleIn {
                    from { opacity: 0; transform: translateY(10px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes botBounce {
                    0%, 100% { transform: translateY(0); opacity: 0.4; }
                    50% { transform: translateY(-8px); opacity: 1; }
                }
                .ai-trigger-pulse:hover {
                    transform: scale(1.1) translateY(-4px) !important;
                    box-shadow: 0 15px 40px rgba(234, 88, 12, 0.5) !important;
                }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .ai-trigger-pulse::after {
                    content: "";
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    background: inherit;
                    border-radius: inherit;
                    z-index: -1;
                    opacity: 0.4;
                    animation: pulseBot 2s infinite;
                }
                @keyframes pulseBot {
                    0% { transform: scale(1); opacity: 0.4; }
                    100% { transform: scale(1.6); opacity: 0; }
                }
            `}</style>
        </div>
    );
}
