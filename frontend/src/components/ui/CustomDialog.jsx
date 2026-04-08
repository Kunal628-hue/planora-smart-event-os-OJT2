import { useState, useEffect } from "react";
import { useDialog } from "../../context/DialogContext";
import { AlertTriangle, Info, HelpCircle, X, Check } from "lucide-react";

export default function CustomDialog() {
    const { dialog, closeDialog } = useDialog();
    const [inputValue, setInputValue] = useState("");

    useEffect(() => {
        if (dialog.isOpen) {
            setInputValue(dialog.defaultValue || "");
        }
    }, [dialog.isOpen, dialog.defaultValue]);

    if (!dialog.isOpen) return null;

    const Icon = dialog.type === "alert" ? Info : dialog.type === "confirm" ? HelpCircle : AlertTriangle;
    const iconColor = dialog.type === "alert" ? "#2563eb" : dialog.type === "confirm" ? "#f59e0b" : "#ef4444";

    return (
        <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            background: "rgba(15, 23, 42, 0.4)",
            backdropFilter: "blur(8px)",
            animation: "fade-in 0.2s ease-out"
        }}>
            <div style={{
                width: "100%",
                maxWidth: "400px",
                background: "#fff",
                borderRadius: "24px",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                padding: "2rem",
                position: "relative",
                overflow: "hidden",
                animation: "scale-up 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
            }}>
                {/* Close Button */}
                <button 
                    onClick={() => closeDialog(null)}
                    style={{
                        position: "absolute",
                        top: "1.5rem",
                        right: "1.5rem",
                        background: "none",
                        border: "none",
                        color: "#94a3b8",
                        cursor: "pointer",
                        padding: "4px",
                        borderRadius: "8px",
                        transition: "all 0.2s"
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f1f5f9"}
                    onMouseLeave={e => e.currentTarget.style.background = "none"}
                >
                    <X size={18} />
                </button>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                    <div style={{
                        width: "56px",
                        height: "56px",
                        borderRadius: "16px",
                        background: `${iconColor}10`,
                        color: iconColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "1.5rem"
                    }}>
                        <Icon size={28} />
                    </div>

                    <h3 style={{
                        fontSize: "20px",
                        fontWeight: 800,
                        color: "#1e293b",
                        margin: "0 0 0.75rem 0",
                        letterSpacing: "-0.02em"
                    }}>
                        {dialog.title}
                    </h3>

                    <p style={{
                        fontSize: "15px",
                        color: "#64748b",
                        lineHeight: 1.6,
                        margin: "0 0 1.5rem 0"
                    }}>
                        {dialog.message}
                    </p>

                    {dialog.type === "prompt" && (
                        <input 
                            autoFocus
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && closeDialog(inputValue)}
                            style={{
                                width: "100%",
                                padding: "12px 16px",
                                borderRadius: "12px",
                                border: "2px solid #e2e8f0",
                                fontSize: "14px",
                                fontWeight: 600,
                                color: "#1e293b",
                                marginBottom: "1.5rem",
                                outline: "none",
                                transition: "all 0.2s"
                            }}
                            onFocus={e => e.target.style.borderColor = "#2563eb"}
                            onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                        />
                    )}

                    <div style={{ display: "flex", gap: "12px", width: "100%" }}>
                        {(dialog.type === "confirm" || dialog.type === "prompt") && (
                            <button
                                onClick={() => closeDialog(null)}
                                style={{
                                    flex: 1,
                                    padding: "0.85rem",
                                    background: "#f1f5f9",
                                    color: "#475569",
                                    border: "none",
                                    borderRadius: "12px",
                                    fontSize: "14px",
                                    fontWeight: 700,
                                    cursor: "pointer",
                                    transition: "all 0.2s"
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = "#e2e8f0"}
                                onMouseLeave={e => e.currentTarget.style.background = "#f1f5f9"}
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            onClick={() => closeDialog(dialog.type === "prompt" ? inputValue : true)}
                            style={{
                                flex: 1,
                                padding: "0.85rem",
                                background: "var(--accent-primary, #2563eb)",
                                color: "#fff",
                                border: "none",
                                borderRadius: "12px",
                                fontSize: "14px",
                                fontWeight: 700,
                                cursor: "pointer",
                                boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)",
                                transition: "all 0.2s"
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
                            onMouseLeave={e => e.currentTarget.style.transform = "none"}
                        >
                            {dialog.type === "alert" ? "Got it" : dialog.type === "confirm" ? "Confirm" : "Submit"}
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scale-up {
                    from { opacity: 0; transform: scale(0.95) translateY(10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
        </div>
    );
}
