import { useState, useEffect } from "react";
import BusinessNav from "./BusinessNav.jsx";
import api from "../utils/api";

export default function BusinessMainScreen({
  onMembers,
  onMain,
  onMy,
  onAddPolicy,
  onTerms,
}) {
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 이용권 목록 불러오기
  useEffect(() => {
    const fetchPasses = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('access_token');
        if (!token) {
          setError("로그인이 필요합니다.");
          return;
        }
        const response = await api.get('/business/passes');
        setPasses(response.data);
      } catch (err) {
        console.error("이용권 목록 조회 실패:", err);
        setError("이용권 목록을 불러올 수 없습니다.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPasses();
  }, []);

  return (
    <div className="main-screen business-main">
      <section className="main-section">
        <h2 className="main-title">판매중인 이용권</h2>
        
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            불러오는 중...
          </div>
        )}
        
        {!loading && error && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#ef4444' }}>
            {error}
          </div>
        )}
        
        {!loading && !error && passes.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            등록된 이용권이 없습니다.
          </div>
        )}
        
        {!loading && !error && passes.length > 0 && (
          <div className="main-cards">
            {passes.map((pass) => (
              <button
                className="main-card main-card-button"
                key={pass.id || pass.title}
                type="button"
                onClick={() => onTerms?.(pass)}
              >
                <div className="main-card-title">{pass.title}</div>
                <div className="main-card-sub">{pass.price} ETH</div>
              </button>
            ))}
          </div>
        )}
      </section>

      <button className="policy-cta" type="button" onClick={onAddPolicy}>
        새로운 이용권 정책 추가
      </button>

      <BusinessNav active="main" onMembers={onMembers} onMain={onMain} onMy={onMy} />
    </div>
  );
}
