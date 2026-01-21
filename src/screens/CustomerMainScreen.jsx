import { useEffect, useState } from "react";
import MainNav from "./MainNav.jsx";
import healthLogo from "../../assets/healthlogo.png";
import api from "../utils/api";

export default function CustomerMainScreen({ onTickets, onMain, onMy, onAddPass }) {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        setLoading(true);
        const response = await api.get("/facilities/list");
        setFacilities(response.data || []);
      } catch (err) {
        console.error("시설 조회 실패:", err);
        setError("시설 정보를 불러올 수 없습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchFacilities();
  }, []);

  return (
    <div className="main-screen customer-main">
      <section className="main-section">
        <div className="section-header sticky-title">
          <span className="section-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" role="img">
              <path d="M12 3a7 7 0 0 1 7 7c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 7-7z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
          </span>
          <h2 className="main-title">주변 추천</h2>
        </div>
        <div className="main-cards grid-cards">
          {loading && (
            <div style={{ padding: "24px", color: "#94a3b8" }}>불러오는 중...</div>
          )}
          {!loading && error && (
            <div style={{ padding: "24px", color: "#ef4444" }}>{error}</div>
          )}
          {!loading && !error && facilities.length === 0 && (
            <div style={{ padding: "24px", color: "#94a3b8" }}>표시할 시설이 없습니다.</div>
          )}
          {!loading &&
            !error &&
            facilities.map((item) => (
              <div className="main-card" key={item.id || item.name}>
                <div className="card-image">
                  <img
                    className="card-image-img"
                    src={healthLogo}
                    alt="이용권 이미지"
                  />
                </div>
                <div className="main-card-title">{item.name}</div>
                <div className="main-card-sub">
                  <span className="pin" aria-hidden="true" />
                  <span className="num">{item.price_display || "가격 준비중"}</span>
                </div>
              </div>
            ))}
        </div>
      </section>
      <button className="policy-cta" type="button" onClick={onAddPass}>
        새로운 이용권 추가하기
      </button>
      <MainNav active="main" onTickets={onTickets} onMain={onMain} onMy={onMy} />
    </div>
  );
}
