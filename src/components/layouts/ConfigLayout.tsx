import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface ConfigLayoutProps {
  title: string;
  children: React.ReactNode;
}

const ConfigLayout: React.FC<ConfigLayoutProps> = ({ title, children }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative text-gray-100 p-6">
      <div className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat" 
        style={{ backgroundImage: 'url("/public/background.jpg")', zIndex: -1 }} />
      <div className="fixed inset-0 bg-black/70" style={{ zIndex: -1 }} />
      
      <div className="relative max-w-7xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-white mb-6 hover:text-purple-400 transition-colors"
        >
          <ArrowLeft className="mr-2" /> Back
        </button>
        
        <h1 className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-cyan-400">
          {title}
        </h1>
        
        {children}
      </div>
    </div>
  );
};

export default ConfigLayout;
