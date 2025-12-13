<<<<<<< HEAD
import KakaoMap from "../components/KakaoMap";
=======
>>>>>>> 253fb87 (15주차 과제 완료)
function MapPage() {
    return (
        <section className="section">
            <h1 className="section-title">캠퍼스 지도에서 식당 찾기</h1>
            <p className="section-sub">지도를 보고 식당 위치를 확인하세요.</p>
            <div className="map-container">
<<<<<<< HEAD
               <KakaoMap />
=======
                <img src="/campus-map.png" className="campus-map" alt="캠퍼스 지도" onError={(e) => e.target.style.display = 'none'} />
>>>>>>> 253fb87 (15주차 과제 완료)
            </div>
        </section>
    );
}

export default MapPage;
