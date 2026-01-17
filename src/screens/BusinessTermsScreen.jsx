import BackButton from "./BackButton.jsx";

export default function BusinessTermsScreen({ pass, onBack }) {
  return (
    <div className="main-screen">
      <section className="main-section detail-screen">
        {onBack && <BackButton onBack={onBack} />}
        <h2 className="main-title top-title">세부 약관</h2>
        <div className="detail-card">
          <p>{pass?.title || "이용권"}</p>
          <p>이용권은 결제 즉시 활성화되며 환불 규정이 적용돼요.</p>
          <p>스마트 컨트랙트 배포 이후에는 변경할 수 없어요.</p>
        </div>
      </section>
    </div>
  );
}
