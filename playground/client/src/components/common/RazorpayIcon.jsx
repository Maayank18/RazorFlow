import React from 'react';

/**
 * Official-styled Razorpay Brand Glyph / Lightning-Blade Icon
 */
export const RazorpayIcon = ({ 
  className = "w-5 h-5", 
  size,
  color = "currentColor" 
}) => {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
    >
      <path 
        d="M14.5 2.5L5.5 14H11.5L9.5 21.5L18.5 10H12.5L14.5 2.5Z" 
        fill={color === 'currentColor' ? 'currentColor' : color}
        stroke={color === 'currentColor' ? 'currentColor' : color}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const RazorpayLogoBadge = ({ className = "w-8 h-8" }) => {
  return (
    <div className={`rounded-xl bg-gradient-to-br from-[#0C83FD] to-[#0055CC] p-1.5 flex items-center justify-center shadow-md shadow-[#0C83FD]/20 ${className}`}>
      <RazorpayIcon className="w-full h-full text-white" color="#FFFFFF" />
    </div>
  );
};
