import { useEffect, useState } from "react";

export const LogoLoader = ({ text = "Starting Planora..." }) => {
    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100%",
            background: "transparent",
            gap: "2rem",
            padding: "4rem"
        }}>
            <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
                <img 
                    src="/logo-new.svg" 
                    alt="Planora Logo" 
                    style={{
                        height: "3.5rem",
                        width: "auto",
                        display: "block",
                        animation: "pulse-logo 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                        filter: "drop-shadow(0 0 15px rgba(37, 99, 235, 0.2))"
                    }}
                />
                <div style={{
                    position: "absolute",
                    inset: "-20px",
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(37, 99, 235, 0.08) 0%, transparent 70%)",
                    animation: "pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                    zIndex: -1
                }} />
            </div>
            
            <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.75rem"
            }}>
                <p style={{
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: "#64748b",
                    letterSpacing: "0.15em",
                    margin: 0,
                    textAlign: "center",
                    textTransform: "uppercase"
                }}>
                    {text}
                </p>
                
                <div style={{
                    width: "120px",
                    height: "3px",
                    background: "rgba(37, 99, 235, 0.1)",
                    borderRadius: "3px",
                    overflow: "hidden"
                }}>
                    <div style={{
                        width: "100%",
                        height: "100%",
                        background: "#2563eb",
                        transformOrigin: "left",
                        animation: "progress 1.5s ease-in-out infinite"
                    }} />
                </div>
            </div>

            <style>{`
                @keyframes pulse-logo {
                    0%, 100% {
                        transform: scale(1) translateY(0);
                        opacity: 1;
                    }
                    50% {
                        transform: scale(1.05) translateY(-5px);
                        opacity: 0.9;
                    }
                }
                @keyframes pulse-glow {
                    0%, 100% { transform: scale(0.8); opacity: 0.5; }
                    50% { transform: scale(1.2); opacity: 1; }
                }
                @keyframes progress {
                    0% { transform: scaleX(0); transform-origin: left; }
                    50% { transform: scaleX(1); transform-origin: left; }
                    50.1% { transform: scaleX(1); transform-origin: right; }
                    100% { transform: scaleX(0); transform-origin: right; }
                }
            `}</style>
        </div>
    );
};

export const NeuralLoader = ({ text = "Optimizing Flows..." }) => {
    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "2rem",
            padding: "4rem"
        }}>
            <div style={{ position: "relative", width: "80px", height: "80px" }}>
                {/* Center Core */}
                <div style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "20px",
                    height: "20px",
                    background: "#2563eb",
                    borderRadius: "50%",
                    boxShadow: "0 0 20px rgba(37, 99, 235, 0.4)",
                    animation: "pulse 1.5s infinite ease-in-out"
                }} />
                
                {/* Orbitals */}
                {[...Array(3)].map((_, i) => (
                    <div key={i} style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        border: "2px solid rgba(148, 163, 184, 0.15)",
                        borderRadius: "50%",
                        animation: `orbit ${2 + i}s infinite linear`,
                        transform: `scale(${0.6 + i * 0.2})`
                    }}>
                        <div style={{
                            position: "absolute",
                            top: "-4px",
                            left: "50%",
                            width: "8px",
                            height: "8px",
                            background: "#2563eb",
                            borderRadius: "50%",
                            opacity: 0.8 - i * 0.1
                        }} />
                    </div>
                ))}
            </div>
            
            <p style={{
                fontSize: "0.85rem",
                fontWeight: 800,
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                margin: 0,
                textAlign: "center"
            }}>
                {text}
            </p>

            <style>{`
                @keyframes pulse {
                    0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                    50% { transform: translate(-50%, -50%) scale(1.3); opacity: 0.6; }
                }
                @keyframes orbit {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export const PlanoraSpinner = ({ size = 40, color = "#2563eb" }) => (
    <div style={{
        display: "inline-block",
        width: size,
        height: size,
        border: `3px solid ${color}15`,
        borderTop: `3px solid ${color}`,
        borderRadius: "50%",
        animation: "spin 0.8s cubic-bezier(0.5, 0.1, 0.4, 0.9) infinite"
    }}>
        <style>{`
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `}</style>
    </div>
);

export const SkeletonLoader = ({ type = "card" }) => {
    if (type === "card") {
        return (
            <div style={{
                background: "#f8fafc",
                borderRadius: "24px",
                padding: "1.5rem",
                height: "200px",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                overflow: "hidden",
                position: "relative"
            }}>
                <div style={{ width: "40%", height: "20px", background: "#f1f5f9", borderRadius: "10px" }} />
                <div style={{ width: "100%", height: "40px", background: "#f1f5f9", borderRadius: "10px" }} />
                <div style={{ width: "70%", height: "20px", background: "#f1f5f9", borderRadius: "10px" }} />
                <div style={{
                    position: "absolute",
                    top: 0,
                    left: "-100%",
                    width: "100%",
                    height: "100%",
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                    animation: "shimmer 1.5s infinite"
                }} />
                <style>{`
                    @keyframes shimmer {
                        to { left: 100%; }
                    }
                `}</style>
            </div>
        );
    }
    return null;
};
