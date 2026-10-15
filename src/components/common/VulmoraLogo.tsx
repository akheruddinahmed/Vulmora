import React from 'react';

interface VulmoraLogoProps {
  className?: string;
  theme?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg';
}

export const VulmoraLogo: React.FC<VulmoraLogoProps> = ({
  className = '',
  theme = 'light',
  size = 'md',
}) => {
  const isDark = theme === 'dark';

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl sm:text-4xl',
  }[size];

  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      {/* Dynamic VULMORA emblem with royal blue / purple / magenta gradients */}
      <div className="relative flex items-center justify-center">
        <svg
          viewBox="0 0 40 40"
          className={size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-11 h-11' : 'w-9 h-9'}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer shield container */}
          <rect
            width="40"
            height="40"
            rx="12"
            fill="url(#vulmora-grad)"
          />
          {/* Inner sparkle / droplet leaf */}
          <path
            d="M20 7C20 7 28 14 28 22C28 26.4183 24.4183 30 20 30C15.5817 30 12 26.4183 12 22C12 14 20 7 20 7Z"
            fill="white"
            fillOpacity="0.95"
          />
          <path
            d="M20 12C20 12 25 17 25 22C25 24.7614 22.7614 27 20 27C17.2386 27 15 24.7614 15 22C15 17 20 12 20 12Z"
            fill="url(#vulmora-inner-leaf)"
          />
          <defs>
            <linearGradient id="vulmora-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0f2b8f" />
              <stop offset="0.5" stopColor="#7e22ce" />
              <stop offset="1" stopColor="#d946ef" />
            </linearGradient>
            <linearGradient id="vulmora-inner-leaf" x1="15" y1="12" x2="25" y2="27" gradientUnits="userSpaceOnUse">
              <stop stopColor="#d946ef" />
              <stop offset="1" stopColor="#0f2b8f" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col">
        <div className="flex items-center">
          <span
            className={`font-black tracking-tighter leading-none ${textSizes} ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            VULMORA
          </span>
          <span className="text-[10px] font-bold text-fuchsia-500 ml-0.5 -mt-2">TM</span>
        </div>
        <span
          className={`text-[9px] font-bold tracking-widest uppercase -mt-0.5 ${
            isDark ? 'text-fuchsia-400' : 'text-blue-900'
          }`}
        >
          Cleaning & Care
        </span>
      </div>
    </div>
  );
};
