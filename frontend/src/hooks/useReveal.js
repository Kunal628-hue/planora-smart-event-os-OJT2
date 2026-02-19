import { useEffect, useRef } from "react";

/**
 * useReveal
 * Attaches an IntersectionObserver to all .reveal elements inside the ref container.
 * Adds class "visible" (+ optional delay-N classes) when they scroll into view.
 */
export default function useReveal(threshold = 0.12) {
    const ref = useRef(null);

    useEffect(() => {
        const container = ref.current;
        if (!container) return;

        const targets = container.querySelectorAll(".reveal");
        if (!targets.length) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold, rootMargin: "0px 0px -48px 0px" }
        );

        targets.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [threshold]);

    return ref;
}
