import React, { useState, useCallback, useEffect } from 'react';
import Layout from './components/Layout';
import ProfileForm from './components/ProfileForm';
import PreferenceSelector from './components/PreferenceSelector';
import PlanDisplay from './components/PlanDisplay';
import { UserProfile, Gender, Step, FoodItem, DailyPlan, Language } from './types';
import { INITIAL_FOOD_DATABASE, TRANSLATIONS } from './constants';
import { generateMealPlan } from './services/geminiService';

const App: React.FC = () => {
  const [step, setStep] = useState<Step>('profile');
  const [language, setLanguage] = useState<Language>('en');
  const [profile, setProfile] = useState<UserProfile>({
    weight: 0,
    height: 0,
    age: 0,
    gender: Gender.MALE,
    activityLevel: 1.2,
  });
  
  // Clone initial DB so we can modify preferences locally
  const [foods, setFoods] = useState<FoodItem[]>(INITIAL_FOOD_DATABASE);
  const [plan, setPlan] = useState<DailyPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load saved data on mount
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem('smartDiet_profile');
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }

      const savedPrefs = localStorage.getItem('smartDiet_preferences');
      if (savedPrefs) {
        const prefsMap = JSON.parse(savedPrefs) as Record<number, number>;
        setFoods(prev => prev.map(item => ({
          ...item,
          preference: prefsMap[item.id] !== undefined ? prefsMap[item.id] : item.preference
        })));
      }
      
      const savedLang = localStorage.getItem('smartDiet_language');
      if (savedLang === 'zh' || savedLang === 'en') {
        setLanguage(savedLang);
      }
    } catch (error) {
      console.error("Failed to load saved data:", error);
    }
  }, []);

  const handleLanguageToggle = useCallback(() => {
    const newLang = language === 'en' ? 'zh' : 'en';
    setLanguage(newLang);
    localStorage.setItem('smartDiet_language', newLang);
  }, [language]);

  const handleProfileChange = useCallback((field: keyof UserProfile, value: string | number) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  }, []);

  const handlePreferenceUpdate = useCallback((id: number, rating: number) => {
    setFoods(prev => prev.map(item => 
      item.id === id ? { ...item, preference: rating } : item
    ));
  }, []);

  const handleSave = useCallback(() => {
    try {
      // Save Profile
      localStorage.setItem('smartDiet_profile', JSON.stringify(profile));
      
      // Save Preferences (Optimization: only save non-default values)
      const prefsMap = foods.reduce((acc, item) => {
        if (item.preference !== 3) {
          acc[item.id] = item.preference;
        }
        return acc;
      }, {} as Record<number, number>);
      
      localStorage.setItem('smartDiet_preferences', JSON.stringify(prefsMap));
    } catch (error) {
      console.error("Failed to save data:", error);
      alert("Failed to save data. Storage might be full.");
    }
  }, [profile, foods]);

  const handleGenerate = async () => {
    // Auto-save before generating
    handleSave();
    
    setIsLoading(true);
    try {
      const generatedPlan = await generateMealPlan(profile, foods);
      setPlan(generatedPlan);
      setStep('plan');
    } catch (error) {
      console.error(error);
      alert("Failed to generate plan. Please try again. If the error persists, try reducing the complexity or checking your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep('profile');
    setPlan(null);
  };

  const renderStep = () => {
    switch (step) {
      case 'profile':
        return (
          <ProfileForm 
            profile={profile} 
            onChange={handleProfileChange} 
            onNext={() => setStep('preferences')} 
            language={language}
          />
        );
      case 'preferences':
        return (
          <PreferenceSelector 
            foods={foods} 
            onUpdatePreference={handlePreferenceUpdate} 
            onGenerate={handleGenerate}
            isLoading={isLoading}
            language={language}
          />
        );
      case 'plan':
        return plan ? (
          <PlanDisplay plan={plan} onReset={handleReset} language={language} />
        ) : null;
      default:
        return null;
    }
  };

  const getTitle = () => {
    const t = TRANSLATIONS[language];
    switch (step) {
        case 'profile': return t.headerProfile;
        case 'preferences': return t.headerPref;
        case 'plan': return t.headerPlan;
    }
  }

  return (
    <Layout 
        title={getTitle()} 
        showBack={step === 'preferences'} 
        onBack={() => setStep('profile')}
        onSave={(step === 'profile' || step === 'preferences') ? handleSave : undefined}
        language={language}
        onToggleLanguage={handleLanguageToggle}
    >
      {renderStep()}
    </Layout>
  );
};

export default App;