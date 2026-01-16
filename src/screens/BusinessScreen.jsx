import { useEffect, useMemo, useState } from "react";

const steps = [
  {
    title: "사업장 이름을 알려주세요",
    button: "다음",
  },
  {
    title: "사업자등록번호를 알려주세요",
    button: "다음",
  },
  {
    title: "사업장 위치를 알려주세요",
    button: "다음",
  },
  {
    title: "사업장 대표 가상자산 지갑을 등록해주세요",
    button: "완료",
  },
];

export default function BusinessScreen({ onComplete }) {
  const [stepIndex, setStepIndex] = useState(-1);
  const [businessName, setBusinessName] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [walletError, setWalletError] = useState("");

  const isIntro = stepIndex === -1;
  const isComplete = stepIndex === steps.length;
  const isForm = stepIndex >= 0 && stepIndex < steps.length;
  const stepLabel = useMemo(() => `${stepIndex + 1}/4`, [stepIndex]);
  const progressPercent = useMemo(
    () => ((stepIndex + 1) / 4) * 100,
    [stepIndex]
  );

  const isStepValid = useMemo(() => {
    if (stepIndex === 0) {
      return businessName.trim().length > 0;
    }
    if (stepIndex === 1) {
      return registrationNumber.trim().length > 0;
    }
    if (stepIndex === 2) {
      return locationQuery.trim().length > 0;
    }
    if (stepIndex === 3) {
      return walletAddress.trim().length > 0;
    }
    return false;
  }, [stepIndex, businessName, registrationNumber, locationQuery, walletAddress]);

  const handleNext = () => {
    setStepIndex((prev) => Math.min(prev + 1, steps.length));
  };

  const handleWalletConnect = async () => {
    setWalletError("");
    if (!window.ethereum) {
      setWalletError("메타마스크를 설치해주세요.");
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setWalletAddress(accounts?.[0] || "");
    } catch (error) {
      setWalletError("지갑 연결에 실패했어요. 다시 시도해주세요.");
    }
  };

  useEffect(() => {
    if (!isComplete) {
      return;
    }

    const timer = setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [isComplete, onComplete]);

  return (
    <div className="card flow-screen business-flow" key="business">
      {isIntro && (
        <>
          <div className="greeting-block">
            <h2 className="greeting-title">홍길동 사장님</h2>
            <p className="greeting-sub">
              사업장 정보를 등록하기 위해 필요한 몇 가지 질문 답변해주세요.
            </p>
          </div>
          <button className="next-button cta-static" type="button" onClick={handleNext}>
            다음
          </button>
        </>
      )}

      {isForm && (
        <>
          <div className="progress-wrap">
            <div className="progress-track">
              <span
                className="progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="step-indicator">{stepLabel}</div>
          </div>

          <div className="form-block">
            <h2 className="form-title">{steps[stepIndex].title}</h2>
            {stepIndex === 0 && (
              <input
                className="input-field"
                type="text"
                placeholder="예: 블록패스 피트니스"
                value={businessName}
                onChange={(event) => setBusinessName(event.target.value)}
              />
            )}
            {stepIndex === 1 && (
              <input
                className="input-field"
                type="text"
                placeholder="예: 123-45-67890"
                value={registrationNumber}
                onChange={(event) => setRegistrationNumber(event.target.value)}
              />
            )}
            {stepIndex === 2 && (
              <>
                <input
                  className="input-field"
                  type="text"
                  placeholder="주소 또는 장소를 검색해주세요"
                  value={locationQuery}
                  onChange={(event) => setLocationQuery(event.target.value)}
                />
                <div className="map-box" aria-label="지도 영역">
                  지도 영역
                </div>
              </>
            )}
            {stepIndex === 3 && (
              <>
                <button
                  className="wallet-button"
                  type="button"
                  onClick={handleWalletConnect}
                >
                  메타마스크 연결하기
                </button>
                {walletAddress && (
                  <div className="wallet-address">
                    {walletAddress.slice(0, 6)}...
                    {walletAddress.slice(-4)}
                  </div>
                )}
                {walletError && <div className="wallet-error">{walletError}</div>}
              </>
            )}
          </div>

          <button
            className="next-button cta-static"
            type="button"
            disabled={!isStepValid}
            onClick={handleNext}
          >
            {steps[stepIndex].button}
          </button>
        </>
      )}

      {isComplete && (
        <div className="complete-block">
          <h2 className="complete-title">등록이 완료되었어요.</h2>
        </div>
      )}
    </div>
  );
}
