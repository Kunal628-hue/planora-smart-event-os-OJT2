import { useState, useEffect } from "react";
import { useDialog } from "../../context/DialogContext";
import { AlertCircle, Info, HelpCircle, X, Check, CreditCard } from "lucide-react";

export default function CustomDialog() {
    const { dialog, closeDialog } = useDialog();
    const [inputValue, setInputValue] = useState("");

    useEffect(() => {
        if (dialog.isOpen) {
            setInputValue(dialog.defaultValue || "");
        }
    }, [dialog.isOpen, dialog.defaultValue]);

    if (!dialog.isOpen) return null;

    // Use AlertCircle for alerts that might be errors/warnings. 
    // Use HelpCircle for confirms.
    const Icon = dialog.type === "alert" ? Info : dialog.type === "confirm" ? HelpCircle : AlertCircle;
    
    // In dark mode, we don't want harsh pure colors if we want it to look elegant like the screenshot.
    // The screenshot has a clean black and white look.
    // Let's use #f4f4f5 for the icon to match the monochrome sleekness.
    const iconColor = dialog.type === "alert" ? "#3b82f6" : dialog.type === "confirm" ? "#f4f4f5" : "#f97316";

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
            background: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(8px)",
            animation: "fade-in 0.2s ease-out"
        }}>
            <div style={{
                width: "100%",
                maxWidth: "420px",
                background: "#18181b", // Matches Dashboard theme
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "24px",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
                padding: "2.5rem 2rem 2rem 2rem",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                animation: "scale-up 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
            }}>
                {/* Close Button */}
                <button 
                    onClick={() => closeDialog(null)}
                    style={{
                        position: "absolute",
                        top: "1.25rem",
                        right: "1.25rem",
                        background: "none",
                        border: "none",
                        color: "#a1a1aa",
                        cursor: "pointer",
                        padding: "6px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.2s"
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                    onMouseLeave={e => e.currentTarget.style.background = "none"}
                >
                    <X size={20} strokeWidth={2} />
                </button>

                {/* Big Icon */}
                <div style={{
                    color: iconColor,
                    marginBottom: "1.5rem"
                }}>
                    <Icon size={48} strokeWidth={1.5} />
                </div>

                <h3 style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    color: "#f4f4f5",
                    margin: "0 0 0.5rem 0",
                    letterSpacing: "-0.02em"
                }}>
                    {dialog.title}
                </h3>

                <p style={{
                    fontSize: "15px",
                    color: "#a1a1aa",
                    lineHeight: 1.5,
                    margin: "0 0 2rem 0"
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
                            padding: "14px 16px",
                            borderRadius: "14px",
                            background: "rgba(0,0,0,0.2)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            fontSize: "15px",
                            color: "#f4f4f5",
                            marginBottom: "2rem",
                            outline: "none",
                            transition: "all 0.2s"
                        }}
                        onFocus={e => {
                            e.target.style.borderColor = "#f97316";
                            e.target.style.boxShadow = "0 0 0 3px rgba(249, 115, 22, 0.1)";
                        }}
                        onBlur={e => {
                            e.target.style.borderColor = "rgba(255,255,255,0.1)";
                            e.target.style.boxShadow = "none";
                        }}
                    />
                )}

                <div style={{ display: "flex", gap: "12px", width: "100%" }}>
                    {(dialog.type === "confirm" || dialog.type === "prompt") && (
                        <button
                            onClick={() => closeDialog(null)}
                            style={{
                                flex: 1,
                                padding: "14px",
                                background: "rgba(255,255,255,0.05)",
                                color: "#f4f4f5",
                                border: "none",
                                borderRadius: "14px",
                                fontSize: "15px",
                                fontWeight: 600,
                                cursor: "pointer",
                                transition: "all 0.2s"
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        onClick={() => closeDialog(dialog.type === "prompt" ? inputValue : true)}
                        style={{
                            flex: 1,
                            padding: "14px",
                            background: dialog.type === "alert" ? "rgba(255,255,255,0.1)" : "#f97316",
                            color: dialog.type === "alert" ? "#f4f4f5" : "#fff",
                            border: "none",
                            borderRadius: "14px",
                            fontSize: "15px",
                            fontWeight: 600,
                            cursor: "pointer",
                            boxShadow: dialog.type !== "alert" ? "0 4px 12px rgba(249, 115, 22, 0.2)" : "none",
                            transition: "all 0.2s"
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
                        onMouseLeave={e => e.currentTarget.style.transform = "none"}
                    >
                        {dialog.type === "alert" ? "Got it" : dialog.type === "confirm" ? "Confirm" : "Submit"}
                    </button>
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
