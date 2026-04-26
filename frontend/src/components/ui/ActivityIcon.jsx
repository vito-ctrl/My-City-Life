import React from 'react';

const ActivityIcon = () => {
  return (
    <div className="group cursor-pointer">
      <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300 ease-in-out">
        <svg 
          width="18" 
          height="18" 
          viewBox="0 0 40 40" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* A stylized 'M' for MycityLife that doubles as a compass needle and mountain peaks */}
          <path 
            d="M20 6L34 32L20 26L6 32L20 6Z" 
            fill="white" 
            stroke="white" 
            strokeWidth="1.5" 
            strokeLinejoin="round"
          />
          {/* Subtle inner detail for a premium, technical feel */}
          <path 
            d="M20 6V26" 
            stroke="url(#gradient-overlay)" 
            strokeWidth="1" 
            strokeOpacity="0.3"
          />
          <defs>
            <linearGradient id="gradient-overlay" x1="20" y1="6" x2="20" y2="26" gradientUnits="userSpaceOnUse">
              <stop stopColor="black" />
              <stop offset="1" stopColor="white" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};

export default ActivityIcon;