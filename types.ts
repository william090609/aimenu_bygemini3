export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female'
}

export type Language = 'en' | 'zh';

export interface UserProfile {
  weight: number; // kg
  height: number; // cm
  age: number; // years
  gender: Gender;
  activityLevel: number; // 1.2 to 1.9
}

export interface FoodItem {
  id: number;
  name: string;
  calories: number;
  preference: number; // 0-6, default 3
}

export interface Serving {
  foodId: number;
  foodName: string;
  count: number; // Max 2
  calories: number;
  totalCalories: number;
}

export interface Meal {
  items: Serving[];
  totalCalories: number;
  targetCalories: number;
}

export interface DailyPlan {
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  totalCalories: number;
  totalPreferenceScore: number;
  bmr: number;
}

export type Step = 'profile' | 'preferences' | 'plan';