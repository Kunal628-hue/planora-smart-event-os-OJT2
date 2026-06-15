import React from "react";

export function Skeleton({ className = "", style = {}, width, height, borderRadius }) {
    return (
        <div 
            className={`skeleton ${className}`}
            style={{ 
                width: width || "100%", 
                height: height || "20px", 
                borderRadius: borderRadius || "var(--radius-sm)",
                ...style 
            }}
        />
    );
}

export function TableSkeleton({ rows = 5, columns = 4 }) {
    return (
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "1rem", padding: "1rem" }}>
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} style={{ display: "flex", gap: "1rem" }}>
                    {Array.from({ length: columns }).map((_, j) => (
                        <Skeleton key={j} height="24px" style={{ flex: 1 }} />
                    ))}
                </div>
            ))}
        </div>
    );
}

export function CardSkeleton() {
    return (
        <div style={{ padding: "1.5rem", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", background: "var(--bg-card)" }}>
            <Skeleton width="40px" height="40px" borderRadius="12px" style={{ marginBottom: "1rem" }} />
            <Skeleton width="60%" height="24px" style={{ marginBottom: "0.5rem" }} />
            <Skeleton width="40%" height="16px" style={{ marginBottom: "1.5rem" }} />
            <Skeleton height="36px" borderRadius="8px" />
        </div>
    );
}
