import { useEffect, useState } from "react";
import BackButton from "./BackButton.jsx";
import LoadingScreen from "./LoadingScreen.jsx";

export default function CustomerBankruptcyConfirmScreen({ onBack, onComplete }) {
  const [showLoading, setShowLoading] = useState(false);
  const [showComplete, setShowComplete] = useState(false);

  useEffect(() => {
    if (!showLoading) {
      return undefined;
    }
    const timer = setTimeout(() => {
      setShowLoading(false);
      setShowComplete(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, [showLoading]);

  useEffect(() => {
    if (!showComplete) {
      return undefined;
    }
    const timer = setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, 1400);
    return () => clearTimeout(timer);
  }, [showComplete, onComplete]);

  if (showLoading) {
    return (
      <div className="main-screen">
        <LoadingScreen message="스마트 컨트랙트에 기록된 파산 상황에서의 환불 규칙 그대로 환불중이에요." />
      </div>
    );
  }

  if (showComplete) {
    return (
      <div className="main-screen no-back">
        <section className="main-section">
          <div className="complete-block complete-with-copy">
            <h2 className="complete-title">환불이 완료되었어요.</h2>
            <p className="complete-sub bankruptcy-sub">
              Blockpass가 사업체의 파산 상황에서도
              <br />
              고객님의 자산을 지켜드렸어요!
            </p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="main-screen">
      <section className="main-section detail-screen">
        {onBack && <BackButton onBack={onBack} />}
        <h2 className="main-title top-title">파산 확인</h2>
        <div className="detail-card detail-hero stagger">
          <p>다수의 신고가 접수되어 해당 사업체의 파산이 확인되었습니다.</p>
          <p className="detail-spacer">등록한 지갑 주소로 환불을 진행할까요?</p>
        </div>
        <p className="confirm-copy">계속 진행할까요?</p>
        <button
          className="primary fixed-cta"
          type="button"
          onClick={() => setShowLoading(true)}
        >
          네, 진행할게요.
        </button>
      </section>
    </div>
  );
}
