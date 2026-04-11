import React, { useState } from 'react';
import vid from "../assets/videos/MycityLife_video.mp4";

const LandingPage = () => {
  const [isVideoFinished, setIsVideoFinished] = useState(false);

  const handleVideoEnd = () => {
    setIsVideoFinished(true);
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      {/* Background Video */}
      <video
        autoPlay
        // muted
        playsInline
        onEnded={handleVideoEnd}
        className={`absolute top-0 left-0 h-full w-full object-cover transition-opacity duration-1000 ${
          isVideoFinished ? 'opacity-40' : 'opacity-100'
        }`}
      >
        <source src={vid} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay Content */}
      <div className="relative z-10 flex h-full w-full items-center justify-center">
        {isVideoFinished && (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-700">
            <h1 className="mb-8 text-5xl font-bold text-white tracking-tight">
              Experience the Journey
            </h1>
            <button
              onClick={() => console.log('Enter Clicked')}
              className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-indigo-600 font-pj rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 hover:bg-indigo-500 shadow-xl"
            >
              Enter
              <svg 
                className="w-5 h-5 ml-3 transition-transform duration-200 group-hover:translate-x-1" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Subtle Bottom Gradient for Depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
    </div>
  );
};

export default LandingPage;