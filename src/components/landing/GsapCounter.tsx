import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface GsapCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
}

export const GsapCounter: React.FC<GsapCounterProps> = ({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 2.0,
  className = '',
}) => {
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = spanRef.current;
    if (!el) return;

    const obj = { val: 0 };

    const tween = gsap.to(obj, {
      val: value,
      duration: duration,
      ease: 'power3.out',
      onUpdate: () => {
        if (el) {
          const formatted = decimals > 0 ? obj.val.toFixed(decimals) : Math.round(obj.val).toLocaleString();
          el.innerText = `${prefix}${formatted}${suffix}`;
        }
      },
    });

    return () => {
      tween.kill();
    };
  }, [value, prefix, suffix, decimals, duration]);

  return <span ref={spanRef} className={className}>{prefix}{value.toFixed(decimals)}{suffix}</span>;
};
