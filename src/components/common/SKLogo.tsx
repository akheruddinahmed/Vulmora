import React, { useState } from 'react';

const CLOUDINARY_LOGO_URL =
  'https://res.cloudinary.com/j66acpd8/image/upload/v1792118780/vulmora_store/branding/sk_research_laboratories_logo.png';
const LOCAL_FALLBACK_URL = '/images/sk-research-laboratories.png';

export interface SKLogoProps {
  className?: string;
  variant?: 'logo-only' | 'badge' | 'banner' | 'chip';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  theme?: 'light' | 'dark';
  showSubtitle?: boolean;
}

export const SKLogo: React.FC<SKLogoProps> = ({
  className = '',
  variant = 'logo-only',
  size = 'md',
  theme = 'light',
  showSubtitle = true,
}) => {
  const [imgSrc, setImgSrc] = useState(CLOUDINARY_LOGO_URL);

  const handleImageError = () => {
    if (imgSrc !== LOCAL_FALLBACK_URL) {
      setImgSrc(LOCAL_FALLBACK_URL);
    }
  };

  const heightClasses = {
    xs: 'h-6 sm:h-7',
    sm: 'h-8 sm:h-9',
    md: 'h-10 sm:h-12',
    lg: 'h-14 sm:h-16',
    xl: 'h-20 sm:h-24',
  }[size];

  // 1. Logo Only
  if (variant === 'logo-only') {
    return (
      <img
        src={imgSrc}
        alt="S K Research Laboratories"
        onError={handleImageError}
        className={`w-auto object-contain select-none transition-all ${heightClasses} ${className}`}
        loading="lazy"
      />
    );
  }

  // 2. Chip (Compact pill)
  if (variant === 'chip') {
    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-xs select-none ${
          theme === 'dark'
            ? 'bg-slate-900/90 border-slate-700/80 text-slate-200'
            : 'bg-white border-slate-200 text-slate-800'
        } ${className}`}
      >
        <div className="bg-white rounded-md p-0.5 shrink-0 flex items-center justify-center shadow-2xs">
          <img
            src={imgSrc}
            alt="S K Research Laboratories"
            onError={handleImageError}
            className="h-5 w-auto object-contain"
            loading="lazy"
          />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 leading-none">
            Formulated By
          </span>
          <span className="text-xs font-bold leading-tight">S K Research Laboratories</span>
        </div>
      </div>
    );
  }

  // 3. Banner
  if (variant === 'banner') {
    return (
      <div
        className={`rounded-2xl p-5 border flex flex-col sm:flex-row items-center justify-between gap-5 select-none ${
          theme === 'dark'
            ? 'bg-slate-900 border-slate-800 text-white'
            : 'bg-white border-slate-200 text-slate-900 shadow-sm'
        } ${className}`}
      >
        <div className="flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs shrink-0">
            <img
              src={imgSrc}
              alt="S K Research Laboratories"
              onError={handleImageError}
              className="h-12 w-auto object-contain"
              loading="lazy"
            />
          </div>
          <div>
            <span className="inline-block text-[10px] font-bold tracking-wider uppercase text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 mb-1">
              Official Manufacturer
            </span>
            <h4 className="text-sm sm:text-base font-extrabold leading-tight">
              S K Research Laboratories
            </h4>
            {showSubtitle && (
              <p className="text-xs text-slate-500 mt-0.5">
                Licensed pharmaceutical & chemical research facility • Guwahati, Assam
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 text-xs font-semibold text-slate-500">
          <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
            ✓ Drug License Monograph
          </span>
          <span className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
            ✓ Batch Inspected
          </span>
        </div>
      </div>
    );
  }

  // 4. Default Badge (Crisp white pill/card endorsement badge)
  return (
    <div
      className={`inline-flex items-center gap-3.5 p-3 rounded-2xl border shadow-sm transition-all select-none ${
        theme === 'dark'
          ? 'bg-white/95 text-slate-900 border-white/20'
          : 'bg-white text-slate-900 border-slate-200'
      } ${className}`}
    >
      <div className="h-10 sm:h-12 flex items-center justify-center shrink-0">
        <img
          src={imgSrc}
          alt="S K Research Laboratories"
          onError={handleImageError}
          className={`${heightClasses} w-auto object-contain`}
          loading="lazy"
        />
      </div>
      {showSubtitle && (
        <div className="flex flex-col text-left pr-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-blue-700 leading-tight">
            Formulated & Manufactured by
          </span>
          <span className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">
            S K Research Laboratories
          </span>
          <span className="text-[10px] text-slate-500 leading-tight mt-0.5">
            Licensed Laboratory • Guwahati, Assam
          </span>
        </div>
      )}
    </div>
  );
};
