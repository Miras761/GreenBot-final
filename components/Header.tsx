
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="p-4 bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto flex items-center justify-center">
        <div className="flex items-center gap-3">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            <h1 className="text-2xl font-bold text-white">
            <span className="text-green-400">GreenBot</span> Assistant
            </h1>
        </div>
        <div className="absolute right-4 text-xs text-gray-500 hidden md:block">
            by GreenGamesStudio
        </div>
      </div>
    </header>
  );
};

export default Header;
