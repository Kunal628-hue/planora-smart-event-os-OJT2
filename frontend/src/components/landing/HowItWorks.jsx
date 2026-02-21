import { useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import useReveal from "../../hooks/useReveal";

const STEPS = [
    {
        number: "01",
        title: "Configure Your Event",
        desc: "Define budgets, timelines, committees, and strategic goals in minutes.",
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
        ),
        color: "#3b82f6",
    },
    {
        number: "02",
        title: "Coordinate Operations",
        desc: "Assign responsibilities, monitor milestones, and align teams through structured workflows.",
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
        ),
        color: "#2563eb",
    },
    {
        number: "03",
        title: "Execute With Precision",
        desc: "Track real-time metrics, receive intelligent alerts, and generate comprehensive post-event reports.",
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
        ),
        color: "#22d3ee",
    },
];

function StepCard({ step, index, active }) {
    return (
        <div
            className={`reveal delay-${index + 1}`}
            style={{ textAlign: "center", position: "relative", zIndex: 1 }}
        >
            {/* Animated circle */}
            <div style={{ position: "relative", width: 90, height: 90, margin: "0 auto 2rem" }}>
                {/* Outer orbit ring — spins when active */}
                <div style={{
                    position: "absolute", inset: -8, borderRadius: "50%",
                    border: `1.5px dashed ${step.color}40`,
                    animation: active ? "spin-slow 8s linear infinite" : "none",
                    transition: "opacity 0.4s",
                    opacity: active ? 1 : 0.35,
                }} />
                {/* Glow for active */}
                {active && (
                    <div style={{
                        position: "absolute", inset: -4, borderRadius: "50%",
                        boxShadow: `0 0 32px ${step.color}40`,
                        animation: "pulse-glow 2.4s ease infinite",
                    }} />
                )}
                {/* Circle body */}
                <div style={{
                    width: 90, height: 90, borderRadius: "50%",
                    background: active
                        ? `linear-gradient(135deg, ${step.color}30, ${step.color}10)`
                        : "rgba(255,255,255,0.03)",
                    border: `1.5px solid ${active ? step.color + "60" : "rgba(255,255,255,0.07)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: active ? step.color : "var(--text-muted)",
                    transition: "all 0.4s ease",
                    position: "relative",
                }}>
                    {step.icon}
                </div>
                {/* Number badge */}
                <span style={{
                    position: "absolute", top: -4, right: -4,
                    width: 24, height: 24, borderRadius: "50%",
                    background: active ? `linear-gradient(135deg, ${step.color}, ${step.color}cc)` : "var(--bg-elevated)",
                    border: `1px solid ${step.color}40`,
                    fontSize: "0.62rem", fontWeight: 800,
                    color: active ? "#fff" : "var(--text-muted)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.4s ease",
                    boxShadow: active ? `0 0 12px ${step.color}50` : "none",
                }}>
                    {index + 1}
                </span>
            </div>

            <h3 style={{
                fontSize: "1.05rem", fontWeight: 700, marginBottom: "0.65rem",
                color: active ? "var(--text-primary)" : "var(--text-secondary)",
                transition: "color 0.4s",
            }}>
                {step.title}
            </h3>
            <p style={{
                fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.74,
                maxWidth: 280, margin: "0 auto",
            }}>
                {step.desc}
            </p>
        </div>
    );
}

export default function HowItWorks() {
    const ref = useReveal();
    const [activeStep, setActiveStep] = useState(0);
    const lineRef = useRef(null);

    /* Auto-cycle step highlight */
    useEffect(() => {
        const id = setInterval(() => {
            setActiveStep((s) => (s + 1) % STEPS.length);
        }, 2200);
        return () => clearInterval(id);
    }, []);

    /* Animate the connector line width */
    useEffect(() => {
        if (!lineRef.current) return;
        animate(lineRef.current, {
            width: ["0%", "100%"],
            opacity: [0, 1],
            duration: 1200,
            easing: "outCubic",
            delay: 400,
        });
    }, []);

    return (
        <section id="how-it-works" className="section-pad" ref={ref}>
            <div className="page-container">
                <div style={{ textAlign: "center", maxWidth: 560, margin: "0 auto 5rem" }}>
                    <p className="overline reveal" style={{ marginBottom: "1rem" }}>Launch and Execute in Three Steps</p>
                    <h2 className="reveal delay-1" style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.6rem)", marginBottom: "1rem" }}>
                        From strategy to remarkable experience
                    </h2>
                    <p className="reveal delay-2" style={{ color: "var(--text-secondary)", fontSize: "0.975rem" }}>
                        Planora removes all operational friction so your team can focus on delivering a remarkable experience.
                    </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2rem", position: "relative" }}>
                    {/* Animated connector line */}
                    <div style={{
                        position: "absolute", top: 44, left: "calc(16.66%)",
                        right: "calc(16.66%)", height: 2,
                        background: "var(--border-subtle)", pointerEvents: "none",
                    }}>
                        <div ref={lineRef} style={{
                            height: "100%", width: "0%",
                            background: "linear-gradient(90deg, #3b82f6, #2563eb, #22d3ee)",
                            borderRadius: 1, opacity: 0,
                        }} />
                    </div>

                    {STEPS.map((step, i) => (
                        <StepCard key={step.number} step={step} index={i} active={activeStep === i} />
                    ))}
                </div>

                {/* Step indicator dots */}
                <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "3rem" }}>
                    {STEPS.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setActiveStep(i)}
                            style={{
                                width: activeStep === i ? 24 : 7,
                                height: 7, borderRadius: 4,
                                background: activeStep === i ? "#3b82f6" : "var(--border-subtle)",
                                border: "none", cursor: "pointer",
                                transition: "all 0.35s ease",
                                boxShadow: activeStep === i ? "0 0 10px rgba(59,130,246,0.5)" : "none",
                            }}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
