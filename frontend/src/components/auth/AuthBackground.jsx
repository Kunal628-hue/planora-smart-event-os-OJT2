import { useEffect, useRef } from "react";
import { animate } from "animejs";

const ORBS = [
    { w: 700, h: 700, top: "-20%", left: "-15%", color: "rgba(59, 130, 246, 0.4)", delay: 0 },
    { w: 600, h: 600, bottom: "-15%", right: "-10%", color: "rgba(139, 92, 246, 0.35)", delay: 1500 },
    { w: 650, h: 650, top: "10%", right: "10%", color: "rgba(34, 211, 238, 0.3)", delay: 800 },
    { w: 500, h: 500, bottom: "10%", left: "10%", color: "rgba(37, 99, 235, 0.3)", delay: 2000 },
];

const SHARDS = [
    { size: 120, top: "15%", left: "10%", color: "#3b82f6", rot: 15, delay: 0 },
    { size: 80, bottom: "20%", right: "15%", color: "#8b5cf6", rot: -20, delay: 400 },
    { size: 90, top: "40%", right: "5%", color: "#22d3ee", rot: 45, delay: 800 },
    { size: 100, bottom: "10%", left: "20%", color: "#2563eb", rot: -10, delay: 1200 },
];

export default function AuthBackground() {
    const containerRef = useRef(null);
    const mouseGlowRef = useRef(null);
    const centerGlowRef = useRef(null);
    const shardRefs = useRef([]);

    useEffect(() => {
        if (!containerRef.current) return;
        const orbs = containerRef.current.querySelectorAll(".auth-orb");

        orbs.forEach((orb, i) => {
            const data = ORBS[i];
            animate(orb, {
                translateX: () => [0, (Math.random() - 0.5) * 300],
                translateY: () => [0, (Math.random() - 0.5) * 300],
                scale: () => [1, 1.4 + Math.random() * 0.3],
                duration: 12000 + Math.random() * 8000,
                delay: data.delay,
                direction: "alternate",
                loop: true,
                easing: "easeInOutSine",
            });
        });

        // Floating shards
        shardRefs.current.forEach((shard, i) => {
            if (!shard) return;
            animate(shard, {
                translateY: [0, -40],
                rotate: [SHARDS[i].rot, SHARDS[i].rot + 30],
                duration: 4000 + Math.random() * 3000,
                direction: "alternate",
                loop: true,
                easing: "easeInOutQuad",
                delay: SHARDS[i].delay
            });
        });

        // Pulsing center glow
        if (centerGlowRef.current) {
            animate(centerGlowRef.current, {
                scale: [0.8, 1.2],
                opacity: [0.3, 0.8],
                duration: 5000,
                direction: "alternate",
                loop: true,
                easing: "easeInOutSine"
            });
        }

        const handleMouseMove = (e) => {
            if (!mouseGlowRef.current) return;
            const { clientX, clientY } = e;
            animate(mouseGlowRef.current, {
                translateX: clientX,
                translateY: clientY,
                duration: 600,
                easing: "outExpo"
            });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    return (
        <div
            ref={containerRef}
            style={{
                position: "absolute",
                inset: 0,
                overflow: "hidden",
                zIndex: 1,
                pointerEvents: "none",
                background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 30%, #312e81 60%, #1e1b4b 100%)"
            }}
        >
            {/* Center glow ring */}
            <div
                ref={centerGlowRef}
                style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    width: "900px",
                    height: "700px",
                    marginTop: "-350px",
                    marginLeft: "-450px",
                    borderRadius: "50%",
                    background: "radial-gradient(ellipse, rgba(59, 130, 246, 0.25) 0%, transparent 70%)",
                    filter: "blur(100px)",
                    zIndex: 0,
                }}
            />

            {/* Mouse following glow - now much hotter */}
            <div
                ref={mouseGlowRef}
                style={{
                    position: "fixed",
                    top: -200,
                    left: -200,
                    width: 400,
                    height: 400,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(96, 165, 250, 0.2) 0%, rgba(59, 130, 246, 0.1) 40%, transparent 80%)",
                    filter: "blur(50px)",
                    zIndex: 5,
                    willChange: "transform"
                }}
            />

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
                        filter: "blur(120px)",
                    }}
                />
            ))}

            {/* Floating shards/geometric shapes */}
            {SHARDS.map((shard, i) => (
                <div
                    key={i}
                    ref={el => shardRefs.current[i] = el}
                    style={{
                        position: "absolute",
                        width: shard.size,
                        height: shard.size,
                        top: shard.top,
                        left: shard.left,
                        right: shard.right,
                        bottom: shard.bottom,
                        background: `linear-gradient(135deg, ${shard.color}20, ${shard.color}05)`,
                        border: `1px solid ${shard.color}30`,
                        borderRadius: i % 2 === 0 ? "24px" : "50%",
                        backdropFilter: "blur(8px)",
                        transform: `rotate(${shard.rot}deg)`,
                        zIndex: 2,
                    }}
                />
            ))}

            {/* Ambient pattern */}
            <div style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)`,
                backgroundSize: "60px 60px",
                opacity: 0.2,
                maskImage: "radial-gradient(circle at center, black, transparent 90%)",
                WebkitMaskImage: "radial-gradient(circle at center, black, transparent 90%)",
                zIndex: 1
            }} />

            {/* Moving lines for extra energy */}
            <div style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(transparent 50%, rgba(59, 130, 246, 0.05) 50%)",
                backgroundSize: "100% 4px",
                zIndex: 1,
                opacity: 0.3
            }} />

            {/* Grain Texture */}
            <div style={{
                position: "absolute",
                inset: 0,
                opacity: 0.06,
                pointerEvents: "none",
                mixBlendMode: "overlay",
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                zIndex: 4
            }} />
        </div>
    );
}
