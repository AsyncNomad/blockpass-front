import BackButton from "./BackButton.jsx";

export default function CustomerBankruptcyScreen({ onBack, onNext }) {
  return (
    <div className="main-screen">
      <section className="main-section detail-screen">
        {onBack && <BackButton onBack={onBack} />}
        <h2 className="main-title top-title">신고시 주의사항</h2>
        <div className="detail-card detail-hero stagger-seq">
          <p className="seq-item seq-1">
            이 기능은 시설이 실제로 파산하거나 영업을 중단해 정상적인 환불이
            불가능한 경우에만 사용해주세요.
          </p>
          <ul className="detail-bullets">
            <li className="seq-item seq-2">시설 운영이 중단되었고</li>
            <li className="seq-item seq-3">사업자와 연락이 되지 않으며</li>
            <li className="seq-item seq-4">일반적인 환불 절차를 진행할 수 없는 상황일 때</li>
          </ul>
          <p className="seq-item seq-5">
            이 신고가 접수되면, 스마트 컨트랙트에 기록된 환불 규칙에 따라 환불
            절차가 즉시 자동으로 진행됩니다.
          </p>
        </div>
        <p className="confirm-copy">계속 진행할까요?</p>
        <button
          className="primary fixed-cta"
          type="button"
          onClick={() => {
            if (onNext) {
              onNext();
            }
          }}
        >
          네, 신고할게요.
        </button>
      </section>
    </div>
  );
}
