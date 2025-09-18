import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
}

interface Circuit {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  opacity: number;
  pulse: number;
}

const AnimatedBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const circuitsRef = useRef<Circuit[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize particles
    const initParticles = () => {
      particlesRef.current = [];
      for (let i = 0; i < 50; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.5 + 0.1,
          life: 0,
          maxLife: Math.random() * 200 + 100
        });
      }
    };

    // Initialize circuits
    const initCircuits = () => {
      circuitsRef.current = [];
      for (let i = 0; i < 15; i++) {
        circuitsRef.current.push({
          x1: Math.random() * canvas.width,
          y1: Math.random() * canvas.height,
          x2: Math.random() * canvas.width,
          y2: Math.random() * canvas.height,
          opacity: Math.random() * 0.3 + 0.1,
          pulse: Math.random() * Math.PI * 2
        });
      }
    };

    initParticles();
    initCircuits();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw circuits
      circuitsRef.current.forEach((circuit, index) => {
        circuit.pulse += 0.02;
        const pulseOpacity = (Math.sin(circuit.pulse) + 1) * 0.5 * circuit.opacity;
        
        ctx.strokeStyle = `rgba(239, 68, 68, ${pulseOpacity})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(circuit.x1, circuit.y1);
        ctx.lineTo(circuit.x2, circuit.y2);
        ctx.stroke();

        // Draw connection nodes
        ctx.fillStyle = `rgba(220, 38, 38, ${pulseOpacity * 2})`;
        ctx.beginPath();
        ctx.arc(circuit.x1, circuit.y1, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(circuit.x2, circuit.y2, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw and update particles
      particlesRef.current.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life++;

        // Wrap around screen
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Fade out near end of life
        const lifeRatio = particle.life / particle.maxLife;
        const currentOpacity = particle.opacity * (1 - lifeRatio);

        // Draw particle
        ctx.fillStyle = `rgba(248, 113, 113, ${currentOpacity})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();

        // Reset particle if life ended
        if (particle.life >= particle.maxLife) {
          particle.x = Math.random() * canvas.width;
          particle.y = Math.random() * canvas.height;
          particle.life = 0;
          particle.maxLife = Math.random() * 200 + 100;
        }
      });

      // Draw connecting lines between nearby particles
      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const p1 = particlesRef.current[i];
          const p2 = particlesRef.current[j];
          const distance = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
          
          if (distance < 100) {
            const opacity = (1 - distance / 100) * 0.1;
            ctx.strokeStyle = `rgba(185, 28, 28, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'transparent' }}
    />
  );
};

export default AnimatedBackground;