import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface GsapTickerProps {
  items: Array<{
    title: string;
    tag: string;
    icon: string;
  }>;
  speed?: number;
  direction?: 'left' | 'right';
}

export const GsapTicker: React.FC<GsapTickerProps> = ({
  items,
  speed = 40,
  direction = 'left',
}) => {
  const tickerRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    const el = tickerRef.current;
    if (!el) return;

    const totalWidth = el.scrollWidth / 2;

    const fromX = direction === 'left' ? 0 : -totalWidth;
    const toX = direction === 'left' ? -totalWidth : 0;

    tweenRef.current = gsap.fromTo(
      el,
      { x: fromX },
      {
        x: toX,
        duration: speed,
        ease: 'none',
        repeat: -1,
      }
    );

    return () => {
      tweenRef.current?.kill();
    };
  }, [items, speed, direction]);

  const handleMouseEnter = () => {
    tweenRef.current?.timeScale(0.3); // smooth slow-down on hover
  };

  const handleMouseLeave = () => {
    tweenRef.current?.timeScale(1);
  };

  // Double the items to make the loop seamless
  const duplicatedItems = [...items, ...items];

  return (
    <div
      className="relative w-full overflow-hidden py-3 border-y border-outline-variant/20 bg-surface-container-low/40 backdrop-blur-sm select-none"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Edge gradient masks for high-end look */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-surface to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-surface to-transparent z-10 pointer-events-none" />

      <div ref={tickerRef} className="flex gap-6 whitespace-nowrap will-change-transform">
        {duplicatedItems.map((item, idx) => (
          <div
            key={idx}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-surface-container-lowest/80 border border-outline-variant/30 text-on-surface shadow-xs hover:border-primary/50 transition-colors"
          >
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-[13px]">
              <span className="material-symbols-outlined text-[14px]">{item.icon}</span>
            </span>
            <span className="font-semibold text-sm tracking-tight text-on-surface">
              {item.title}
            </span>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-secondary-container/50 text-on-secondary-container">
              {item.tag}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
