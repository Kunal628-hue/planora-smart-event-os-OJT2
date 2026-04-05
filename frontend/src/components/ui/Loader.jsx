import { useEffect, useState } from "react";

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
