import { useState } from 'react';

function InputForm({ onSubmit, isLoading }) {
    const [userId, setUserId] = useState('');
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (userId && height && weight) onSubmit(userId, height, weight);
    };

    return (
        <div className="input-section">
            <h2 className="place-title" style={{ textAlign: 'center', marginBottom: '16px' }}>내 정보 입력하고 추천받기</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-row" style={{ marginBottom: '10px' }}>
                    <input type="text" className="mullang-input" placeholder="나만의 ID 입력 (필수)" value={userId} onChange={(e) => setUserId(e.target.value)} required style={{ width: '100%' }} />
                </div>
                <div className="form-row">
                    <input type="number" className="mullang-input" placeholder="키 (cm)" value={height} onChange={(e) => setHeight(e.target.value)} required />
                    <input type="number" className="mullang-input" placeholder="몸무게 (kg)" value={weight} onChange={(e) => setWeight(e.target.value)} required />
                </div>
                <div style={{ textAlign: 'center' }}>
                    <button type="submit" className="mullang-btn" disabled={isLoading}>
                        {isLoading ? '분석 중...' : '식단 추천받기'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default InputForm;
