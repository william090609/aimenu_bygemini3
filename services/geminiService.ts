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

// Categorization Logic
type FoodCategory = 'soup' | 'staple' | 'breakfast' | 'one_dish' | 'dish' | 'dessert';

const categorizeFood = (name: string): FoodCategory => {
  const n = name.toLowerCase();
  
  // Staples
  if (n.includes('white rice') || n.includes('steamed rice')) return 'staple';
  
  // Desserts & Sweet Soups
  if ((n.includes('sweet') || n.includes('sugar')) && (n.includes('soup') || n.includes('water'))) return 'dessert';
  if (n.includes('tea') || n.includes('cake') || n.includes('tart') || n.includes('pudding') || n.includes('jelly') || n.includes('ice') || n.includes('cookie') || n.includes('mango sago') || n.includes('tofu pudding') || n.includes('biscuit') || n.includes('puff')) return 'dessert';

  // Soups (Savory)
  if (n.includes('soup') || n.includes('broth') || n.includes('geng')) return 'soup';

  // Breakfast items
  if (n.includes('congee') || n.includes('bun') || n.includes('toast') || n.includes('sandwich') || n.includes('macaroni') || n.includes('rice roll') || n.includes('cheung fun') || n.includes('dim sum') || n.includes('dumpling') || n.includes('siu mai') || n.includes('har gow') || n.includes('oatmeal') || n.includes('egg') || n.includes('waffle') || n.includes('pancake')) return 'breakfast';

  // One-dish meals (Carb heavy mains)
  if (n.includes('fried rice') || n.includes('noodle') || n.includes('spaghetti') || n.includes('udon') || n.includes('pho') || n.includes('vermicelli') || n.includes('claypot') || n.includes('rice with') || n.includes('on rice') || n.includes('baked') || n.includes('pasta') || n.includes('burger') || n.includes('pizza') || n.includes('beef bowl') || n.includes('don') || (n.includes('rice') && !n.includes('white') && !n.includes('steamed'))) return 'one_dish';

  // General Dishes (Meat/Veg)
  return 'dish';
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

const selectItem = (
  candidates: FoodItem[],
  currentItems: Serving[], 
  allowDuplicates: boolean = false
): Serving | null => {
   const filtered = candidates.filter(f => {
       if (!allowDuplicates && currentItems.some(i => i.foodId === f.id)) return false;
       return true; 
   });
   
   if (filtered.length === 0) return null;
   const food = getRandomFood(filtered);
   
   return {
        foodId: food.id,
        foodName: food.name,
        count: 1,
        calories: food.calories,
        totalCalories: food.calories
   };
}

const getCandidates = (pool: FoodItem[], allFoods: FoodItem[], category: FoodCategory, minCal: number = 0, maxCal: number = 9999): FoodItem[] => {
    let cands = pool.filter(f => categorizeFood(f.name) === category && f.calories >= minCal && f.calories <= maxCal);
    if (cands.length === 0) {
        // Fallback to all foods if preference filtering was too strict (avoid empty lists)
        cands = allFoods.filter(f => categorizeFood(f.name) === category && f.calories >= minCal && f.calories <= maxCal);
    }
    return cands;
}

const generateBreakfast = (target: number, pool: FoodItem[], allFoods: FoodItem[]): Meal => {
    const items: Serving[] = [];
    let currentCals = 0;

    // 1. Main Item
    const mains = getCandidates(pool, allFoods, 'breakfast');
    // If no breakfast items found (unlikely), fallback to one_dish (noodles)
    const candidates = mains.length > 0 ? mains : getCandidates(pool, allFoods, 'one_dish');
    
    const main = selectItem(candidates, items);
    if (main) {
        items.push(main);
        currentCals += main.calories;
    }

    // 2. Side/Drink (Max 2 items total)
    if (currentCals < target * 0.8 && items.length < 2) {
        const drinks = getCandidates(pool, allFoods, 'dessert', 0, 300); // Tea/Drinks
        const smallBfast = getCandidates(pool, allFoods, 'breakfast', 0, 300);
        const side = selectItem([...drinks, ...smallBfast], items);
        if (side) {
            items.push(side);
            currentCals += side.calories;
        }
    }

    return { items, totalCalories: currentCals, targetCalories: target };
};

const generateLunch = (target: number, pool: FoodItem[], allFoods: FoodItem[]): Meal => {
    const items: Serving[] = [];
    let currentCals = 0;
    
    // 70% chance of One Dish Meal (Noodles/Fried Rice), 30% Rice+Dish
    const useOneDish = Math.random() < 0.7; 

    if (useOneDish) {
        const oneDishPool = getCandidates(pool, allFoods, 'one_dish');
        const main = selectItem(oneDishPool, items);
        if (main) {
            items.push(main);
            currentCals += main.calories;
        }
        
        // Add side (veg/soup) if calories allow. Max 2 items.
        if (currentCals < target * 0.85 && items.length < 2) {
             const sidePool = [
                 ...getCandidates(pool, allFoods, 'dish', 0, 200),
                 ...getCandidates(pool, allFoods, 'soup', 0, 150)
             ];
             const side = selectItem(sidePool, items);
             if (side) {
                 items.push(side);
                 currentCals += side.calories;
             }
        }
    } else {
        // Rice + Dish. Max 3 items (Rice + Main + Veg).
        const staples = getCandidates(pool, allFoods, 'staple');
        const rice = selectItem(staples, items);
        if (rice) {
            items.push(rice);
            currentCals += rice.calories;
        } else {
             // Fallback to one_dish if no staple
             const backup = selectItem(getCandidates(pool, allFoods, 'one_dish'), items);
             if(backup) { items.push(backup); currentCals += backup.calories; }
        }

        const dishes = getCandidates(pool, allFoods, 'dish', 150); // Mains > 150
        const mainDish = selectItem(dishes, items);
        if (mainDish) {
            items.push(mainDish);
            currentCals += mainDish.calories;
        }
        
        if (currentCals < target * 0.9 && items.length < 3) {
             const veg = selectItem(getCandidates(pool, allFoods, 'dish', 0, 150), items);
             if (veg) { items.push(veg); currentCals += veg.calories; }
        }
    }

    return { items, totalCalories: currentCals, targetCalories: target };
}

const generateDinner = (target: number, pool: FoodItem[], allFoods: FoodItem[]): Meal => {
    const items: Serving[] = [];
    let currentCals = 0;

    // 1. Rice (Essential for HK dinner)
    let staples = getCandidates(pool, allFoods, 'staple');
    if (staples.length === 0) staples = getCandidates(pool, allFoods, 'one_dish'); // Fallback

    const rice = selectItem(staples, items);
    if (rice) {
        items.push(rice);
        currentCals += rice.calories;
    }

    // 2. Main Dish (Meat/Heavy)
    // Priority #2
    const remaining = target - currentCals;
    const heavyDishes = getCandidates(pool, allFoods, 'dish', 200);
    const mainDish = selectItem(heavyDishes, items);
    if (mainDish) {
        items.push(mainDish);
        currentCals += mainDish.calories;
    }

    // 3. Third item: Veg OR Soup. Max 3 items total.
    if (items.length < 3) {
         // Create a pool of sides: Veggies (dishes < 250 cal) and Soups
         // Prefer Veg (70%) for balanced meal, Soup (30%) if user likes liquid
         const preferVeg = Math.random() < 0.7;
         const veggies = getCandidates(pool, allFoods, 'dish', 0, 250);
         const soups = getCandidates(pool, allFoods, 'soup');

         let side: Serving | null = null;
         
         if (preferVeg) {
             side = selectItem(veggies, items);
             if (!side) side = selectItem(soups, items); // Fallback to soup if no veg found
         } else {
             side = selectItem(soups, items);
             if (!side) side = selectItem(veggies, items); // Fallback to veg if no soup found
         }

         if (side) {
             items.push(side);
             currentCals += side.calories;
         }
    }

    return { items, totalCalories: currentCals, targetCalories: target };
}

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

  // Generate meals with structured templates
  const breakfast = generateBreakfast(breakfastTarget, pool, foods);
  const lunch = generateLunch(lunchTarget, pool, foods);
  const dinner = generateDinner(dinnerTarget, pool, foods);

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