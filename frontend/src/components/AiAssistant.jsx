import { useState, useRef, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import { MessageSquare, Sparkles, X as CloseIcon, Send, Trash2, Zap, ShieldAlert, BarChart3, ChevronLeft, Clock, Smile, Paperclip, Database } from "lucide-react";
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
        <div style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 1000, fontFamily: "'Inter', sans-serif", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "1rem" }}>
            {isOpen && (
                <div style={{
                    width: "380px",
                    height: "600px",
                    maxHeight: "calc(100vh - 120px)",
                    display: "flex",
                    flexDirection: "column",
                    background: "var(--bg-surface)",
                    borderRadius: "24px",
                    overflow: "hidden",
                    border: "1px solid var(--border-subtle)",
                    boxShadow: "0 25px 60px -12px rgba(0, 0, 0, 0.8)",
                    animation: "slideUpChat 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                    transformOrigin: "bottom right"
                }}>
                    {/* Header */}
                    <div style={{
                        padding: "1.25rem 1.5rem",
                        background: "var(--accent-primary)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderTopLeftRadius: "24px",
                        borderTopRightRadius: "24px"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                            <button onClick={() => setIsOpen(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", padding: 0 }}>
                                <ChevronLeft size={24} />
                            </button>
                            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                                <div style={{
                                    width: "40px",
                                    height: "40px",
                                    background: "#0f172a",
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    boxShadow: "0 0 10px rgba(0,0,0,0.2)",
                                    border: "2px solid rgba(255,255,255,0.2)",
                                    zIndex: 2
                                }}>
                                    <Sparkles size={18} color="#fff" />
                                </div>
                                <div style={{
                                    width: "40px",
                                    height: "40px",
                                    background: "#1e293b",
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    border: "2px solid rgba(255,255,255,0.2)",
                                    marginLeft: "-15px",
                                    zIndex: 1
                                }}>
                                    <BarChart3 size={16} color="rgba(255,255,255,0.6)" />
                                </div>
                            </div>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: "16px", color: "#fff" }}>Planora Intelligence</div>
                                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                                    <Clock size={10} /> Active now
                                </div>
                            </div>
                        </div>
                        <button onClick={clearChat} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)", cursor: "pointer", padding: "8px" }} title="Clear context">
                            <Trash2 size={16} />
                        </button>
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
                        {messages.map((msg, idx) => {
                            const isBot = msg.role === "assistant";
                            return (
                                <div key={idx} style={{
                                    alignSelf: isBot ? "flex-start" : "flex-end",
                                    maxWidth: "92%",
                                    position: "relative",
                                    display: "flex",
                                    gap: "10px",
                                    alignItems: "flex-end"
                                }}>
                                    {isBot && (
                                        <div style={{
                                            width: "32px", height: "32px", borderRadius: "50%", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", flexShrink: 0
                                        }}>
                                            <Database size={16} />
                                        </div>
                                    )}
                                    <div style={{
                                        padding: "1rem 1.25rem",
                                        borderRadius: "20px",
                                        borderBottomRightRadius: !isBot ? "4px" : "20px",
                                        borderBottomLeftRadius: isBot ? "4px" : "20px",
                                        fontSize: "13.5px",
                                        fontWeight: 500,
                                        lineHeight: "1.6",
                                        background: !isBot ? "var(--accent-primary)" : "var(--bg-elevated)",
                                        color: !isBot ? "#fff" : "var(--text-primary)",
                                        border: isBot ? "1px solid var(--border-subtle)" : "none",
                                        boxShadow: isBot ? "0 4px 15px rgba(0,0,0,0.05)" : "0 4px 15px rgba(249, 115, 22, 0.2)",
                                        animation: "bubbleIn 0.4s cubic-bezier(0.2, 1, 0.3, 1)"
                                    }}>
                                        <ReactMarkdown components={{
                                            p: ({ node, ...props }) => <div style={{ marginBottom: "0.75rem" }} {...props} />,
                                            ul: ({ node, ...props }) => <ul style={{ margin: "0.75rem 0", paddingLeft: "1.25rem", color: "inherit" }} {...props} />,
                                            li: ({ node, ...props }) => <li style={{ marginBottom: "0.4rem" }} {...props} />,
                                            strong: ({ node, ...props }) => <strong style={{ fontWeight: 800, color: !isBot ? "#fff" : "var(--accent-primary)" }} {...props} />,
                                            table: ({ node, ...props }) => <div style={{ overflowX: "auto", margin: "1rem 0" }}><table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }} {...props} /></div>,
                                            th: ({ node, ...props }) => <th style={{ border: "1px solid var(--border-subtle)", padding: "8px", background: "var(--bg-surface)", textAlign: "left" }} {...props} />,
                                            td: ({ node, ...props }) => <td style={{ border: "1px solid var(--border-subtle)", padding: "8px" }} {...props} />
                                        }}>
                                            {msg.text}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            );
                        })}
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
                            padding: "0 1.5rem", 
                            display: "flex", 
                            flexDirection: "column",
                            alignItems: "flex-end",
                            gap: "8px", 
                            background: "transparent",
                        }}>
                            {QUICK_ACTIONS.map((action, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSendMessage(null, action.prompt)}
                                    style={{
                                        padding: "10px 16px",
                                        borderRadius: "8px",
                                        background: "#1a1b35", // Darker indigo like the screenshot
                                        border: "none",
                                        color: "#818cf8",
                                        fontSize: "12.5px",
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        transition: "all 0.2s",
                                        animation: `bubbleIn 0.4s cubic-bezier(0.2, 1, 0.3, 1) ${i * 0.1}s both`
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.background = "#23254a";
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = "#1a1b35";
                                    }}
                                >
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
                            background: "transparent",
                            display: "flex",
                            alignItems: "center",
                        }}
                    >
                        <div style={{
                            position: "relative", 
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            background: "var(--bg-elevated)",
                            border: "1px solid var(--border-subtle)",
                            borderRadius: "24px",
                            padding: "0.5rem 1rem",
                            boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
                        }}>
                            <input
                                placeholder="Write a reply..."
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                style={{
                                    flex: 1,
                                    background: "transparent",
                                    border: "none",
                                    fontSize: "13px",
                                    outline: "none",
                                    color: "var(--text-primary)"
                                }}
                            />
                            {input.trim() ? (
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        width: "32px",
                                        height: "32px",
                                        borderRadius: "50%",
                                        background: "var(--accent-primary)",
                                        color: "#fff",
                                        border: "none",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginLeft: "8px"
                                    }}
                                >
                                    {loading ? <PlanoraSpinner size={16} color="#fff" /> : <Send size={14} strokeWidth={2.5} />}
                                </button>
                            ) : (
                                <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text-muted)", marginLeft: "8px" }}>
                                    <button onClick={() => setInput(prev => prev + '😊 ')} type="button" style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0, display: "flex", alignItems: "center" }}><Smile size={18} /></button>
                                    <label style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
                                        <input type="file" style={{ display: "none" }} onChange={(e) => { if(e.target.files[0]) setInput(prev => prev + `[Attached: ${e.target.files[0].name}] `) }} />
                                        <Paperclip size={18} />
                                    </label>
                                </div>
                            )}
                        </div>
                    </form>
                </div>
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    background: "var(--accent-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 10px 30px rgba(0,0,0, 0.4)",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                    color: "#fff",
                    padding: 0,
                    position: "relative",
                    overflow: "hidden"
                }}
                className={!isOpen ? "ai-trigger-pulse" : ""}
            >
                {isOpen ? <CloseIcon size={28} strokeWidth={2.5} /> : <MessageSquare size={26} strokeWidth={2.5} />}
                {!isOpen && <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "linear-gradient(rgba(255,255,255,0.2), transparent)", pointerEvents: "none" }}></div>}
            </button>
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
