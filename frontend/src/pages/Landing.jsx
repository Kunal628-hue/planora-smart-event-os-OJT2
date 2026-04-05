import { Suspense, lazy } from "react";
import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
const Features = lazy(() => import("../components/landing/Features"));
const Testimonials = lazy(() => import("../components/landing/Testimonials"));
const Connect = lazy(() => import("../components/landing/Connect"));
import Footer from "../components/landing/Footer";

export default function Landing() {

  return (
    <div style={{ position: "relative", minHeight: "100vh", background: "#030712", color: "#F9FAFB", overflowX: "hidden" }}>
      <style>{`
        html { scroll-behavior: smooth; }
      `}</style>
      <Navbar />
      <Hero />
      <Suspense fallback={null}>
        <Features />
        <Testimonials />
        <Connect />
      </Suspense>

      <Footer />
    </div>
  );
}
