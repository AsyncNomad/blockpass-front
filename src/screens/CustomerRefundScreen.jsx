import BackButton from "./BackButton.jsx";

export default function CustomerRefundScreen({ onBack }) {
  return (
    <div className="main-screen">
      <section className="main-section">
        {onBack && <BackButton onBack={onBack} />}
        <h2 className="main-title">환불하기</h2>
        <div className="detail-card">
          <p>
            이용권이 시작한지 3일이 지났어요. 지금 환불하면 이용권 금액의 60%,
            120,000원이 환불돼요.
          </p>
          <p>
            환불 과정은 추가 절차 없이 블록체인의 스마트 컨트랙트가 즉시 집행해요.
            계속 진행할까요?
          </p>
        </div>
        <button className="primary" type="button">
          네, 환불할게요.
        </button>
      </section>
    </div>
  );
}
