import React from 'react';
import { UserProfile, Gender, Language } from '../types';
import { ACTIVITY_LEVELS, TRANSLATIONS } from '../constants';

interface ProfileFormProps {
  profile: UserProfile;
  onChange: (field: keyof UserProfile, value: any) => void;
  onNext: () => void;
  language: Language;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ profile, onChange, onNext, language }) => {
  const t = TRANSLATIONS[language];
  const isValid = profile.weight > 0 && profile.height > 0 && profile.age > 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">{t.profileTitle}</h2>
        <p className="text-slate-400 text-sm">{t.profileSubtitle}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.weight} (kg)</label>
          <div className="relative">
            <input
              type="number"
              value={profile.weight || ''}
              onChange={(e) => onChange('weight', parseFloat(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder-slate-600"
              placeholder="70"
            />
            <span className="absolute right-4 top-3.5 text-slate-500 text-sm">kg</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.height} (cm)</label>
          <div className="relative">
            <input
              type="number"
              value={profile.height || ''}
              onChange={(e) => onChange('height', parseFloat(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder-slate-600"
              placeholder="175"
            />
             <span className="absolute right-4 top-3.5 text-slate-500 text-sm">cm</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.age}</label>
          <input
            type="number"
            value={profile.age || ''}
            onChange={(e) => onChange('age', parseFloat(e.target.value))}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder-slate-600"
            placeholder="30"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.gender}</label>
          <select
            value={profile.gender}
            onChange={(e) => onChange('gender', e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all appearance-none"
          >
            <option value={Gender.MALE}>{t.male}</option>
            <option value={Gender.FEMALE}>{t.female}</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.activityLevel}</label>
        <div className="space-y-3">
          {ACTIVITY_LEVELS.map((level) => (
            <button
              key={level.value}
              onClick={() => onChange('activityLevel', level.value)}
              className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 flex items-center justify-between group ${
                profile.activityLevel === level.value
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
              }`}
            >
              <span className="text-sm font-medium">{level.label[language]}</span>
              {profile.activityLevel === level.value && (
                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Vegan Switch */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-center justify-between">
          <div className="flex flex-col">
              <span className="font-semibold text-white">{t.isVegan}</span>
              <span className="text-xs text-slate-400">Excludes all meat, fish, eggs, dairy</span>
          </div>
          <button 
            onClick={() => onChange('isVegan', !profile.isVegan)}
            className={`w-12 h-7 rounded-full transition-colors relative ${profile.isVegan ? 'bg-emerald-500' : 'bg-slate-600'}`}
          >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform ${profile.isVegan ? 'left-6' : 'left-1'}`} />
          </button>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-900 via-slate-900 to-transparent flex justify-center max-w-md mx-auto">
        <button
          onClick={onNext}
          disabled={!isValid}
          className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all ${
            isValid 
            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-500/20 hover:scale-[1.02]' 
            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          {t.nextBtn}
        </button>
      </div>
    </div>
  );
};

export default ProfileForm;