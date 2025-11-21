import { GoogleGenAI, Type, Schema } from "@google/genai";
import { FoodItem, UserProfile, DailyPlan, Gender } from '../types';

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

const servingSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    foodId: { type: Type.INTEGER },
    foodName: { type: Type.STRING },
    count: { type: Type.INTEGER, description: "Number of servings, max 2" },
    calories: { type: Type.INTEGER, description: "Calories per single serving" },
    totalCalories: { type: Type.INTEGER, description: "calories * count" }
  },
  required: ["foodId", "foodName", "count", "calories", "totalCalories"]
};

const mealSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    items: { type: Type.ARRAY, items: servingSchema },
    totalCalories: { type: Type.INTEGER },
    targetCalories: { type: Type.INTEGER, description: "The target goal for this meal" }
  },
  required: ["items", "totalCalories", "targetCalories"]
};

const planResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    breakfast: mealSchema,
    lunch: mealSchema,
    dinner: mealSchema,
    totalCalories: { type: Type.INTEGER },
    totalPreferenceScore: { type: Type.INTEGER }
  },
  required: ["breakfast", "lunch", "dinner", "totalCalories"]
};

export const generateMealPlan = async (
  profile: UserProfile,
  foods: FoodItem[]
): Promise<DailyPlan> => {
  const bmr = calculateBMR(profile);
  
  const breakfastTarget = Math.round(bmr * 0.25);
  const lunchTarget = Math.round(bmr * 0.35);
  const dinnerTarget = Math.round(bmr * 0.40);

  // Filter foods: Remove strictly hated foods (0 score) unless absolutely necessary, 
  // but strictly strictly speaking, 0 means "dislike", maybe we can keep them but weight them very low.
  // The prompt will handle the logic.
  
  const simplifiedFoodList = foods.map(f => ({
    id: f.id,
    n: f.name,
    c: f.calories,
    p: f.preference
  }));

  const prompt = `
    You are a Smart Diet Planner.
    User Stats:
    - Daily Calorie Target: ${bmr} kcal.
    - Breakfast Target (~25%): ${breakfastTarget} kcal.
    - Lunch Target (~35%): ${lunchTarget} kcal.
    - Dinner Target (~40%): ${dinnerTarget} kcal.
    
    Constraints:
    1. Select foods from the provided JSON list ONLY.
    2. In a single meal, the same food item MUST NOT exceed 2 servings.
    3. Maximize the Total Preference Score. Prefer foods with preference > 3. Avoid preference 0 or 1 if possible.
    4. Stay close to the calorie targets for each meal (+/- 10% tolerance is acceptable, but try to be precise).
    
    Food Database (JSON):
    ${JSON.stringify(simplifiedFoodList)}
    
    Return the result in JSON format matching the schema.
  `;

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: planResponseSchema,
        temperature: 0.3, // Lower temperature for more math-adhering results
      }
    });

    const result = JSON.parse(response.text);
    return {
      ...result,
      bmr
    };

  } catch (error) {
    console.error("Error generating plan:", error);
    throw new Error("Failed to generate diet plan. Please check your API Key or try again.");
  }
};