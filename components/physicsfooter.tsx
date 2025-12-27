'use client';

import { useRef } from 'react';
import { motion, useSpring, useMotionValue, useAnimationFrame } from 'framer-motion';

const SPRING_CONFIG = { stiffness: 500, damping: 30 };
const BOX_LIMITS = { x: 200, y: 60 };

const PhysicsLetter = ({ letter, mouseX, mouseY }: { letter: string, mouseX: any, mouseY: any }) => {
  const ref = useRef<HTMLDivElement>(null);
  const position = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const lastInteraction = useRef(Date.now());
  const isHovered = useRef(false);

  const x = useSpring(0, SPRING_CONFIG);
  const y = useSpring(0, SPRING_CONFIG);
  const rotate = useSpring(0, SPRING_CONFIG);

  useAnimationFrame(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mX = mouseX.get();
    const mY = mouseY.get();
    const dx = mX - centerX;
    const dy = mY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const radius = 200;

    if (distance < radius && mX > -100) { 
      isHovered.current = true;
      lastInteraction.current = Date.now();
      const forceMagnitude = (1 - distance / radius) * 0.8; 
      velocity.current.x += -(dx / distance) * forceMagnitude;
      velocity.current.y += -(dy / distance) * forceMagnitude;
    } else {
      isHovered.current = false;
    }

    if (Date.now() - lastInteraction.current > 5000) {
      const homingForce = 0.02;
      velocity.current.x -= position.current.x * homingForce;
      velocity.current.y -= position.current.y * homingForce;
      velocity.current.x *= 0.9;
      velocity.current.y *= 0.9;
    }

    velocity.current.x *= 0.98;
    velocity.current.y *= 0.98;
    position.current.x += velocity.current.x;
    position.current.y += velocity.current.y;

    const bounce = 0.8;
    if (position.current.x > BOX_LIMITS.x) { position.current.x = BOX_LIMITS.x; velocity.current.x *= -bounce; }
    else if (position.current.x < -BOX_LIMITS.x) { position.current.x = -BOX_LIMITS.x; velocity.current.x *= -bounce; }
    if (position.current.y > BOX_LIMITS.y) { position.current.y = BOX_LIMITS.y; velocity.current.y *= -bounce; }
    else if (position.current.y < -BOX_LIMITS.y) { position.current.y = -BOX_LIMITS.y; velocity.current.y *= -bounce; }

    x.set(position.current.x);
    y.set(position.current.y);
    rotate.set(velocity.current.x * 2);
  });

  return (
    <motion.div ref={ref} style={{ x, y, rotate }} className="inline-block cursor-default select-none text-4xl md:text-6xl font-serif font-medium text-gray-300 transition-colors duration-300 leading-none will-change-transform">
      {letter === " " ? "\u00A0" : letter}
    </motion.div>
  );
};

export default function PhysicsFooter() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);

  return (
    <div 
      ref={containerRef}
      onMouseMove={(e) => { mouseX.set(e.clientX); mouseY.set(e.clientY); }}
      onMouseLeave={() => { mouseX.set(-1000); mouseY.set(-1000); }}
      className="w-full overflow-hidden py-8 flex justify-center items-center"
    >
      <div className="flex flex-wrap justify-center gap-[0.1em] md:gap-[0.15em] px-4">
        {Array.from("ERC-S is powered by Street Labs").map((char, i) => (
           <PhysicsLetter key={i} letter={char} mouseX={mouseX} mouseY={mouseY} />
        ))}
      </div>
    </div>
  );
}
