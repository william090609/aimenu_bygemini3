import React, { useState, useMemo } from 'react';
import { FoodItem } from '../types';

interface PreferenceSelectorProps {
  foods: FoodItem[];
  onUpdatePreference: (id: number, rating: number) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

const PreferenceSelector: React.FC<PreferenceSelectorProps> = ({ foods, onUpdatePreference, onGenerate, isLoading }) => {
  const [filter, setFilter] = useState('');

  const filteredFoods = useMemo(() => {
    return foods.filter(f => f.name.toLowerCase().includes(filter.toLowerCase()));
  }, [foods, filter]);

  const getRatingColor = (rating: number) => {
    if (rating === 0) return 'text-red-500';
    if (rating <= 2) return 'text-orange-400';
    if (rating === 3) return 'text-slate-400';
    if (rating <= 5) return 'text-blue-400';
    return 'text-emerald-400';
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="sticky top-0 bg-slate-900 z-10 pb-4 space-y-4">
        <div className="text-center">
            <h2 className="text-2xl font-bold text-white">Rate Your Foods</h2>
            <p className="text-slate-400 text-sm">0 = Dislike, 6 = Strongly Like. Default is 3.</p>
        </div>
        <div className="relative">
             <input 
                type="text" 
                placeholder="Search foods..." 
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 pl-10 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder-slate-500"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
            />
            <svg className="absolute left-3 top-3.5 text-slate-500 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {filter && (
              <button 
                onClick={() => setFilter('')}
                className="absolute right-3 top-3.5 text-slate-500 hover:text-white transition-colors p-1"
                aria-label="Clear search"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            )}
        </div>
      </div>

      <div className="space-y-3 pb-24">
        {filteredFoods.map((food) => (
          <div key={food.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-slate-200">{food.name}</h3>
                <span className="text-xs text-slate-500">{food.calories} kcal / serving</span>
              </div>
              <div className={`font-bold text-lg ${getRatingColor(food.preference)}`}>
                 {food.preference}
              </div>
            </div>
            
            <input
              type="range"
              min="0"
              max="6"
              step="1"
              value={food.preference}
              onChange={(e) => onUpdatePreference(food.id, parseInt(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-xs text-slate-500 px-1">
              <span>Dislike</span>
              <span>Neutral</span>
              <span>Love</span>
            </div>
          </div>
        ))}
        {filteredFoods.length === 0 && (
            <div className="text-center py-10 text-slate-500 flex flex-col items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <span>No foods found matching "{filter}".</span>
            </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-900 via-slate-900 to-transparent flex justify-center max-w-md mx-auto">
        <button
          onClick={onGenerate}
          disabled={isLoading}
          className="w-full py-4 rounded-2xl font-bold text-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
             <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generative AI Thinking...
             </>
          ) : (
            "Generate Meal Plan"
          )}
        </button>
      </div>
    </div>
  );
};

export default PreferenceSelector;