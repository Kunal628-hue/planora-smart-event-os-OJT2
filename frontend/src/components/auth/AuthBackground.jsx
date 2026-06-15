import { useEffect, useRef } from "react";
import { animate } from "animejs";
import InteractiveGrid from "../ui/InteractiveGrid";

const ORBS = [
    { w: 900, h: 900, top: "-10%", left: "-5%", color: "rgba(251, 113, 133, 0.15)", delay: 0 }, // Pinkish
    { w: 1000, h: 1000, bottom: "-15%", right: "-5%", color: "rgba(45, 212, 191, 0.15)", delay: 1500 }, // Teal
    { w: 800, h: 800, top: "20%", right: "10%", color: "rgba(139, 92, 246, 0.1)", delay: 800 }, // Purple
];

export default function AuthBackground() {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;
        const orbs = containerRef.current.querySelectorAll(".auth-orb");

        orbs.forEach((orb, i) => {
            const data = ORBS[i];
            animate(orb, {
                translateX: () => [0, (Math.random() - 0.5) * 200],
                translateY: () => [0, (Math.random() - 0.5) * 200],
                scale: () => [1, 1.2],
                duration: 15000,
                delay: data.delay,
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
            }}
        >
            {/* Base Interactive Grid */}
            <InteractiveGrid />

            {ORBS.map((orb, i) => (
                <div
                    key={i}
                    className="auth-orb"
                    style={{
                        position: "absolute",
                        width: orb.w,
                        height: orb.h,
                        top: orb.top,
                        left: orb.left,
                        right: orb.right,
                        bottom: orb.bottom,
                        borderRadius: "50%",
                        background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
                        filter: "blur(100px)",
                        zIndex: 1
                    }}
                />
            ))}

            {/* Grain Texture - reduced opacity to blend with grid better */}
            <div style={{
                position: "absolute",
                inset: 0,
                opacity: 0.1,
                pointerEvents: "none",
                mixBlendMode: "overlay",
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                zIndex: 2
            }} />
        </div>
    );
}
