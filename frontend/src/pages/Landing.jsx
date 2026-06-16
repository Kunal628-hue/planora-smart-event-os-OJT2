import { useEffect, useRef } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import Features from "../components/landing/Features";
import HowItWorks from "../components/landing/HowItWorks";
import Marquee from "../components/landing/Marquee";
import Testimonials from "../components/landing/Testimonials";
import FinalCTA from "../components/landing/FinalCTA";
import Footer from "../components/landing/Footer";
import "../landing.css";

gsap.registerPlugin(ScrollTrigger);

// Load Spline normally or we can keep it lazy since it doesn't affect document scrollHeight,
// but for instant visual we can lazy load it.
import React, { Suspense } from 'react';
const Spline = React.lazy(() => import('@splinetool/react-spline'));
import { Link } from "react-router-dom";

export default function Landing() {
  const containerRef = useRef(null);
  const splineBgRef = useRef(null);
  const heroContentRef = useRef(null);
  const scrollContentRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: "vertical",
      gestureDirection: "vertical",
      smooth: true,
    });

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=2000", // Slightly longer scroll distance since we added more content
          pin: true,
          scrub: true, // Use exactly true to avoid double-smoothing lag with Lenis
          invalidateOnRefresh: true, // Crucial: recalculates function-based values on resize/refresh
        }
      });

      // 1. Slightly scale the 3D Spline and fade it out (using autoAlpha instantly stops WebGL GPU rendering once invisible!)
      tl.to(splineBgRef.current, { scale: 1.5, autoAlpha: 0, duration: 1.5, ease: "power2.inOut" }, 0);
      tl.to(heroContentRef.current, { autoAlpha: 0, duration: 0.3 }, 0);
      
      // Start scrolling the content UP very early (at 0.2s mark)
      // Using function-based values so they dynamically read the latest scrollHeight!
      tl.fromTo(scrollContentRef.current,
        { y: () => window.innerHeight },
        { y: () => -(scrollContentRef.current.scrollHeight - window.innerHeight), duration: 4, ease: "none" },
        0.2
      );

      // Listen for any layout shifts (fonts loading, dynamic content) and tell GSAP to refresh
      const ro = new ResizeObserver(() => {
        ScrollTrigger.refresh();
      });
      if (scrollContentRef.current) {
        ro.observe(scrollContentRef.current);
      }

      return () => ro.disconnect();

    }, containerRef);

    return () => {
      ctx.revert();
      lenis.destroy();
      gsap.ticker.remove((time) => lenis.raf(time * 1000));
    };
  }, []);

  return (
    <div style={{ background: "#000000", color: "#FFFFFF" }}>
      
      {/* Pinned 100vh Viewport */}
      <div ref={containerRef} style={{ width: "100%", height: "100vh", overflow: "hidden", position: "relative" }}>
        
        {/* Absolute Spline Background */}
        <div ref={splineBgRef} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0, filter: "grayscale(1) contrast(1.2) brightness(1.3)" }}>
          <Suspense fallback={null}>
            <Spline scene="https://prod.spline.design/kSAf3vOQ6vxw0iYz/scene.splinecode" />
          </Suspense>
        </div>

        {/* Navbar */}
        <div style={{ position: "absolute", top: 0, width: "100%", padding: "2rem 3rem", display: "flex", justifyContent: "space-between", zIndex: 100, pointerEvents: "none" }}>
            <div style={{ pointerEvents: "auto", display: "flex", alignItems: "center" }}>
                <Link to="/">
                    <img src="/logo-new.svg" alt="Planora" style={{ height: "40px" }} />
                </Link>
            </div>
            <Navbar />
        </div>

        {/* Hero Content (Will fade out) */}
        <div ref={heroContentRef} style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none" }}>
          <Hero />
        </div>

        {/* The Scrolling Content (Will slide up inside the pinned viewport) */}
        <div ref={scrollContentRef} style={{ position: "absolute", top: 0, left: 0, width: "100%", zIndex: 2, pointerEvents: "auto" }}>
           <Features />
           <HowItWorks />
           <Marquee />
           <Testimonials />
           <FinalCTA />
           
           <Footer />
        </div>

      </div>
    </div>
  );
}
