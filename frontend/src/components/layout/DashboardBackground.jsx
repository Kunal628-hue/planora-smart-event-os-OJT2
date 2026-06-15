import { useEffect, useRef } from "react";
import { animate } from "animejs";
import InteractiveGrid from "../ui/InteractiveGrid";

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
            }}
        >
            {/* Base Interactive Grid */}
            <InteractiveGrid />

            {/* Subtle orbs for depth - placed on top of grid for blending */}
            <div className="dash-orb" style={{
                position: "absolute",
                top: "10%",
                left: "5%",
                width: "400px",
                height: "400px",
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(249, 115, 22, 0.05) 0%, transparent 70%)",
                filter: "blur(60px)",
                zIndex: 1
            }} />
            <div className="dash-orb" style={{
                position: "absolute",
                bottom: "10%",
                right: "5%",
                width: "500px",
                height: "500px",
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(251, 146, 60, 0.03) 0%, transparent 70%)",
                filter: "blur(70px)",
                zIndex: 1
            }} />
        </div>
    );
}
