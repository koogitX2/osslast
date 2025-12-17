import KakaoMap from "../components/KakaoMap";
function MapPage() {
    return (
        <section className="section">
            <h1 className="section-title">캠퍼스 지도에서 식당 찾기</h1>
            <p className="section-sub">지도를 보고 식당 위치를 확인하세요.</p>
            <div className="map-container">
               <KakaoMap />
            </div>
        </section>
    );
}

export default MapPage;
