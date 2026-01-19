import BackButton from "./BackButton.jsx";

export default function BusinessTermsScreen({ pass, onBack }) {
  return (
    <div className="main-screen">
      <section className="main-section detail-screen">
        {onBack && <BackButton onBack={onBack} />}
        <h2 className="main-title top-title">세부 약관</h2>
        <div className="detail-card">
          <p>{pass?.title || "이용권"}</p>
          <p>{pass?.terms || "등록된 약관이 없습니다."}</p>
        </div>
      </section>
    </div>
  );
}
