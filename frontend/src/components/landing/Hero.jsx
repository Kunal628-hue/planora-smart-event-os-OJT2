import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import NetworkAuroraBackground from "./NetworkAuroraBackground";
import BlurText from "../animations/BlurText";

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const subRef = useRef(null);
  const ctaRef = useRef(null);
  const pill1Ref = useRef(null);
  const authFormVibeRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        pill1Ref.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.2 }
      )
      .fromTo(
        ctaRef.current,
        { y: 20, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.8 },
        "+=0.8"
      )
      .fromTo(
        ".scroll-down",
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 1, ease: "power2.out" },
        "+=0.2"
      )
      .add(() => {
        ScrollTrigger.refresh();
      });

      // Hero Elements Parallax on Scroll - Using fromTo to prevent "disappearing" bug
      gsap.fromTo(titleRef.current, 
        { y: 0, opacity: 1 },
        {
          y: -50,
          opacity: 0,
          ease: "none",
          overwrite: "auto",
          immediateRender: false,
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        }
      );

    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} id="hero" style={{
      position: "relative",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      paddingTop: "4rem",
      background: "#050505",
      overflow: "hidden",
      color: "#FFFFFF",
      fontFamily: "'Inter', sans-serif"
    }}>
      <NetworkAuroraBackground />

      <div style={{ maxWidth: 1000, margin: "0 auto", position: "relative", zIndex: 10, padding: "0 2rem", width: "100%" }}>
        
        {/* Main Text Area */}
        <div style={{ textAlign: "center", position: "relative" }}>
          
          <div ref={pill1Ref} style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "#D1D5DB",
            padding: "0.4rem 1rem",
            borderRadius: "999px",
            fontSize: "0.8rem",
            fontWeight: 500,
            marginBottom: "1.5rem",
            backdropFilter: "blur(12px)"
          }}>
            <span style={{ width: 6, height: 6, background: "#10B981", borderRadius: "50%", boxShadow: "0 0 10px #10B981" }} />
            Planora OS 2.0 Live
          </div>

          <h1 ref={titleRef} style={{
            fontSize: "clamp(3rem, 6vw, 5rem)",
            fontWeight: 600,
            color: "#F9FAFB",
            lineHeight: 1.1,
            letterSpacing: "-0.04em",
            maxWidth: 900,
            margin: "0 auto 1.5rem",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}>
            <BlurText
              text="One-source for Event"
              delay={80}
              animateBy="words"
              direction="top"
              className="mb-2"
            />
            <BlurText
              text="Intelligence"
              delay={50}
              animateBy="letters"
              direction="bottom"
              className="hero-gradient-text inline-block"
            />
          </h1>

          <div ref={subRef} style={{
            fontSize: "1.1rem",
            color: "#9CA3AF",
            maxWidth: 550,
            margin: "0 auto 3rem",
            lineHeight: 1.6,
            fontWeight: 400
          }}>
            <BlurText
              text="Dive into automated event ecosystems, where innovative synchronization meets enterprise-grade execution."
              delay={30}
              animateBy="words"
              direction="top"
            />
          </div>

          <div ref={ctaRef} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
            <Link to="/signup" style={{
              background: "#F9FAFB",
              color: "#030712",
              border: "1px solid rgba(255,255,255,0.1)",
              padding: "0.85rem 1.8rem",
              borderRadius: "999px",
              fontSize: "0.95rem",
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              textDecoration: "none",
              transition: "transform 0.2s, background 0.2s",
              boxShadow: "0 0 20px rgba(255,255,255,0.1)"
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
            >
              Open App ↗
            </Link>

            <a href="#features" style={{
              background: "rgba(255, 255, 255, 0.05)",
              color: "#F9FAFB",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              padding: "0.85rem 1.8rem",
              borderRadius: "999px",
              fontSize: "0.95rem",
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              textDecoration: "none",
              backdropFilter: "blur(10px)",
              transition: "background 0.2s"
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"; }}
            >
              Discover More
            </a>
          </div>
        </div>

      </div>

      {/* Scroll Down Indicator */}
      <div className="scroll-down" style={{
        position: "absolute",
        bottom: "2.5rem",
        left: "2.5rem",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        zIndex: 10
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: "rgba(255,255,255,0.08)",
          display: "flex", alignItems: "center", justifyContent: "center",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "#fff"
        }}>
          ↓
        </div>
        <span style={{ fontSize: "0.75rem", color: "#9CA3AF", letterSpacing: "0.05em", textTransform: "uppercase" }}>01/05 — Scroll down</span>
      </div>

    </section>
  );
}
