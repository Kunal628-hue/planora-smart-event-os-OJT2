import React, { useEffect, useRef } from 'react';

const NeuralFlow = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = canvas.offsetWidth;
    let height = canvas.offsetHeight;
    
    // Set internal resolution
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const particles = [];
    const particleCount = 20;

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = height + Math.random() * 20;
        this.speed = 0.5 + Math.random() * 1.5;
        this.size = 1 + Math.random() * 2;
        this.opacity = 0.1 + Math.random() * 0.5;
        this.amplitude = 10 + Math.random() * 30;
        this.frequency = 0.01 + Math.random() * 0.02;
        this.offset = Math.random() * 1000;
      }

      update() {
        this.y -= this.speed;
        this.x += Math.sin(this.y * this.frequency + this.offset) * 0.5;
        
        if (this.y < -20) {
          this.reset();
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(96, 165, 250, ${this.opacity})`;
        ctx.fill();
        
        // Add a subtle glow
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(59, 130, 246, 0.5)';
      }
    }

    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    const drawGrid = () => {
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.05)';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < width; i += 20) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, height);
            ctx.stroke();
        }
        for (let i = 0; i < height; i += 20) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(width, i);
            ctx.stroke();
        }
    };

    const render = (time) => {
      ctx.clearRect(0, 0, width, height);
      
      // Draw background glow
      const gradient = ctx.createLinearGradient(0, height, 0, 0);
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0)');
      gradient.addColorStop(1, 'rgba(59, 130, 246, 0.05)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Draw Main Wave
      ctx.beginPath();
      ctx.moveTo(0, height);
      
      ctx.strokeStyle = 'rgba(96, 165, 250, 0.8)';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (let i = 0; i <= width; i += 2) {
        const x = i;
        const s1 = Math.sin(time * 0.002 + i * 0.01) * 15;
        const s2 = Math.sin(time * 0.001 + i * 0.005) * 10;
        const y = height * 0.6 + s1 + s2;
        ctx.lineTo(x, y);
      }
      
      ctx.stroke();

      // Draw area under wave
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      const fillGradient = ctx.createLinearGradient(0, 0, 0, height);
      fillGradient.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
      fillGradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
      ctx.fillStyle = fillGradient;
      ctx.fill();

      // Update and draw particles
      particles.forEach(p => {
        p.update();
        p.draw();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ 
        width: '100%', 
        height: '100%',
        display: 'block'
      }} 
    />
  );
};

export default NeuralFlow;
