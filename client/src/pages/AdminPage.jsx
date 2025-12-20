import { useState } from 'react';
import axios from 'axios';

const API_URL = "https://693d0c12f55f1be79301c5ef.mockapi.io/user_plans";

const AdminPage = () => {
    const [userId, setUserId] = useState('');
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editMemo, setEditMemo] = useState('');

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
            // Sort by latest
            const sorted = (res.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setPlans(sorted);
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

    const startEdit = (plan) => {
        setEditingId(plan.id);
        setEditMemo(plan.memo || '');
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditMemo('');
    };

    const handleUpdateMemo = async (id) => {
        try {
            const targetPlan = plans.find(p => p.id === id);

            await axios.put(`${API_URL}/${id}`, {
                ...targetPlan,
                memo: editMemo
            });

            setPlans(plans.map(p => p.id === id ? { ...p, memo: editMemo } : p));
            setEditingId(null);
            alert("메모가 수정되었습니다!");
        } catch (err) {
            alert("수정 실패");
            console.error(err);
        }
    };

    return (
        <section className="section">
            <h1 className="section-title">과거 식단 불러오기</h1>
            <p className="section-sub">아이디를 입력하면 과거에 추천받았던 식단을 볼 수 있습니다.</p>

            <div style={{ marginBottom: '30px', textAlign: 'center' }}>
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <input
                        type="text"
                        className="mullang-input"
                        placeholder="나만의 ID 입력"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        style={{ width: '200px' }}
                    />
                    <button type="submit" className="mullang-btn" disabled={loading}>
                        {loading ? '...' : '검색'}
                    </button>
                </form>
            </div>

            {loading && <p style={{ textAlign: 'center' }}>로딩 중...</p>}

            {!loading && searched && plans.length === 0 && (
                <p style={{ textAlign: 'center', color: '#888' }}>저장된 식단이 없습니다.</p>
            )}

            {!loading && plans.length > 0 && (
                <div>
                    <h3 style={{ borderBottom: '1px solid #ddd', paddingBottom: '10px', marginBottom: '15px' }}>
                        저장된 식단 ({plans.length}개)
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {plans.map((plan) => (
                            <div key={plan.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <div>
                                        <span style={{ fontSize: '12px', color: '#888' }}>{new Date(plan.createdAt).toLocaleString('ko-KR')}</span>
                                        <h4 style={{ margin: '5px 0' }}>목표 {plan.result?.targets?.calories || '?'} kcal</h4>
                                    </div>
                                    <button onClick={() => handleDelete(plan.id)} style={{ background: '#ff4444', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>
                                        삭제
                                    </button>
                                </div>

                                {/* Memo Update Section */}
                                <div style={{ marginBottom: '10px', padding: '10px', background: '#f9f9f9', border: '1px solid #eee' }}>
                                    {editingId === plan.id ? (
                                        <div style={{ display: 'flex', gap: '5px' }}>
                                            <input
                                                type="text"
                                                value={editMemo}
                                                onChange={(e) => setEditMemo(e.target.value)}
                                                placeholder="메모 입력"
                                                style={{ flex: 1, padding: '4px' }}
                                                autoFocus
                                            />
                                            <button onClick={() => handleUpdateMemo(plan.id)}>저장</button>
                                            <button onClick={cancelEdit}>취소</button>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '14px' }}>
                                                {plan.memo ? `memo: ${plan.memo}` : '메모 없음'}
                                            </span>
                                            <button onClick={() => startEdit(plan)} style={{ fontSize: '12px', cursor: 'pointer', background: 'none', border: '1px solid #ccc' }}>
                                                수정
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {plan.result?.plan3 && (
                                    <div style={{ marginBottom: '10px', fontSize: '13px' }}>
                                        <strong>3끼 ({plan.result.plan3.totalNutrition.calories} kcal)</strong>
                                        <p style={{ color: '#555', margin: '4px 0' }}>
                                            아침: {plan.result.plan3.meals.breakfast?.name || '-'} | 점심: {plan.result.plan3.meals.lunch?.name || '-'} | 저녁: {plan.result.plan3.meals.dinner?.name || '-'}
                                        </p>
                                    </div>
                                )}

                                {plan.result?.plan2 && (
                                    <div style={{ fontSize: '13px' }}>
                                        <strong>2끼 ({plan.result.plan2.totalNutrition.calories} kcal)</strong>
                                        <p style={{ color: '#555', margin: '4px 0' }}>
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
