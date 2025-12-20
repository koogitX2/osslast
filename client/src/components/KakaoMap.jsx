import { useEffect, useRef, useState, useCallback } from "react";

const KAKAO_APPKEY = process.env.REACT_APP_KAKAO_APPKEY;

export default function KakaoMap() {
  const mapContainerRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);

  const [filterMode, setFilterMode] = useState('under2km');
  const [places, setPlaces] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [searchTrigger, setSearchTrigger] = useState(false);

  // 지도 초기화
  useEffect(() => {
    const existingScript = document.querySelector('script[data-kakao="true"]');

    const initMap = () => {
      if (!window.kakao || !window.kakao.maps) return;

      window.kakao.maps.load(() => {
        const HGU = { lat: 36.1039, lng: 129.3883 };
        const container = mapContainerRef.current;
        const options = {
          center: new window.kakao.maps.LatLng(HGU.lat, HGU.lng),
          level: 4,
        };
        const map = new window.kakao.maps.Map(container, options);
        mapInstance.current = map;

        // 교내 식당 마커 (고정)
        const internalPlaces = [
          { name: "학생회관", lat: 36.10233564114472, lng: 129.38920392250336 },
          { name: "샐러디", lat: 36.102268625888804, lng: 129.39007897550985 },
          { name: "GS25", lat: 36.10208558742422, lng: 129.38999571233788 },
          { name: "라운지", lat: 36.10216965129694, lng: 129.39029802208003 },
        ];

        internalPlaces.forEach((p) => {
          const pos = new window.kakao.maps.LatLng(p.lat, p.lng);
          const overlay = new window.kakao.maps.CustomOverlay({
            position: pos,
            yAnchor: 2.0,
            content: `
              <div style="
                background:#ff6b6b;
                color:white;
                border:1px solid #c92a2a;
                border-radius:10px;
                padding:6px 10px;
                font-size:13px;
                font-weight:700;
                box-shadow:0 4px 12px rgba(0,0,0,0.2);
                white-space:nowrap;
              ">
                ${p.name} (교내)
              </div>
            `,
          });
          overlay.setMap(map);
        });

        setIsMapLoaded(true);
      });
    };

    if (existingScript) {
      initMap();
    } else {
      const script = document.createElement("script");
      script.async = true;
      script.defer = true;
      script.dataset.kakao = "true";
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APPKEY}&autoload=false&libraries=services`;
      script.onload = initMap;
      document.head.appendChild(script);
    }
  }, []);



  // 검색 로직 (필터나 키워드가 바뀌면 실행)
  useEffect(() => {
    if (!isMapLoaded || !mapInstance.current || !window.kakao.maps.services) return;

    // 마커 표시 함수
    const displayMarker = (place) => {
      const marker = new window.kakao.maps.Marker({
        map: mapInstance.current,
        position: new window.kakao.maps.LatLng(place.y, place.x),
        title: place.place_name,
      });

      const infowindow = new window.kakao.maps.InfoWindow({ zIndex: 1, removable: true });
      window.kakao.maps.event.addListener(marker, 'click', function () {
        infowindow.setContent(`
            <div style="padding:10px;font-size:12px;min-width:150px;">
                <strong style="color:#007bff;">${place.place_name}</strong><br/>
                ${place.category_name.split('>').pop()}<br/>
                <a href="${place.place_url}" target="_blank" style="color:blue">상세보기</a>
            </div>
        `);
        infowindow.open(mapInstance.current, marker);
      });

      return marker;
    };

    const ps = new window.kakao.maps.services.Places();
    const HGU = { lat: 36.1039, lng: 129.3883 };

    // 이전 마커 지우기
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    const searchRadius = filterMode === 'under2km' ? 2000 : 4000;
    const searchOption = {
      location: new window.kakao.maps.LatLng(HGU.lat, HGU.lng),
      radius: searchRadius,
      sort: window.kakao.maps.services.SortBy.DISTANCE,
    };

    const placesSearchCB = (data, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        let resultData = data;

        // 클라이언트 필터링 (2km~4km 인 경우)
        if (filterMode === '2to4km') {
          resultData = data.filter(place => parseInt(place.distance) > 2000);
        }

        setPlaces(resultData);

        // 지도에 마커 찍기
        const newMarkers = resultData.map((place) => displayMarker(place));
        markersRef.current = newMarkers;

      } else {
        setPlaces([]);
      }
    };

    // 검색 실행
    if (keyword.trim()) {
      ps.keywordSearch(keyword, placesSearchCB, searchOption);
    } else {
      ps.categorySearch('FD6', placesSearchCB, searchOption);
    }

  }, [isMapLoaded, filterMode, keyword, searchTrigger]); // searchTrigger가 바뀌면 검색 실행

  const handleSearchClick = (e) => {
    e.preventDefault();
    setSearchTrigger(prev => !prev); // 버튼 누르면 트리거 변경 -> useEffect 실행
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearchClick(e);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: '#f8f9fc', padding: '15px', borderRadius: '12px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#333' }}>거리 선택:</span>

          <button
            onClick={() => setFilterMode('under2km')}
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              border: '1px solid #ddd',
              background: filterMode === 'under2km' ? '#4c6ef5' : 'white',
              color: filterMode === 'under2km' ? 'white' : '#555',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: filterMode === 'under2km' ? 'bold' : 'normal',
            }}
          >
            2km 이내
          </button>

          <button
            onClick={() => setFilterMode('2to4km')}
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              border: '1px solid #ddd',
              background: filterMode === '2to4km' ? '#4c6ef5' : 'white',
              color: filterMode === '2to4km' ? 'white' : '#555',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: filterMode === '2to4km' ? 'bold' : 'normal',
            }}
          >
            2km ~ 4km
          </button>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="검색어 입력 (예: 돈가스)"
            className="mullang-input"
            style={{ flex: 1, padding: '8px 12px', fontSize: '14px' }}
          />
          <button onClick={handleSearchClick} className="mullang-btn" style={{ padding: '8px 16px' }}>검색</button>
        </div>
      </div>

      <div
        ref={mapContainerRef}
        style={{ width: "100%", height: "500px", borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
      />

      <div className="restaurant-list">
        <h3 style={{ fontSize: '18px', marginBottom: '10px', color: '#333' }}>
          {keyword ? `'${keyword}' 검색 결과` :
            filterMode === 'under2km' ? '학교 주변 맛집 (2km 이내)' : '학교 주변 맛집 (2km ~ 4km)'}
        </h3>
        <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '12px', padding: '10px' }}>
          {places.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#888', padding: '20px' }}>
              {isMapLoaded ? "결과가 없습니다." : "로딩 중..."}
            </p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {places.map((p) => (
                <li key={p.id} style={{ padding: '12px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <strong style={{ display: 'block', fontSize: '15px', color: '#333' }}>
                      <a href={p.place_url} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>{p.place_name}</a>
                    </strong>
                    <span style={{ fontSize: '12px', color: '#888' }}>{p.category_name.split('>').pop()}</span>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#666' }}>{p.road_address_name || p.address_name}</p>
                  </div>
                  <span style={{ fontSize: '12px', color: '#d14f92', fontWeight: 'bold', minWidth: '50px', textAlign: 'right' }}>{p.distance}m</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
