import React from 'react';

export const FlowArrow: React.FC = () => {
  return (
    <div className="flex items-center justify-center w-32 shrink-0 opacity-40">
        <svg width="100%" height="40" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
                d="M0 20H110" 
                stroke="url(#gradient-arrow)" 
                strokeWidth="2" 
                strokeDasharray="4 4"
            />
            <path 
                d="M100 10L115 20L100 30" 
                stroke="#4ade80" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
            />
            <defs>
                <linearGradient id="gradient-arrow" x1="0" y1="20" x2="110" y2="20" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#525252" />
                    <stop offset="1" stopColor="#4ade80" />
                </linearGradient>
            </defs>
        </svg>
    </div>
  );
};