import { useEffect, useRef } from "react";
import { animate } from "animejs";

export default function DashboardBackground() {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const orbs = containerRef.current.querySelectorAll(".dash-orb");
        orbs.forEach((orb, i) => {
            animate(orb, {
                translateX: () => [0, (Math.random() - 0.5) * 150],
                translateY: () => [0, (Math.random() - 0.5) * 150],
                scale: () => [1, 1.2 + Math.random() * 0.2],
                duration: 15000 + Math.random() * 10000,
                direction: "alternate",
                loop: true,
                easing: "easeInOutSine",
            });
        });
    }, []);

    return (
        <div
            ref={containerRef}
            style={{
                position: "absolute",
                inset: 0,
                overflow: "hidden",
                zIndex: 0,
                pointerEvents: "none",
                background: "var(--bg-base)"
            }}
        >
            {/* Subtle orbs for depth */}
            <div className="dash-orb" style={{
                position: "absolute",
                top: "10%",
                left: "5%",
                width: "400px",
                height: "400px",
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(37, 99, 235, 0.03) 0%, transparent 70%)",
                filter: "blur(60px)",
            }} />
            <div className="dash-orb" style={{
                position: "absolute",
                bottom: "10%",
                right: "5%",
                width: "500px",
                height: "500px",
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(139, 92, 246, 0.03) 0%, transparent 70%)",
                filter: "blur(70px)",
            }} />

            {/* Subtle grid */}
            <div style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `radial-gradient(rgba(0, 0, 0, 0.02) 1px, transparent 1px)`,
                backgroundSize: "40px 40px",
                opacity: 0.5,
                zIndex: 1
            }} />
        </div>
    );
}
