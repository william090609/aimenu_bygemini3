import React from 'react';
import { DailyPlan, Meal, Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface PlanDisplayProps {
  plan: DailyPlan;
  onReset: () => void;
  language: Language;
}

const MealCard: React.FC<{ title: string; meal: Meal; icon: React.ReactNode; targetLabel: string }> = ({ title, meal, icon, targetLabel }) => (
  <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-4">
    <div className="flex justify-between items-center border-b border-slate-700 pb-3">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-slate-700/50 rounded-lg text-emerald-400">
            {icon}
        </div>
        <div>
            <h3 className="font-bold text-white">{title}</h3>
            <p className="text-xs text-slate-400">{targetLabel}: {meal.targetCalories} kcal</p>
        </div>
      </div>
      <div className={`text-sm font-bold ${meal.totalCalories > meal.targetCalories * 1.1 ? 'text-red-400' : 'text-emerald-400'}`}>
        {meal.totalCalories} kcal
      </div>
    </div>
    
    <ul className="space-y-3">
      {meal.items.map((item, idx) => (
        <li key={`${item.foodId}-${idx}`} className="flex justify-between items-start text-sm">
          <span className="text-slate-300 flex-1">
             <span className="text-emerald-500 font-bold mr-2">{item.count}x</span>
             {item.foodName}
          </span>
          <span className="text-slate-500 ml-4 tabular-nums">
            {item.totalCalories}
          </span>
        </li>
      ))}
    </ul>
  </div>
);

const PlanDisplay: React.FC<PlanDisplayProps> = ({ plan, onReset, language }) => {
  const t = TRANSLATIONS[language];

  return (
    <div className="space-y-6 animate-fade-in pb-24">
      
      {/* Summary Card */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-6 text-white shadow-xl shadow-emerald-900/20">
        <div className="text-center space-y-1 mb-6">
            <h2 className="text-2xl font-bold">{t.planTitle}</h2>
            <p className="text-emerald-100 text-sm opacity-80">{t.planSubtitle}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-2xl font-bold">{plan.totalCalories}</div>
                <div className="text-xs uppercase tracking-wider opacity-70">{t.totalCalories}</div>
                 <div className="text-[10px] mt-1 opacity-60">{t.target}: {plan.bmr}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-2xl font-bold">{plan.totalPreferenceScore}</div>
                 <div className="text-xs uppercase tracking-wider opacity-70">{t.prefScore}</div>
                 <div className="text-[10px] mt-1 opacity-60">{t.higherBetter}</div>
            </div>
        </div>
      </div>

      {/* BMI & Exercise Card */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-4">
         <div className="flex justify-between items-center border-b border-slate-700 pb-3">
            <div className="flex items-center gap-2">
                <div className="p-2 bg-slate-700/50 rounded-lg text-blue-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 17h11"/><path d="M6 20v-2a6 6 0 1 1 12 0v2"/><path d="M6 4v2a6 6 0 0 1 12 0V4"/><circle cx="12" cy="11" r="1"/></svg>
                </div>
                <div>
                    <h3 className="font-bold text-white">{t.bmiTitle}</h3>
                    <p className={`text-xs font-bold ${plan.bmi.color}`}>{plan.bmi.label[language]}</p>
                </div>
            </div>
            <div className="text-2xl font-bold text-white">
                {plan.bmi.value}
            </div>
        </div>

        <div>
            <div className="text-sm font-semibold text-slate-300 mb-3">{t.exerciseTitle} <span className="text-xs font-normal text-slate-500 block">{t.exerciseSubtitle}</span></div>
            <div className="space-y-3">
                {plan.exercises.map((ex, idx) => (
                    <div key={idx} className="bg-slate-700/30 rounded-lg p-3 flex flex-col gap-2">
                         <div className="flex justify-between items-start">
                             <div className="font-medium text-slate-200">{ex.name[language]}</div>
                             <a 
                                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(ex.youtubeQuery)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 font-medium px-2 py-1 bg-red-400/10 rounded-full transition-colors"
                             >
                                 <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>
                                 {t.watchVideo}
                             </a>
                         </div>
                         <div className="flex gap-4 text-xs text-slate-400">
                             <div className="flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                {t.duration}: {ex.duration[language]}
                             </div>
                             <div className="flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                                {t.intensity}: {ex.intensity[language]}
                             </div>
                         </div>
                    </div>
                ))}
            </div>
        </div>
      </div>

      <div className="space-y-4">
        <MealCard 
            title={t.breakfast} 
            meal={plan.breakfast} 
            targetLabel={t.target}
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 17a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2 2 2 0 0 1 2-2h2a2 2 0 0 1 2 2Z"/><path d="M14.5 13a4.5 4.5 0 0 0-3 8.3c1 1.7 2.5 1.7 3.5 0 .8-1.4.8-2.6.2-3.7"/><path d="M7 13a4 4 0 0 0-4 7.3c1 1.7 2.5 1.7 3.5 0 .8-1.3.8-2.5.2-3.6"/><path d="M3 7a1 1 0 0 1 .7-1l7.3-3.7a1 1 0 0 1 1 0L19.4 6c.5.3.7.8.6 1.4L18 13"/></svg>}
        />
        <MealCard 
            title={t.lunch} 
            meal={plan.lunch} 
            targetLabel={t.target}
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 21h8a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-3v-6a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v6H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2Z"/></svg>}
        />
        <MealCard 
            title={t.dinner} 
            meal={plan.dinner} 
            targetLabel={t.target}
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.4 2.7c-2.3 0-4.6.5-6.7 1.5C3.3 5.4 2 7.7 2 10.3c0 2.5 1.2 4.9 3.2 6.5.6.5 1.2 1 1.8 1.4L6 21h12l-.9-2.7c.6-.5 1.2-1 1.8-1.5 2-1.6 3.1-4 3.1-6.5 0-2.6-1.3-4.9-3.7-6.1-2.1-1-4.4-1.5-6.9-1.5Z"/></svg>}
        />
      </div>

       <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-900 via-slate-900 to-transparent flex justify-center max-w-md mx-auto">
        <button
          onClick={onReset}
          className="w-full py-4 rounded-2xl font-bold text-lg bg-slate-800 text-white border border-slate-700 hover:bg-slate-700 transition-all"
        >
          {t.startOver}
        </button>
      </div>
    </div>
  );
};

export default PlanDisplay;