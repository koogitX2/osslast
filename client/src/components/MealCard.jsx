function MealCard({ title, menu }) {
    if (!menu) return null;

    return (
        <div className="meal-card recommend-card">
            <h3>{title}</h3>
            <p className="recommend-menu-line" style={{ fontWeight: 'bold', color: '#2e2c2cff' }}>
                {menu.place} : {menu.name}
            </p>
            <ul className="nutri-list">
                <li><span className="nutri-label">칼로리</span><span className="nutri-val">{menu.calories}kcal</span></li>
                <li><span className="nutri-label">단백질</span><span className="nutri-val">{menu.protein}g</span></li>
                <li><span className="nutri-label">탄수화물</span><span className="nutri-val">{menu.carbs}g</span></li>
                <li><span className="nutri-label">지방</span><span className="nutri-val">{menu.fat}g</span></li>
            </ul>
        </div>
    );
}

export default MealCard;
