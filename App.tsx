import React, { useState, useCallback } from 'react';
import Layout from './components/Layout';
import ProfileForm from './components/ProfileForm';
import PreferenceSelector from './components/PreferenceSelector';
import PlanDisplay from './components/PlanDisplay';
import { UserProfile, Gender, Step, FoodItem, DailyPlan } from './types';
import { INITIAL_FOOD_DATABASE } from './constants';
import { generateMealPlan } from './services/geminiService';

const App: React.FC = () => {
  const [step, setStep] = useState<Step>('profile');
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

  const handleProfileChange = useCallback((field: keyof UserProfile, value: string | number) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  }, []);

  const handlePreferenceUpdate = useCallback((id: number, rating: number) => {
    setFoods(prev => prev.map(item => 
      item.id === id ? { ...item, preference: rating } : item
    ));
  }, []);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const generatedPlan = await generateMealPlan(profile, foods);
      setPlan(generatedPlan);
      setStep('plan');
    } catch (error) {
      alert("Failed to generate plan. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep('profile');
    setPlan(null);
    // Optional: Reset preferences? No, let's keep them for better UX.
  };

  const renderStep = () => {
    switch (step) {
      case 'profile':
        return (
          <ProfileForm 
            profile={profile} 
            onChange={handleProfileChange} 
            onNext={() => setStep('preferences')} 
          />
        );
      case 'preferences':
        return (
          <PreferenceSelector 
            foods={foods} 
            onUpdatePreference={handlePreferenceUpdate} 
            onGenerate={handleGenerate}
            isLoading={isLoading}
          />
        );
      case 'plan':
        return plan ? (
          <PlanDisplay plan={plan} onReset={handleReset} />
        ) : null;
      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (step) {
        case 'profile': return 'Profile';
        case 'preferences': return 'Food Preferences';
        case 'plan': return 'Smart Plan';
    }
  }

  return (
    <Layout 
        title={getTitle()} 
        showBack={step === 'preferences'} 
        onBack={() => setStep('profile')}
    >
      {renderStep()}
    </Layout>
  );
};

export default App;