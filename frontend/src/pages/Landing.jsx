import React, { useEffect, useRef, useState, Suspense, lazy } from "react";
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
import { Link } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger);

const Spline = lazy(() => import('@splinetool/react-spline'));

export default function Landing() {
  const containerRef = useRef(null);
  const splineBgRef = useRef(null);
  const heroContentRef = useRef(null);
  const scrollContentRef = useRef(null);
  
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
          end: "+=2000",
          pin: true,
          scrub: true,
          invalidateOnRefresh: true,
        }
      });

      tl.to(splineBgRef.current, { scale: 1.5, autoAlpha: 0, duration: 1.5, ease: "power2.inOut" }, 0);
      tl.to(heroContentRef.current, { autoAlpha: 0, duration: 0.3 }, 0);
      
      tl.fromTo(scrollContentRef.current,
        { y: () => window.innerHeight },
        { y: () => -(scrollContentRef.current.scrollHeight - window.innerHeight), duration: 4, ease: "none" },
        0.2
      );

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
    <div style={{ background: "#000000", color: "#FFFFFF", overflowX: "hidden" }}>
      
      {/* Viewport Wrapper */}
      <div 
        ref={containerRef} 
        style={{ 
          width: "100%", 
          height: "100vh", 
          overflow: "hidden", 
          position: "relative" 
        }}
      >
        
        {/* Absolute Spline Background */}
        <div 
          ref={splineBgRef} 
          style={{ 
            position: "absolute", 
            top: 0, 
            left: 0, 
            width: "100%", 
            height: "100%", 
            zIndex: 0, 
            filter: "grayscale(1) contrast(1.2) brightness(1.3)",
            display: "block",
            pointerEvents: "none"
          }}
        >
          <Suspense fallback={null}>
            <Spline scene="https://prod.spline.design/kSAf3vOQ6vxw0iYz/scene.splinecode" />
          </Suspense>
        </div>

        {/* Navbar */}
        <div style={{ 
          position: "absolute", 
          top: 0, 
          width: "100%", 
          padding: isMobile ? "1.5rem 1.5rem" : "2rem 3rem", 
          display: "flex", 
          justifyContent: "space-between", 
          zIndex: 100, 
          pointerEvents: "none" 
        }}>
            <div style={{ pointerEvents: "auto", display: "flex", alignItems: "center" }}>
                <Link to="/">
                    <img src="/logo-new.svg" alt="Planora" style={{ height: isMobile ? "28px" : "40px" }} />
                </Link>
            </div>
            <Navbar />
        </div>

        {/* Hero Content (Will fade out on desktop/mobile scroll) */}
        <div 
          ref={heroContentRef} 
          style={{ 
            position: "absolute", 
            inset: 0, 
            zIndex: 1, 
            pointerEvents: "none" 
          }}
        >
          <Hero />
        </div>

        {/* The Scrolling Content */}
        <div 
          ref={scrollContentRef} 
          style={{ 
            position: "absolute", 
            top: 0, 
            left: 0, 
            width: "100%", 
            zIndex: 2, 
            pointerEvents: "auto" 
          }}
        >
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
