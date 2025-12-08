import { useState } from 'react';
import axios from 'axios';

const API_URL = "https://693d0c12f55f1be79301c5ef.mockapi.io/user_plans";

function AdminPage() {
    const [userId, setUserId] = useState('');
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!userId) {
            alert("ID를 입력해주세요!");
            return;
        }

        setLoading(true);
        setSearched(true);
        try {
            const res = await axios.get(`${API_URL}?userId=${userId}`);
            setPlans(res.data || []);
        } catch (err) {
            alert("검색 실패");
            setPlans([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("삭제하시겠습니까?")) return;
        try {
            await axios.delete(`${API_URL}/${id}`);
            alert("삭제됨");
            setPlans(plans.filter(p => p.id !== id));
        } catch (err) {
            alert("삭제 실패");
        }
    };

    return (
        <section className="section">
            <h1 className="section-title">과거 식단 불러오기</h1>
            <p className="section-sub">아이디를 입력하면 과거에 추천받았던 식단을 볼 수 있습니다.</p>

            <div style={{ background: '#f8f9fc', padding: '20px', borderRadius: '16px', marginBottom: '30px', border: '1px solid #eef2f8' }}>
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <input
                        type="text"
                        className="mullang-input"
                        placeholder="나만의 ID 입력"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        style={{ width: '250px' }}
                    />
                    <button type="submit" className="mullang-btn" disabled={loading}>
                        {loading ? '검색 중...' : '검색하기'}
                    </button>
                </form>
            </div>

            {loading && <p style={{ textAlign: 'center' }}>로딩 중...</p>}

            {!loading && searched && plans.length === 0 && (
                <p style={{ textAlign: 'center', color: '#888' }}>저장된 식단이 없습니다.</p>
            )}

            {!loading && plans.length > 0 && (
                <div>
                    <h3 style={{ color: '#333b5c', marginBottom: '15px' }}>저장된 식단 ({plans.length}개)</h3>
                    <div style={{ display: 'grid', gap: '15px' }}>
                        {plans.map((plan) => (
                            <div key={plan.id} style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #eef2f8', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                    <div>
                                        <span style={{ fontSize: '12px', color: '#888' }}>{new Date(plan.createdAt).toLocaleString('ko-KR')}</span>
                                        <h4 style={{ margin: '5px 0', color: '#333b5c' }}>목표 {plan.result?.targets?.calories || '?'} kcal</h4>
                                    </div>
                                    <button onClick={() => handleDelete(plan.id)} style={{ background: '#ff6b6b', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer' }}>삭제</button>
                                </div>

                                {plan.result?.plan3 && (
                                    <div style={{ marginBottom: '10px', padding: '10px', background: '#f8f9fc', borderRadius: '8px' }}>
                                        <p style={{ fontWeight: 'bold', color: '#d14f92', fontSize: '13px', marginBottom: '5px' }}>3끼 ({plan.result.plan3.totalNutrition.calories} kcal)</p>
                                        <p style={{ fontSize: '12px', color: '#555' }}>
                                            아침: {plan.result.plan3.meals.breakfast?.name || '-'} | 점심: {plan.result.plan3.meals.lunch?.name || '-'} | 저녁: {plan.result.plan3.meals.dinner?.name || '-'}
                                        </p>
                                    </div>
                                )}

                                {plan.result?.plan2 && (
                                    <div style={{ padding: '10px', background: '#fff4f4', borderRadius: '8px' }}>
                                        <p style={{ fontWeight: 'bold', color: '#ff6b6b', fontSize: '13px', marginBottom: '5px' }}>2끼 ({plan.result.plan2.totalNutrition.calories} kcal)</p>
                                        <p style={{ fontSize: '12px', color: '#555' }}>
                                            점심: {plan.result.plan2.meals.lunch?.name || '-'} | 저녁: {plan.result.plan2.meals.dinner?.name || '-'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}

export default AdminPage;
