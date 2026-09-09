import React, { useState } from 'react';

interface BrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  variant?: 'image' | 'vector';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'sm',
  showText = true,
  className = '',
  variant = 'image',
}) => {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    xs: 'h-6 w-auto',
    sm: 'h-8 w-auto',
    md: 'h-10 w-auto',
    lg: 'h-14 w-auto',
    xl: 'h-20 w-auto',
  };

  const imgSizeMap = {
    xs: 'h-6 min-w-6',
    sm: 'h-8 min-w-8',
    md: 'h-10 min-w-10',
    lg: 'h-14 min-w-14',
    xl: 'h-20 min-w-20',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* High-Resolution MRP Logo */}
      {!imgError && variant !== 'vector' ? (
        <div className="relative flex items-center justify-center rounded-lg overflow-hidden shrink-0 transition-transform duration-200 hover:scale-105">
          <img
            src={`${import.meta.env.BASE_URL}logo.png`}
            alt="MRP Logo"
            className={`${imgSizeMap[size]} object-contain rounded-lg drop-shadow-sm`}
            onError={() => setImgError(true)}
            referrerPolicy="no-referrer"
          />
        </div>
      ) : (
        /* Crisp Vector Monogram Fallback */
        <svg
          viewBox="0 0 400 240"
          className={`${sizeClasses[size]} shrink-0 drop-shadow-xs`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="MRP Logo"
        >
          <defs>
            <linearGradient id="mrp-blue" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#1e3a8a" />
            </linearGradient>
            <linearGradient id="mrp-navy" x1="0" y1="0" x2="0.8" y2="1">
              <stop offset="0%" stopColor="#1e40af" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="mrp-swoosh" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <linearGradient id="mrp-teal" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="60%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>

          {/* Letter M */}
          <path
            d="M20 200V40L80 120L140 40V200H100V105L80 135L60 105V200H20Z"
            fill="url(#mrp-blue)"
          />

          {/* Letter R */}
          <path
            d="M140 40H220C245 40 265 55 265 80C265 105 245 120 220 120H180V200H140V40ZM180 75V90H215C225 90 230 85 230 80C230 75 225 70 215 70H180V75Z"
            fill="url(#mrp-navy)"
          />
          <path
            d="M185 120L250 200H205L155 135H185L185 120Z"
            fill="url(#mrp-blue)"
          />

          {/* Dynamic Swoosh */}
          <path
            d="M100 200C135 170 185 130 250 120C210 135 160 175 100 200Z"
            fill="url(#mrp-swoosh)"
          />

          {/* Letter P */}
          <path
            d="M245 40H325C355 40 380 60 380 90C380 120 355 140 325 140H285V200H245V40ZM285 75V105H320C335 105 345 98 345 90C345 82 335 75 320 75H285Z"
            fill="url(#mrp-teal)"
          />
        </svg>
      )}

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1 leading-none">
            <span className="font-display-xl font-extrabold text-base sm:text-lg tracking-tight text-on-surface">
              MRP
            </span>
            <span className="font-display-xl font-bold text-base sm:text-lg text-primary tracking-tight">
              Interestly
            </span>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-secondary -mt-0.5 hidden sm:inline">
            Financial Suite
          </span>
        </div>
      )}
    </div>
  );
};
