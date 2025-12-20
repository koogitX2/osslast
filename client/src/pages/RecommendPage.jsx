import { useState } from 'react';
import axios from 'axios';
import InputForm from '../components/InputForm';
import MealCard from '../components/MealCard';

const USER_PLANS_API_URL = "https://693d0c12f55f1be79301c5ef.mockapi.io/user_plans";

function RecommendPage({ menuData, isMenuLoading }) {
    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const calculateTDEE = (height, weight) => {
        const age = 22;
        const bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
        return Math.round(bmr * 1.375);
    };

    const calculateTargetMacros = (tdee) => {
        return {
            calories: tdee,
            carbs: Math.round((tdee * 0.5) / 4),
            protein: Math.round((tdee * 0.25) / 4),
            fat: Math.round((tdee * 0.25) / 9)
        };
    };

    const recommendMeals = (targetCalories) => {
        if (!menuData || menuData.length === 0) return null;

        const breakfastOptions = menuData.filter(m => m.type === 'breakfast');
        const lunchOptions = menuData.filter(m => m.type === 'lunch');
        const dinnerOptions = menuData.filter(m => m.type === 'dinner');

        let bestPlan3 = null;
        let minCalorieDiff3 = Infinity;
        let bestPlan2 = null;
        let minCalorieDiff2 = Infinity;

        // 1000번 무작위로 조합을 만들어보고, 가장 목표 칼로리에 가까운 식단을 찾습니다.
        for (let i = 0; i < 1000; i++) {
            const breakfast = breakfastOptions[Math.floor(Math.random() * breakfastOptions.length)];
            const lunch = lunchOptions[Math.floor(Math.random() * lunchOptions.length)];
            const dinner = dinnerOptions[Math.floor(Math.random() * dinnerOptions.length)];

            if (!lunch || !dinner) continue;

            // 3끼 조한 (아침 + 점심 + 저녁)
            if (breakfast) {
                const currentCalories = breakfast.calories + lunch.calories + dinner.calories;
                const diff = Math.abs(targetCalories - currentCalories);

                if (diff < minCalorieDiff3) {
                    minCalorieDiff3 = diff;
                    bestPlan3 = {
                        totalNutrition: {
                            calories: currentCalories,
                            carbs: breakfast.carbs + lunch.carbs + dinner.carbs,
                            protein: breakfast.protein + lunch.protein + dinner.protein,
                            fat: breakfast.fat + lunch.fat + dinner.fat
                        },
                        meals: { breakfast, lunch, dinner }
                    };
                }
            }

            // 2끼 조합 (점심 + 저녁)
            const currentCalories2 = lunch.calories + dinner.calories;
            const diff2 = Math.abs(targetCalories - currentCalories2);

            if (diff2 < minCalorieDiff2) {
                minCalorieDiff2 = diff2;
                bestPlan2 = {
                    totalNutrition: {
                        calories: currentCalories2,
                        carbs: lunch.carbs + dinner.carbs,
                        protein: lunch.protein + dinner.protein,
                        fat: lunch.fat + dinner.fat
                    },
                    meals: { lunch, dinner }
                };
            }
        }
        return { best3: bestPlan3, best2: bestPlan2 }; // 기존 return 구조 유지 (호환성)
    };

    const handleRecommend = async (userId, height, weight) => {
        if (isMenuLoading) {
            alert("메뉴 데이터를 아직 불러오는 중입니다.");
            return;
        }

        setIsLoading(true);

        setTimeout(async () => {
            try {
                const tdee = calculateTDEE(Number(height), Number(weight));
                const targetMacros = calculateTargetMacros(tdee);
                const { best3, best2 } = recommendMeals(tdee) || {};

                if (!best3 || !best2) {
                    alert("추천할 메뉴 조합을 찾지 못했습니다.");
                    setIsLoading(false);
                    return;
                }

                const newResult = { tdee, targets: targetMacros, plan3: best3, plan2: best2 };
                setResult(newResult);

                await axios.post(USER_PLANS_API_URL, {
                    userId: userId,
                    result: newResult,
                    createdAt: new Date().toISOString()
                });
            } catch (err) {
                alert("오류가 발생했습니다.");
            } finally {
                setIsLoading(false);
            }
        }, 600);
    };

    return (
        <section className="section">
            <h1 className="section-title">오늘의 추천 식단</h1>
            <p className="section-sub">키와 몸무게를 입력하면 메뉴를 추천해드려요.</p>

            <InputForm onSubmit={handleRecommend} isLoading={isLoading} />

            {result && (
                <div>
                    <div className="result-group">
                        <h2 style={{ fontSize: '18px', marginBottom: '15px' }}>3끼 추천 (아침+점심+저녁)</h2>

                        <div style={{ padding: '20px', border: '1px solid #eee', marginBottom: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', textAlign: 'center' }}>
                                <div>
                                    <p style={{ fontSize: '12px', color: '#666' }}>하루 권장 목표 (Target)</p>
                                    <h3 style={{ fontSize: '18px', margin: '5px 0' }}>{result.targets.calories} kcal</h3>
                                    <div style={{ fontSize: '13px', color: '#555' }}>
                                        탄수 {result.targets.carbs}g / 단백 {result.targets.protein}g / 지방 {result.targets.fat}g
                                    </div>
                                </div>
                                <div style={{ borderLeft: '1px solid #ddd' }}>
                                    <p style={{ fontSize: '12px', color: '#666' }}>3끼 총합 (Total)</p>
                                    <h3 style={{ fontSize: '18px', margin: '5px 0' }}>{result.plan3.totalNutrition.calories} kcal</h3>
                                    <div style={{ fontSize: '13px', color: '#555' }}>
                                        {result.plan3.totalNutrition.carbs}g / {result.plan3.totalNutrition.protein}g / {result.plan3.totalNutrition.fat}g
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="meal-cards">
                            <MealCard title="아침" menu={result.plan3.meals.breakfast} />
                            <MealCard title="점심" menu={result.plan3.meals.lunch} />
                            <MealCard title="저녁" menu={result.plan3.meals.dinner} />
                        </div>
                    </div>

                    <div className="result-group" style={{ marginTop: '40px' }}>
                        <h2 style={{ fontSize: '18px', marginBottom: '15px' }}>2끼 추천 (점심+저녁)</h2>

                        <div style={{ padding: '20px', border: '1px solid #eee', marginBottom: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', textAlign: 'center' }}>
                                <div>
                                    <p style={{ fontSize: '12px', color: '#666' }}>하루 권장 목표 (Target)</p>
                                    <h3 style={{ fontSize: '18px', margin: '5px 0' }}>{result.targets.calories} kcal</h3>
                                    <div style={{ fontSize: '13px', color: '#555' }}>
                                        탄수 {result.targets.carbs}g / 단백 {result.targets.protein}g / 지방 {result.targets.fat}g
                                    </div>
                                </div>
                                <div style={{ borderLeft: '1px solid #ddd' }}>
                                    <p style={{ fontSize: '12px', color: '#666' }}>2끼 총합 (Total)</p>
                                    <h3 style={{ fontSize: '18px', margin: '5px 0' }}>{result.plan2.totalNutrition.calories} kcal</h3>
                                    <div style={{ fontSize: '13px', color: '#555' }}>
                                        {result.plan2.totalNutrition.carbs}g / {result.plan2.totalNutrition.protein}g / {result.plan2.totalNutrition.fat}g
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="meal-cards">
                            <div className="meal-card" style={{ background: '#f9f9f9', color: '#888' }}>
                                <h3>아침 없음</h3>
                                <p>패스</p>
                            </div>
                            <MealCard title="점심" menu={result.plan2.meals.lunch} />
                            <MealCard title="저녁" menu={result.plan2.meals.dinner} />
                        </div>
                    </div>
                </div>
            )}

            {!result && !isLoading && (
                <div style={{ textAlign: 'center', color: '#8892b0', padding: '40px' }}>
                    {isMenuLoading ? "메뉴 데이터를 불러오는 중..." : "정보를 입력하세요"}
                </div>
            )}
        </section>
    );
}

export default RecommendPage;
