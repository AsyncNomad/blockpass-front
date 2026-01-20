import BackButton from "./BackButton.jsx";

export default function CustomerTermsScreen({ ticket, onBack }) {
  return (
    <div className="main-screen">
      <section className="main-section detail-screen">
        {onBack && <BackButton onBack={onBack} />}
        <h2 className="main-title top-title">세부 약관</h2>
        <div className="detail-card">
          <p>{ticket?.terms || "등록된 이용 약관이 없습니다."}</p>
          <p>결제 완료 후 스마트 컨트랙트가 조건을 자동으로 집행합니다.</p>
        </div>
      </section>
    </div>
  );
}
