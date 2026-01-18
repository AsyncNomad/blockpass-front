import BackButton from "./BackButton.jsx";
import MainNav from "./MainNav.jsx";

export default function OcrResultScreen({ onBack, onTickets, onMain, onMy }) {
  return (
    <div className="main-screen">
      <section className="main-section detail-screen">
        {onBack && <BackButton onBack={onBack} />}
        <h2 className="main-title top-title">계약서 분석 완료</h2>
        
        <div className="detail-card">
          <p>✅ 블록체인 검증 완료</p>
          <p>계약서가 안전하게 등록되었습니다.</p>
        </div>

        <button 
          className="policy-cta" 
          type="button" 
          onClick={onMain}
        >
          메인으로 이동
        </button>
      </section>
      <MainNav active="main" onTickets={onTickets} onMain={onMain} onMy={onMy} />
    </div>
  );
}