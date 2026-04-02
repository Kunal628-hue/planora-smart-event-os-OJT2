import { useRef, useEffect, useState } from 'react';

const GooeyNav = ({
  items,
  animationTime = 600,
  particleCount = 15,
  particleDistances = [90, 10],
  particleR = 100,
  timeVariance = 300,
  colors = [1, 2, 3, 1, 2, 3, 1, 4],
  initialActiveIndex = 0
}) => {
  const containerRef = useRef(null);
  const navRef = useRef(null);
  const filterRef = useRef(null);
  const textRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(initialActiveIndex);

  const noise = (n = 1) => n / 2 - Math.random() * n;
  const getXY = (distance, pointIndex, totalPoints) => {
    const angle = ((360 + noise(8)) / totalPoints) * pointIndex * (Math.PI / 180);
    return [distance * Math.cos(angle), distance * Math.sin(angle)];
  };
  const createParticle = (i, t, d, r) => {
    let rotate = noise(r / 10);
    return {
      start: getXY(d[0], particleCount - i, particleCount),
      end: getXY(d[1] + noise(7), particleCount - i, particleCount),
      time: t,
      scale: 1 + noise(0.2),
      color: colors[Math.floor(Math.random() * colors.length)],
      rotate: rotate > 0 ? (rotate + r / 20) * 10 : (rotate - r / 20) * 10
    };
  };
  const makeParticles = element => {
    const d = particleDistances;
    const r = particleR;
    const bubbleTime = animationTime * 2 + timeVariance;
    element.style.setProperty('--time', `${bubbleTime}ms`);
    for (let i = 0; i < particleCount; i++) {
      const t = animationTime * 2 + noise(timeVariance * 2);
      const p = createParticle(i, t, d, r);
      element.classList.remove('active');
      setTimeout(() => {
        const particle = document.createElement('span');
        const point = document.createElement('span');
        particle.classList.add('particle');
        particle.style.setProperty('--start-x', `${p.start[0]}px`);
        particle.style.setProperty('--start-y', `${p.start[1]}px`);
        particle.style.setProperty('--end-x', `${p.end[0]}px`);
        particle.style.setProperty('--end-y', `${p.end[1]}px`);
        particle.style.setProperty('--time', `${p.time}ms`);
        particle.style.setProperty('--scale', `${p.scale}`);
        // For 'multiply' mode, we use darker colors
        const colorMap = {
          1: '#5E5ADB',
          2: '#2563EB',
          3: '#059669',
          4: '#7E4A35'
        };
        particle.style.setProperty('--color', colorMap[p.color] || '#111827');
        particle.style.setProperty('--rotate', `${p.rotate}deg`);
        point.classList.add('point');
        particle.appendChild(point);
        element.appendChild(particle);
        requestAnimationFrame(() => {
          element.classList.add('active');
        });
        setTimeout(() => {
          try {
            element.removeChild(particle);
          } catch {
            // do nothing
          }
        }, t);
      }, 30);
    }
  };
  const updateEffectPosition = element => {
    if (!containerRef.current || !filterRef.current || !textRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const pos = element.getBoundingClientRect();
    const styles = {
      left: `${pos.x - containerRect.x}px`,
      top: `${pos.y - containerRect.y}px`,
      width: `${pos.width}px`,
      height: `${pos.height}px`
    };
    Object.assign(filterRef.current.style, styles);
    Object.assign(textRef.current.style, styles);
    textRef.current.innerText = element.innerText;
  };

  const handleClick = (e, index) => {
    // If it's a real click on the <a>, let's find the <li>
    const liEl = e.currentTarget.closest('li');
    if (!liEl || activeIndex === index) return;
    
    setActiveIndex(index);
    updateEffectPosition(liEl);
    
    if (filterRef.current) {
      const particles = filterRef.current.querySelectorAll('.particle');
      particles.forEach(p => filterRef.current.removeChild(p));
      makeParticles(filterRef.current);
    }
    
    if (textRef.current) {
      textRef.current.classList.remove('active');
      void textRef.current.offsetWidth;
      textRef.current.classList.add('active');
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e, index);
    }
  };

  useEffect(() => {
    if (!navRef.current || !containerRef.current) return;
    
    // Initial position
    const activeLi = navRef.current.querySelectorAll('li')[activeIndex];
    if (activeLi) {
      // Delay slightly to ensure layout is settled
      const timer = setTimeout(() => {
        updateEffectPosition(activeLi);
        textRef.current?.classList.add('active');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeIndex]);

  useEffect(() => {
    const handleResize = () => {
      const currentActiveLi = navRef.current?.querySelectorAll('li')[activeIndex];
      if (currentActiveLi) {
        updateEffectPosition(currentActiveLi);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeIndex]);

  return (
    <>
      <style>
        {`
          .gooey-nav-container {
            position: relative;
            display: inline-block;
          }
          .effect {
            position: absolute;
            opacity: 1;
            pointer-events: none;
            display: grid;
            place-items: center;
            z-index: 2;
          }
          .effect.text {
            color: #374151;
            transition: color 0.3s ease;
            font-size: 0.9rem;
            font-weight: 600;
            white-space: nowrap;
          }
          .effect.text.active {
            color: white;
          }
          .effect.filter {
            filter: blur(8px) contrast(25);
            z-index: 1;
            /* White background and multiply removed to fix white box issue */
          }
          .effect.filter::after {
            content: "";
            position: absolute;
            inset: 0;
            background: #111827;
            transform: scale(0);
            opacity: 0;
            z-index: -1;
            border-radius: 9999px;
          }
          .effect.active::after {
            animation: gooey-pill 0.4s ease forwards;
          }
          @keyframes gooey-pill {
            to {
              transform: scale(1);
              opacity: 1;
            }
          }
          .particle,
          .point {
            display: block;
            width: 24px;
            height: 24px;
            border-radius: 9999px;
          }
          .particle {
            position: absolute;
            top: calc(50% - 12px);
            left: calc(50% - 12px);
            animation: gooey-particle var(--time) ease forwards;
          }
          .point {
            background: var(--color);
            animation: gooey-point var(--time) ease forwards;
          }
          @keyframes gooey-particle {
            0% { transform: rotate(0deg) translate(var(--start-x), var(--start-y)); opacity: 1; }
            70% { transform: rotate(calc(var(--rotate) * 0.5)) translate(calc(var(--end-x) * 1.2), calc(var(--end-y) * 1.2)); opacity: 1; }
            85% { transform: rotate(calc(var(--rotate) * 0.66)) translate(var(--end-x), var(--end-y)); opacity: 1; }
            100% { transform: rotate(calc(var(--rotate) * 1.2)) translate(calc(var(--end-x) * 0.5), calc(var(--end-y) * 0.5)); opacity: 1; }
          }
          @keyframes gooey-point {
            0% { transform: scale(0); opacity: 0; }
            38% { opacity: 1; }
            65% { transform: scale(var(--scale)); opacity: 1; }
            100% { transform: scale(0); opacity: 0; }
          }
          .gooey-nav-list {
            display: flex;
            gap: 0.5rem;
            list-style: none;
            padding: 0 0.5rem;
            margin: 0;
            position: relative;
            z-index: 3;
          }
          .gooey-nav-item {
            position: relative;
          }
          .gooey-nav-link {
            display: block;
            padding: 0.5rem 1.1rem;
            color: #374151;
            font-size: 0.9rem;
            font-weight: 600;
            text-decoration: none;
            transition: color 0.3s ease;
            white-space: nowrap;
          }
          .gooey-nav-item.active .gooey-nav-link {
            color: transparent; /* Hide underlying text to let effect.text show white */
          }
        `}
      </style>
      <div className="gooey-nav-container" ref={containerRef}>
        <ul ref={navRef} className="gooey-nav-list">
          {items.map((item, index) => (
            <li
              key={index}
              className={`gooey-nav-item ${activeIndex === index ? 'active' : ''}`}
            >
              <a
                href={item.href}
                onClick={e => handleClick(e, index)}
                onKeyDown={e => handleKeyDown(e, index)}
                className="gooey-nav-link"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
        <span className="effect filter" ref={filterRef} />
        <span className="effect text" ref={textRef} />
      </div>
    </>
  );
};

export default GooeyNav;
