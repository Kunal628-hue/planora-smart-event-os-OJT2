import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function CustomCursor() {
  const cursorRef = useRef(null);
  const followerRef = useRef(null);

  useEffect(() => {
    // Hide default cursor over non-interactive elements, optional but standard for Awwwards
    // We will leave default cursor to allow native feeling, but overlay the custom one.
    
    // Quick dot
    const cursor = cursorRef.current;
    // Trailing ring
    const follower = followerRef.current;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    
    // Smooth positions
    let cx = mouseX;
    let cy = mouseY;
    let fx = mouseX;
    let fy = mouseY;

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener('mousemove', onMouseMove);

    const render = () => {
      // Direct fast follow for dot
      cx += (mouseX - cx) * 0.4;
      cy += (mouseY - cy) * 0.4;
      
      // Spring delay for outer follower
      fx += (mouseX - fx) * 0.1;
      fy += (mouseY - fy) * 0.1;

      gsap.set(cursor, { x: cx, y: cy });
      gsap.set(follower, { x: fx, y: fy });

      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);

    // Hover state detection
    const onMouseEnterLink = () => {
      gsap.to(cursor, { scale: 0, duration: 0.2 });
      gsap.to(follower, { scale: 1.5, borderColor: "rgba(236, 72, 153, 0.8)", backgroundColor: "rgba(236,72,153,0.1)", duration: 0.3 });
    };

    const onMouseLeaveLink = () => {
      gsap.to(cursor, { scale: 1, duration: 0.2 });
      gsap.to(follower, { scale: 1, borderColor: "rgba(37, 99, 235, 0.4)", backgroundColor: "transparent", duration: 0.3 });
    };

    // Attach to all links and buttons
    const attachHoverEvents = () => {
      const interactables = document.querySelectorAll('a, button, input');
      interactables.forEach((el) => {
        el.addEventListener('mouseenter', onMouseEnterLink);
        el.addEventListener('mouseleave', onMouseLeaveLink);
      });
    };

    // Need to reconnect if DOM changes, mutation observer is best
    const observer = new MutationObserver(attachHoverEvents);
    observer.observe(document.body, { childList: true, subtree: true });
    attachHoverEvents();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <div 
        ref={cursorRef} 
        style={{
          position: "fixed",
          top: 0, left: 0,
          width: "6px", height: "6px",
          backgroundColor: "#DB2777",
          borderRadius: "50%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          zIndex: 99999,
          mixBlendMode: "difference"
        }} 
      />
      <div 
        ref={followerRef} 
        style={{
          position: "fixed",
          top: 0, left: 0,
          width: "36px", height: "36px",
          border: "1.5px solid rgba(37, 99, 235, 0.4)",
          borderRadius: "50%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          zIndex: 99998,
          transition: "background-color 0.3s"
        }} 
      />
    </>
  );
}
