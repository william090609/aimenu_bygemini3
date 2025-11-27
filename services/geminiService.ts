import { FoodItem, UserProfile, DailyPlan, Gender, Meal, Serving } from '../types';

// BMR Calculation Logic
export const calculateBMR = (profile: UserProfile): number => {
  let bmr = 0;
  if (profile.gender === Gender.MALE) {
    // [66.5 + 13.75 × weight (kg) + 5 × height (cm) - 6.75 × age] × activity level
    bmr = (66.5 + (13.75 * profile.weight) + (5 * profile.height) - (6.75 * profile.age));
  } else {
    // [655 + 9.56 × weight (kg) + 1.85 × height (cm) - 4.68 × age] × activity level
    bmr = (655 + (9.56 * profile.weight) + (1.85 * profile.height) - (4.68 * profile.age));
  }
  return Math.round(bmr * profile.activityLevel);
};

// Helper to select a food item based on preference weight
const getRandomFood = (candidates: FoodItem[]): FoodItem => {
  // Use exponential weighting to strongly favor higher preferences
  // Pref 0 -> 1
  // Pref 3 -> 8
  // Pref 6 -> 64
  const totalWeight = candidates.reduce((sum, item) => sum + Math.pow(2, item.preference), 0);
  let random = Math.random() * totalWeight;
  
  for (const item of candidates) {
    const weight = Math.pow(2, item.preference);
    random -= weight;
    if (random <= 0) return item;
  }
  return candidates[candidates.length - 1];
};

const createMeal = (targetCalories: number, availableFoods: FoodItem[]): Meal => {
  let currentCalories = 0;
  const items: Serving[] = [];
  const itemsMap = new Map<number, Serving>(); // Track counts

  let attempts = 0;
  const MAX_ATTEMPTS = 50;

  // Aim for +/- 10% of target
  const maxLimit = targetCalories * 1.1;
  const minTarget = targetCalories * 0.9;

  while (currentCalories < minTarget && attempts < MAX_ATTEMPTS) {
    attempts++;
    
    // Filter candidates that fit in the remaining calorie budget (mostly)
    // and haven't been used too much
    const candidates = availableFoods.filter(f => {
      // Don't add if it blows the budget significantly
      if (currentCalories + f.calories > maxLimit) return false;
      
      // Max 2 servings per item
      const existing = itemsMap.get(f.id);
      if (existing && existing.count >= 2) return false;
      
      return true;
    });

    if (candidates.length === 0) break;

    const food = getRandomFood(candidates);
    
    const existing = itemsMap.get(food.id);
    if (existing) {
      existing.count++;
      existing.totalCalories += food.calories;
      // Since objects are passed by reference, 'items' array is already updated
    } else {
      const newServing: Serving = {
        foodId: food.id,
        foodName: food.name,
        count: 1,
        calories: food.calories,
        totalCalories: food.calories
      };
      items.push(newServing);
      itemsMap.set(food.id, newServing);
    }
    currentCalories += food.calories;
  }

  return {
    items: items,
    totalCalories: currentCalories,
    targetCalories
  };
};

export const generateMealPlan = async (
  profile: UserProfile,
  foods: FoodItem[]
): Promise<DailyPlan> => {
  // Simulate a short delay to make it feel like "calculation" is happening
  // and to prevent UI flicker
  await new Promise(resolve => setTimeout(resolve, 800));

  const bmr = calculateBMR(profile);
  
  const breakfastTarget = Math.round(bmr * 0.25);
  const lunchTarget = Math.round(bmr * 0.35);
  const dinnerTarget = Math.round(bmr * 0.40);

  // Filter out disliked foods (preference 0) unless that's all there is
  const preferredFoods = foods.filter(f => f.preference > 0);
  const pool = preferredFoods.length > 0 ? preferredFoods : foods;

  // Generate meals independently
  const breakfast = createMeal(breakfastTarget, pool);
  const lunch = createMeal(lunchTarget, pool);
  const dinner = createMeal(dinnerTarget, pool);

  const totalCalories = breakfast.totalCalories + lunch.totalCalories + dinner.totalCalories;
  
  // Calculate total preference score
  let totalPreferenceScore = 0;
  const allItems = [...breakfast.items, ...lunch.items, ...dinner.items];
  allItems.forEach(item => {
    const food = foods.find(f => f.id === item.foodId);
    if (food) {
      totalPreferenceScore += (food.preference * item.count);
    }
  });

  return {
    breakfast,
    lunch,
    dinner,
    totalCalories,
    totalPreferenceScore,
    bmr
  };
};