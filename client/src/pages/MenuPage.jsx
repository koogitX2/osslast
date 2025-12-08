import { useState, useMemo } from 'react';

function MenuPage({ menuData, isMenuLoading }) {
    const [index, setIndex] = useState(0);

    const carouselData = useMemo(() => {
        if (!menuData || menuData.length === 0) return [];

        const grouped = {};
        menuData.forEach(item => {
            if (!grouped[item.place]) {
                grouped[item.place] = { name: item.place, breakfast: [], lunch: [], dinner: [] };
            }
            if (item.type === 'breakfast') grouped[item.place].breakfast.push(item.name);
            if (item.type === 'lunch') grouped[item.place].lunch.push(item.name);
            if (item.type === 'dinner') grouped[item.place].dinner.push(item.name);
        });

        return Object.values(grouped);
    }, [menuData]);

    const handleNext = () => setIndex((prev) => (prev + 1) % carouselData.length);
    const handlePrev = () => setIndex((prev) => (prev - 1 + carouselData.length) % carouselData.length);

    const current = carouselData.length > 0 ? carouselData[index] : null;

    return (
        <section className="section">
            <h1 className="section-title">2025년 12월 5일 금요일의 식단</h1>
            <p className="section-sub">좌우 화살표를 눌러 다른 식당의 메뉴를 확인하세요.</p>
            <div className="place-list" style={{ alignItems: 'center' }}>
                {isMenuLoading ? (
                    <p style={{ textAlign: 'center', color: '#888' }}>메뉴를 불러오는 중...</p>
                ) : current ? (
                    <div className="carousel-container" style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '10px' }}>
                        <button onClick={handlePrev} className="carousel-btn">◀</button>
                        <div className="place-box" style={{ flex: 1, minHeight: '300px' }}>
                            <h2 className="place-title" style={{ textAlign: 'center', fontSize: '22px' }}>{current.name}</h2>
                            <div className="today-grid">
                                {current.breakfast.length > 0 && <div className="today-block"><h3>조식</h3><ul>{current.breakfast.map((m, i) => <li key={i}>{m}</li>)}</ul></div>}
                                {current.lunch.length > 0 && <div className="today-block"><h3>중식</h3><ul>{current.lunch.map((m, i) => <li key={i}>{m}</li>)}</ul></div>}
                                {current.dinner.length > 0 && <div className="today-block"><h3>석식</h3><ul>{current.dinner.map((m, i) => <li key={i}>{m}</li>)}</ul></div>}
                            </div>
                        </div>
                        <button onClick={handleNext} className="carousel-btn">▶</button>
                    </div>
                ) : (
                    <p style={{ textAlign: 'center', color: '#888' }}>표시할 메뉴가 없습니다.</p>
                )}
            </div>
        </section>
    );
}

export default MenuPage;
