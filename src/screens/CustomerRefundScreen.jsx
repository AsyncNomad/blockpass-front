import { useEffect, useState } from "react";
import BackButton from "./BackButton.jsx";
import LoadingScreen from "./LoadingScreen.jsx";

export default function CustomerRefundScreen({ onBack, onComplete }) {
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
        <LoadingScreen message="블록체인의 스마트 컨트랙트에 기록된 규정 그대로\n연결된 지갑 주소로 환불중이에요." />
      </div>
    );
  }

  if (showComplete) {
    return (
      <div className="main-screen no-back">
        <section className="main-section">
          <div className="complete-block">
            <h2 className="complete-title">환불이 완료되었어요.</h2>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="main-screen">
      <section className="main-section detail-screen">
        {onBack && <BackButton onBack={onBack} />}
        <h2 className="main-title top-title">환불하기</h2>
        <div className="detail-card detail-hero stagger">
          <p>
            이용권이 시작한지 <span className="detail-strong">3일</span>이
            지났어요.
          </p>
          <p className="detail-spacer">
            지금 환불하면 이용권 금액의{" "}
            <span className="detail-strong">60%</span>,{" "}
            <span className="detail-strong">0.06 ETH</span>이 환불돼요.
          </p>
          <p className="detail-spacer">
            환불 과정은 추가 절차 없이 블록체인의 스마트 컨트랙트가{" "}
            <span className="detail-strong">즉시 집행</span>해요.
          </p>
        </div>
        <p className="confirm-copy">계속 진행할까요?</p>
        <button
          className="primary fixed-cta"
          type="button"
          onClick={() => setShowLoading(true)}
        >
          네, 환불할게요.
        </button>
      </section>
    </div>
  );
}
