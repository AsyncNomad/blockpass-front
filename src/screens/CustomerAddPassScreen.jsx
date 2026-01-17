import { useEffect, useMemo, useState } from "react";
import LoadingScreen from "./LoadingScreen.jsx";

const merchants = [
  { id: "fit-1", name: "블록핏 헬스장", passes: ["1개월권", "3개월권", "PT 10회권"] },
  { id: "fit-2", name: "코어바디 피트니스", passes: ["1개월권", "6개월권"] },
  { id: "study-1", name: "스테디 독서실", passes: ["자유석 1개월", "지정석 3개월"] },
];

export default function CustomerAddPassScreen({ onComplete }) {
  const [mode, setMode] = useState("choice");
  const [step, setStep] = useState(1);
  const [query, setQuery] = useState("");
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [selectedPass, setSelectedPass] = useState("");
  const [showTerms, setShowTerms] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [paid, setPaid] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [showPaidScreen, setShowPaidScreen] = useState(false);

  const filteredMerchants = useMemo(() => {
    const keyword = query.trim();
    if (!keyword) {
      return merchants;
    }
    return merchants.filter((item) => item.name.includes(keyword));
  }, [query]);

  const canNext =
    (step === 1 && selectedMerchant) ||
    (step === 2 && accepted) ||
    (step === 3 && paid);

  useEffect(() => {
    if (!showLoading) {
      return undefined;
    }
    const timer = setTimeout(() => {
      setShowLoading(false);
      setShowPaidScreen(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, [showLoading]);

  useEffect(() => {
    if (!showPaidScreen) {
      return undefined;
    }
    const timer = setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, 1400);
    return () => clearTimeout(timer);
  }, [showPaidScreen, onComplete]);

  const handleNext = () => {
    if (!canNext) {
      return;
    }
    setStep((prev) => Math.min(prev + 1, 3));
  };

  const handleSelectMerchant = (item) => {
    setSelectedMerchant(item);
    setSelectedPass("");
    setAccepted(false);
  };

  const handleSelectPass = (pass) => {
    setSelectedPass(pass);
    setShowTerms(true);
  };

  const handleAccept = () => {
    setAccepted(true);
    setShowTerms(false);
  };

  const handlePay = () => {
    setPaid(true);
    setShowLoading(true);
  };

  return (
    <div className="main-screen">
      {mode === "choice" && (
        <section className="main-section">
          <h2 className="main-title">새로운 이용권을 추가해볼게요.</h2>
          <div className="role-grid add-pass-grid">
            <button className="role" type="button">
              <span className="role-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" role="img">
                  <rect x="4" y="5" width="16" height="14" rx="2" />
                  <path d="M7 9h10M7 13h6" />
                </svg>
              </span>
              <span className="role-title">종이 계약서 스캔하기</span>
              <span className="role-desc">
                종이로 작성된 계약서를 자동으로 인식하여 블록체인에 업로드해요.
              </span>
            </button>
            <button className="role" type="button" onClick={() => setMode("digital")}>
              <span className="role-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" role="img">
                  <path d="M6 4h9l3 3v13H6z" />
                  <path d="M8 10h8M8 14h6" />
                </svg>
              </span>
              <span className="role-title">디지털 계약 생성하기</span>
              <span className="role-desc">
                사장님이 제공하는 디지털 계약서를 읽고 이용권을 결제해요.
              </span>
            </button>
          </div>
        </section>
      )}

      {mode === "digital" && !showPaidScreen && !showLoading && (
        <section className="main-section flow-section">
          <div className="progress-wrap">
            <div className="progress-track">
              <span className="progress-fill" style={{ width: `${(step / 3) * 100}%` }} />
            </div>
            <div className="step-indicator">{step}/3</div>
          </div>

          {step === 1 && (
            <div className="form-block">
              <h2 className="form-title">어떤 가게인가요?</h2>
              <input
                className="input-field"
                type="text"
                placeholder="가맹점을 검색해보세요"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <div className="merchant-list">
                {filteredMerchants.map((item) => (
                  <button
                    key={item.id}
                    className={`merchant-card ${
                      selectedMerchant?.id === item.id ? "active" : ""
                    }`}
                    type="button"
                    onClick={() => handleSelectMerchant(item)}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="form-block">
              <h2 className="form-title">이용권 종류를 선택해주세요.</h2>
              <div className="ticket-list">
                {(selectedMerchant?.passes || []).map((pass) => (
                  <button
                    key={pass}
                    className="ticket-card ticket-button"
                    type="button"
                    onClick={() => handleSelectPass(pass)}
                  >
                    <div className="ticket-title">{pass}</div>
                    <div className="ticket-period">디지털 계약 확인 필요</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="form-block">
              <h2 className="form-title">이용권 금액을 결제해볼게요.</h2>
              <button
                className="wallet-button"
                type="button"
                onClick={handlePay}
                disabled={paid}
              >
                메타마스크로 결제하기
              </button>
            </div>
          )}

          {step < 3 && (
            <button
              className="next-button cta-static"
              type="button"
              disabled={!canNext}
              onClick={handleNext}
            >
              다음
            </button>
          )}
        </section>
      )}

      {mode === "digital" && showLoading && (
        <LoadingScreen message="계약 내용, 환불 규정, 결제 금액을 위변조 불가능하도록 블록체인에 업로드하고 있어요." />
      )}

      {mode === "digital" && showPaidScreen && (
        <section className="main-section">
          <div className="complete-block">
            <h2 className="complete-title">결제가 완료되었어요.</h2>
          </div>
        </section>
      )}

      {showTerms && (
        <div className="qr-overlay" role="dialog" aria-modal="true">
          <div className="qr-sheet">
            <button className="qr-close" type="button" onClick={() => setShowTerms(false)}>
              닫기
            </button>
            <div className="qr-ticket-title">이용 약관 및 환불 규정</div>
            <div className="terms-body">
              <p>이용권은 결제 즉시 활성화되며 환불 규정은 스마트 컨트랙트로 고정돼요.</p>
              <p>동의 시 메타마스크 지갑 서명이 필요합니다.</p>
            </div>
            <button className="wallet-button" type="button" onClick={handleAccept}>
              메타마스크 지갑으로 동의하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
