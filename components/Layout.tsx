import React, { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  onSave?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, title, showBack, onBack, onSave }) => {
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);

  const handleSaveClick = () => {
    if (onSave) {
      onSave();
      setShowSavedFeedback(true);
      setTimeout(() => setShowSavedFeedback(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex justify-center">
      <div className="w-full max-w-md bg-slate-900 min-h-screen flex flex-col shadow-2xl border-x border-slate-800">
        
        {/* Header */}
        <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showBack && (
              <button 
                onClick={onBack}
                className="p-2 -ml-2 rounded-full hover:bg-slate-800 text-slate-400 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>
            )}
            <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              {title}
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            {onSave && (
              <button 
                onClick={handleSaveClick}
                disabled={showSavedFeedback}
                className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition-colors disabled:opacity-100 disabled:text-emerald-500"
                title="Save Progress"
                aria-label="Save"
              >
                {showSavedFeedback ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-in zoom-in duration-200"><polyline points="20 6 9 17 4 12"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                )}
              </button>
            )}
            <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-xs font-bold text-emerald-500 border border-slate-700 select-none">
              AI
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 pb-24 relative">
          {children}
        </main>

      </div>
    </div>
  );
};

export default Layout;