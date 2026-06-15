import React, { useEffect, useRef } from "react";

/**
 * InteractiveGrid Component
 * 
 * Provides a dark background with a dotted grid that illuminates
 * near the cursor position.
 */
const InteractiveGrid = () => {
    const gridRef = useRef(null);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!gridRef.current) return;
            
            const { clientX, clientY } = e;
            
            // Using requestAnimationFrame for high-performance updates
            window.requestAnimationFrame(() => {
                if (gridRef.current) {
                    gridRef.current.style.setProperty("--mouse-x", `${clientX}px`);
                    gridRef.current.style.setProperty("--mouse-y", `${clientY}px`);
                }
            });
        };

        // Track mouse movement across the entire window
        window.addEventListener("mousemove", handleMouseMove);
        
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);

    return (
        <div 
            ref={gridRef} 
            className="interactive-grid-container"
            aria-hidden="true"
        >
            {/* Base Layer: Static muted dots */}
            <div className="grid-base"></div>
            
            {/* Interactive Layer: Glowing dots revealed by radial mask */}
            <div className="grid-glow"></div>

            <style>{`
                .interactive-grid-container {
                    --mouse-x: -1000px;
                    --mouse-y: -1000px;
                    --grid-gap: 24px;
                    --dot-size: 1.5px;
                    --glow-radius: 200px;
                    
                    position: fixed;
                    inset: 0;
                    z-index: -1;
                    background-color: #1a1d21;
                    pointer-events: none;
                    overflow: hidden;
                }

                .grid-base, .grid-glow {
                    position: absolute;
                    inset: 0;
                    background-image: radial-gradient(
                        circle at center,
                        var(--dot-color) var(--dot-size),
                        transparent 0
                    );
                    background-size: var(--grid-gap) var(--grid-gap);
                    background-position: center;
                }

                .grid-base {
                    --dot-color: #3a3f45;
                    opacity: 0.8;
                }

                .grid-glow {
                    --dot-color: rgba(255, 255, 255, 0.4);
                    z-index: 1;
                    /* Mask reveals this layer only around the cursor */
                    mask-image: radial-gradient(
                        var(--glow-radius) circle at var(--mouse-x) var(--mouse-y),
                        black 0%,
                        transparent 100%
                    );
                    -webkit-mask-image: radial-gradient(
                        var(--glow-radius) circle at var(--mouse-x) var(--mouse-y),
                        black 0%,
                        transparent 100%
                    );
                    transition: opacity 0.3s ease;
                }

                /* Performance optimization: Disable glow on touch devices */
                @media (hover: none) {
                    .grid-glow {
                        display: none;
                    }
                }

                /* Extra subtle depth with a vignette effect */
                .interactive-grid-container::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: radial-gradient(
                        circle at center,
                        transparent 0%,
                        rgba(0, 0, 0, 0.3) 100%
                    );
                    pointer-events: none;
                }
            `}</style>
        </div>
    );
};

export default InteractiveGrid;
