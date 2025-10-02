
import React, { useState } from 'react';
import Header from './components/Header';
import ChatView from './components/ChatView';
import ImageGenView from './components/ImageGenView';
import VideoGenView from './components/VideoGenView';

type View = 'chat' | 'image' | 'video';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('chat');

  const renderView = () => {
    switch (currentView) {
      case 'chat':
        return <ChatView />;
      case 'image':
        return <ImageGenView />;
      case 'video':
        return <VideoGenView />;
      default:
        return <ChatView />;
    }
  };
  
  const navButtonClasses = (view: View) => 
    `px-4 py-2 text-sm md:text-base font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-400 ${
      currentView === view 
      ? 'bg-green-600 text-white shadow-lg' 
      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
    }`;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col font-sans">
      <Header />
      <main className="flex-grow flex flex-col p-4 md:p-6 lg:p-8 max-w-5xl mx-auto w-full">
        <nav className="flex justify-center items-center gap-2 md:gap-4 mb-6">
          <button onClick={() => setCurrentView('chat')} className={navButtonClasses('chat')}>
            Assistant Chat
          </button>
          <button onClick={() => setCurrentView('image')} className={navButtonClasses('image')}>
            Image Generation
          </button>
          <button onClick={() => setCurrentView('video')} className={navButtonClasses('video')}>
            Video Generation (VEO)
          </button>
        </nav>
        <div className="flex-grow flex flex-col bg-gray-800 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
           {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;
