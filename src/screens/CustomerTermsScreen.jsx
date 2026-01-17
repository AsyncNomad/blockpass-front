import BackButton from "./BackButton.jsx";

export default function CustomerTermsScreen({ onBack }) {
  return (
    <div className="main-screen">
      <section className="main-section detail-screen">
        {onBack && <BackButton onBack={onBack} />}
        <h2 className="main-title top-title">세부 약관</h2>
        <div className="detail-card">
          <p>이용권은 결제 즉시 활성화되며 이용 기간 내 환불 규정이 적용돼요.</p>
          <p>결제 완료 후 스마트 컨트랙트가 조건을 자동으로 집행합니다.</p>
        </div>
      </section>
    </div>
  );
}
