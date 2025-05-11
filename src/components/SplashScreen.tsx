import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';

const SplashScreen: React.FC = () => {
  const [animationComplete, setAnimationComplete] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // After 3 seconds, complete animation and navigate
    const timer = setTimeout(() => {
      setAnimationComplete(true);
      
      // Add a small delay after animation completes before navigating
      setTimeout(() => {
        navigate('/games');
      }, 500);
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center overflow-hidden">
      <div className={`transition-all duration-500 transform ${
        animationComplete ? 'scale-110 opacity-0' : 'scale-100 opacity-100'
      }`}>
        <div className="flex items-center space-x-2 mb-4">
          <Zap size={48} className="text-purple-500 animate-pulse" />
          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-cyan-400 animate-pulse">
            Infinity Esports
          </h1>
        </div>
        
        <p className="text-xl text-cyan-300 text-center animate-pulse">
          Tournament Manager
        </p>
      </div>
      
      <div className="mt-12">
        <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 animate-[progress_3s_ease-in-out]"
            style={{ width: animationComplete ? '100%' : '0%' }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;