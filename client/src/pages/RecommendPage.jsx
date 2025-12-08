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

        let best3 = null;
        let minDiff3 = Infinity;
        let best2 = null;
        let minDiff2 = Infinity;

        for (let i = 0; i < 1000; i++) {
            const b = breakfastOptions[Math.floor(Math.random() * breakfastOptions.length)];
            const l = lunchOptions[Math.floor(Math.random() * lunchOptions.length)];
            const d = dinnerOptions[Math.floor(Math.random() * dinnerOptions.length)];

            if (!l || !d) continue;

            if (b) {
                const cal3 = b.calories + l.calories + d.calories;
                const diff3 = Math.abs(targetCalories - cal3);
                if (diff3 < minDiff3) {
                    minDiff3 = diff3;
                    best3 = {
                        totalNutrition: {
                            calories: cal3,
                            carbs: b.carbs + l.carbs + d.carbs,
                            protein: b.protein + l.protein + d.protein,
                            fat: b.fat + l.fat + d.fat
                        },
                        meals: { breakfast: b, lunch: l, dinner: d }
                    };
                }
            }

            const cal2 = l.calories + d.calories;
            const diff2 = Math.abs(targetCalories - cal2);
            if (diff2 < minDiff2) {
                minDiff2 = diff2;
                best2 = {
                    totalNutrition: {
                        calories: cal2,
                        carbs: l.carbs + d.carbs,
                        protein: l.protein + d.protein,
                        fat: l.fat + d.fat
                    },
                    meals: { lunch: l, dinner: d }
                };
            }
        }
        return { best3, best2 };
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
            <p className="section-sub">키와 몸무게를 입력하면 영양 밸런스를 고려해 최적의 메뉴를 추천해드려요.</p>

            <InputForm onSubmit={handleRecommend} isLoading={isLoading} />

            {result && (
                <div className="animate-fade-in">
                    <div className="result-group">
                        <h2 style={{ marginTop: '40px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>3끼 추천 (아침+점심+저녁)</h2>

                        <div style={{ background: '#f8f9fc', borderRadius: '16px', padding: '20px', margin: '20px 0', border: '1px solid #eef2f8' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', textAlign: 'center' }}>
                                <div>
                                    <p style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>하루 권장 목표 (Target)</p>
                                    <h3 style={{ color: '#333b5c', margin: '0 0 10px 0', fontSize: '18px' }}>{result.targets.calories} kcal</h3>
                                    <div style={{ fontSize: '13px', color: '#555', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                                        <span>탄수 {result.targets.carbs}g</span>
                                        <span>단백 {result.targets.protein}g</span>
                                        <span>지방 {result.targets.fat}g</span>
                                    </div>
                                </div>
                                <div style={{ borderLeft: '1px solid #ddd' }}>
                                    <p style={{ fontSize: '12px', color: '#d14f92', marginBottom: '8px', fontWeight: 'bold' }}>3끼 총합 (Total)</p>
                                    <h3 style={{ color: '#d14f92', margin: '0 0 10px 0', fontSize: '18px' }}>{result.plan3.totalNutrition.calories} kcal</h3>
                                    <div style={{ fontSize: '13px', color: '#333', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                                        <span>{result.plan3.totalNutrition.carbs}g</span>
                                        <span>{result.plan3.totalNutrition.protein}g</span>
                                        <span>{result.plan3.totalNutrition.fat}g</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="meal-cards">
                            <MealCard title="든든한 아침" menu={result.plan3.meals.breakfast} />
                            <MealCard title="활기찬 점심" menu={result.plan3.meals.lunch} />
                            <MealCard title="가벼운 저녁" menu={result.plan3.meals.dinner} />
                        </div>
                    </div>

                    <div className="result-group" style={{ marginTop: '60px' }}>
                        <h2 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>2끼 추천 (점심+저녁)</h2>
                        <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px' }}>아침을 거르시는 분들을 위한 추천 조합입니다.</p>

                        <div style={{ background: '#fff4f4', borderRadius: '16px', padding: '20px', margin: '20px 0', border: '1px solid #ffebeb' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', textAlign: 'center' }}>
                                <div>
                                    <p style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>하루 권장 목표 (Target)</p>
                                    <h3 style={{ color: '#333b5c', margin: '0 0 10px 0', fontSize: '18px' }}>{result.targets.calories} kcal</h3>
                                    <div style={{ fontSize: '13px', color: '#555', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                                        <span>탄수 {result.targets.carbs}g</span>
                                        <span>단백 {result.targets.protein}g</span>
                                        <span>지방 {result.targets.fat}g</span>
                                    </div>
                                </div>
                                <div style={{ borderLeft: '1px solid #ffccd5' }}>
                                    <p style={{ fontSize: '12px', color: '#ff6b6b', marginBottom: '8px', fontWeight: 'bold' }}>2끼 총합 (Total)</p>
                                    <h3 style={{ color: '#ff6b6b', margin: '0 0 10px 0', fontSize: '18px' }}>{result.plan2.totalNutrition.calories} kcal</h3>
                                    <div style={{ fontSize: '13px', color: '#d63030', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                                        <span>{result.plan2.totalNutrition.carbs}g</span>
                                        <span>{result.plan2.totalNutrition.protein}g</span>
                                        <span>{result.plan2.totalNutrition.fat}g</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="meal-cards">
                            <div className="meal-card placeholder" style={{ opacity: 0.5, background: '#f0f0f0' }}>
                                <h3>아침 패스</h3>
                                <p>섭취 없음</p>
                            </div>
                            <MealCard title="푸짐한 점심" menu={result.plan2.meals.lunch} />
                            <MealCard title="푸짐한 저녁" menu={result.plan2.meals.dinner} />
                        </div>
                    </div>
                </div>
            )}

            {!result && !isLoading && (
                <div style={{ textAlign: 'center', color: '#8892b0', padding: '40px' }}>
                    {isMenuLoading ? "메뉴 데이터를 불러오는 중입니다..." : "정보를 입력하고 추천 버튼을 눌러보세요!"}
                </div>
            )}
        </section>
    );
}

export default RecommendPage;
