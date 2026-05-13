import { useEffect, useRef } from "react";

export function AnimatedCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationId;
    let mouse = { x: null, y: null };
    let lastFrameTime = 0;
    // Cap at 30 fps to halve GPU/CPU load on desktop while still looking smooth
    const TARGET_FPS = 30;
    const FRAME_INTERVAL = 1000 / TARGET_FPS;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const onMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", () => { mouse.x = null; mouse.y = null; });

    const isMobile = window.innerWidth < 768;
    // Reduced particle count — visually identical, much cheaper to compute
    const PARTICLE_COUNT = isMobile ? 25 : 45;
    const MAX_DIST = 120;
    // Taupe palette to match Electric Ace theme
    const COLOR = "171, 161, 156";

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = Math.random() * 1.5 + 0.8;
        this.opacity = Math.random() * 0.45 + 0.15;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width)  this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${COLOR}, ${this.opacity})`;
        ctx.fill();
      }
    }

    const particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());

    const loop = (timestamp) => {
      animationId = requestAnimationFrame(loop);

      // Frame-rate throttle
      const elapsed = timestamp - lastFrameTime;
      if (elapsed < FRAME_INTERVAL) return;
      lastFrameTime = timestamp - (elapsed % FRAME_INTERVAL);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw particles & mouse connections
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.update();
        p.draw();

        // Mouse lines
        if (mouse.x !== null) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const distSq = dx * dx + dy * dy;
          const threshold = MAX_DIST * 1.5;
          if (distSq < threshold * threshold) {
            const dist = Math.sqrt(distSq);
            const alpha = (1 - dist / threshold) * 0.35;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(${COLOR}, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }

        // Particle-to-particle lines — O(n²) but with early square-distance bail-out
        // and only forward pairs (i < j) to halve iterations
        if (!isMobile) {
          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const distSq = dx * dx + dy * dy;
            if (distSq < MAX_DIST * MAX_DIST) {
              const dist = Math.sqrt(distSq);
              const alpha = (1 - dist / MAX_DIST) * 0.18;
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = `rgba(${COLOR}, ${alpha})`;
              ctx.lineWidth = 0.4;
              ctx.stroke();
            }
          }
        }
      }
    };

    // Start loop with the first valid timestamp
    animationId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0, left: 0,
        width: "100%", height: "100%",
        zIndex: -1,
        pointerEvents: "none",
      }}
    />
  );
}
