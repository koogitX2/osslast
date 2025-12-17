import { useEffect, useRef } from "react";

const KAKAO_APPKEY = process.env.REACT_APP_KAKAO_APPKEY;

export default function KakaoMap() {
  const mapRef = useRef(null);

  console.log("KAKAO KEY:", process.env.REACT_APP_KAKAO_APPKEY);

  useEffect(() => {
    const existingScript = document.querySelector('script[data-kakao="true"]');

    const initMap = () => {
      if (!window.kakao || !window.kakao.maps) return;

      window.kakao.maps.load(() => {
        const HGU = { lat: 36.1039, lng: 129.3883 };

        const map = new window.kakao.maps.Map(mapRef.current, {
          center: new window.kakao.maps.LatLng(HGU.lat, HGU.lng),
          level: 3,
        });

        window.kakao.maps.event.addListener(map, "click", (mouseEvent) => {
          const latlng = mouseEvent.latLng;
          console.log("lat:", latlng.getLat(), "lng:", latlng.getLng());
        });

        
        const places = [
          { name: "학생회관", lat: 36.10233564114472, lng: 129.38920392250336 },
          { name: "샐러디", lat: 36.102268625888804, lng: 129.39007897550985 },
          { name: "GS25", lat: 36.10208558742422, lng: 129.38999571233788},
          { name: "라운지", lat: 36.10216965129694, lng: 129.39029802208003 },
        ];

        places.forEach((p) => {
          const pos = new window.kakao.maps.LatLng(p.lat, p.lng);

          const m = new window.kakao.maps.Marker({ position: pos });
          m.setMap(map);

          const overlay = new window.kakao.maps.CustomOverlay({
            position: pos,
            yAnchor: 1.8,
            content: `
              <div style="
                background:white;
                border:1px solid #ddd;
                border-radius:10px;
                padding:6px 10px;
                font-size:13px;
                font-weight:600;
                box-shadow:0 4px 12px rgba(0,0,0,0.12);
                white-space:nowrap;
              ">
                ${p.name}
              </div>
            `,
          });
          overlay.setMap(map);
        });
      });
    };

    if (existingScript) {
      initMap();
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.defer = true;
    script.dataset.kakao = "true";
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APPKEY}&autoload=false`;
    script.onload = initMap;
    document.head.appendChild(script);
  }, []);

  return (
    <div
      ref={mapRef}
      style={{ width: "100%", height: "520px", borderRadius: 12 }}
    />
  );
}
