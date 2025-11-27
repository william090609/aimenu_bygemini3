import React, { useState, useMemo } from 'react';
import { FoodItem, Language } from '../types';
import { TRANSLATIONS, CATEGORY_ORDER } from '../constants';

interface PreferenceSelectorProps {
  foods: FoodItem[];
  onUpdatePreference: (id: number, rating: number) => void;
  onBulkUpdatePreference: (ids: number[], rating: number) => void;
  onGenerate: () => void;
  isLoading: boolean;
  language: Language;
  excludedCategories: string[];
  onToggleExclusion: (category: string) => void;
}

const PreferenceSelector: React.FC<PreferenceSelectorProps> = ({ 
    foods, 
    onUpdatePreference, 
    onBulkUpdatePreference, 
    onGenerate, 
    isLoading, 
    language,
    excludedCategories,
    onToggleExclusion
}) => {
  const [filter, setFilter] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [showExclusions, setShowExclusions] = useState(false);
  const t = TRANSLATIONS[language];

  // Group foods by category
  const groupedFoods = useMemo(() => {
    const filtered = foods.filter(f => f.name.toLowerCase().includes(filter.toLowerCase()));
    
    // If filtering, we still group them but maybe auto-expand
    const groups: Record<string, FoodItem[]> = {};
    
    // Initialize groups in order
    CATEGORY_ORDER.forEach(cat => {
        groups[cat] = [];
    });
    
    filtered.forEach(food => {
        const cat = food.category;
        if (!groups[cat]) {
             // Fallback if category logic returns something not in ORDER list
             if (!groups['cat_other']) groups['cat_other'] = [];
             groups['cat_other'].push(food);
        } else {
             groups[cat].push(food);
        }
    });

    // Remove empty groups
    Object.keys(groups).forEach(key => {
        if (groups[key].length === 0) delete groups[key];
    });

    return groups;
  }, [foods, filter]);

  // If user is searching, we should probably ignore collapse state or auto-expand
  const isSearching = filter.length > 0;

  const toggleCategory = (cat: string) => {
      setCollapsedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const handleBulkUpdate = (cat: string, rating: number) => {
      if (!groupedFoods[cat]) return;
      const ids = groupedFoods[cat].map(f => f.id);
      onBulkUpdatePreference(ids, rating);
  };

  const getRatingColor = (rating: number) => {
    if (rating === 0) return 'text-red-500';
    if (rating <= 2) return 'text-orange-400';
    if (rating === 3) return 'text-slate-400';
    if (rating <= 5) return 'text-blue-400';
    return 'text-emerald-400';
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="sticky top-0 bg-slate-900 z-10 pb-4 space-y-4 shadow-lg shadow-slate-900/50">
        <div className="text-center pt-2">
            <h2 className="text-2xl font-bold text-white">{t.prefTitle}</h2>
            <p className="text-slate-400 text-sm">{t.prefSubtitle}</p>
        </div>

        {/* Exclusion Filter Toggle */}
        <div className="border border-slate-700 rounded-xl bg-slate-800/50 overflow-hidden">
            <button 
                onClick={() => setShowExclusions(!showExclusions)}
                className="w-full flex items-center justify-between p-3 text-sm font-medium text-slate-200 hover:bg-slate-800 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                    <span>{t.filterCategories}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-xs">{excludedCategories.length > 0 ? `${excludedCategories.length} ${t.hidden}` : ''}</span>
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                        className={`transition-transform duration-200 ${showExclusions ? 'rotate-180' : ''}`}
                    >
                        <polyline points="6 9 12 15 18 9"/>
                    </svg>
                </div>
            </button>
            
            {showExclusions && (
                <div className="p-3 border-t border-slate-700 bg-slate-900/50">
                    <p className="text-xs text-slate-400 mb-3">{t.filterSubtitle}</p>
                    <div className="flex flex-wrap gap-2">
                        {CATEGORY_ORDER.map(catKey => {
                            const isExcluded = excludedCategories.includes(catKey);
                            const catName = (t as any)[catKey] || catKey;
                            return (
                                <button
                                    key={catKey}
                                    onClick={() => onToggleExclusion(catKey)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                                        isExcluded 
                                        ? 'bg-slate-800 text-slate-500 border-slate-700 opacity-60 line-through decoration-slate-500' 
                                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/50 hover:bg-emerald-500/20'
                                    }`}
                                >
                                    {catName}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>

        <div className="relative">
             <input 
                type="text" 
                placeholder={t.searchPlaceholder} 
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

      <div className="space-y-4 pb-24">
        {CATEGORY_ORDER.map(catKey => {
            const items = groupedFoods[catKey];
            if (!items) return null;
            
            // Default to collapsed for large categories unless searching
            const isCollapsed = !isSearching && (collapsedCategories[catKey] ?? true);
            const catName = (t as any)[catKey] || catKey;

            return (
                <div key={catKey} className="border border-slate-800 rounded-xl overflow-hidden bg-slate-800/20">
                    <div 
                        className="bg-slate-800 p-4 flex items-center justify-between cursor-pointer select-none"
                        onClick={() => toggleCategory(catKey)}
                    >
                        <div className="flex items-center gap-2">
                             <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                width="16" 
                                height="16" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                                className={`transition-transform duration-200 ${isCollapsed ? '' : 'rotate-90'}`}
                             >
                                <polyline points="9 18 15 12 9 6"/>
                             </svg>
                             <h3 className="font-bold text-slate-200">{catName}</h3>
                             <span className="bg-slate-700 text-slate-400 text-xs px-2 py-0.5 rounded-full">{items.length}</span>
                        </div>
                    </div>
                    
                    {!isCollapsed && (
                        <div className="p-4 space-y-4 bg-slate-900/30">
                            {/* Bulk Update Slider */}
                            <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/50 mb-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-semibold text-emerald-400">{t.bulkSet} {catName}</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="6"
                                    step="1"
                                    defaultValue="3"
                                    onChange={(e) => handleBulkUpdate(catKey, parseInt(e.target.value))}
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                />
                                <div className="flex justify-between text-[10px] text-slate-500 px-1 mt-1">
                                    <span>{t.dislike}</span>
                                    <span>{t.neutral}</span>
                                    <span>{t.love}</span>
                                </div>
                            </div>

                            {/* Individual Items */}
                            <div className="grid gap-3">
                                {items.map((food) => (
                                <div key={food.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 flex flex-col gap-2">
                                    <div className="flex justify-between items-start">
                                    <div className="flex-1 pr-2">
                                        <h4 className="font-medium text-slate-200 text-sm leading-tight">{food.name}</h4>
                                        <span className="text-[10px] text-slate-500">{food.calories} kcal</span>
                                    </div>
                                    <div className={`font-bold text-base ${getRatingColor(food.preference)}`}>
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
                                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500/80 hover:accent-emerald-500"
                                    />
                                </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            );
        })}

        {Object.keys(groupedFoods).length === 0 && (
            <div className="text-center py-10 text-slate-500 flex flex-col items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <span>{t.noFoodsFound} "{filter}".</span>
                {excludedCategories.length > 0 && <span className="text-xs text-slate-600">Check your active category filters.</span>}
            </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-900 via-slate-900 to-transparent flex justify-center max-w-md mx-auto z-20">
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
                {t.generating}
             </>
          ) : (
            t.generateBtn
          )}
        </button>
      </div>
    </div>
  );
};

export default PreferenceSelector;