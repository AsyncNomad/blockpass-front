import { useEffect, useMemo, useState } from "react";
import BackButton from "./BackButton.jsx";
import LoadingScreen from "./LoadingScreen.jsx";

const units = ["일", "시간", "분"];
const initialRefundRules = [{ period: "", unit: "일", refund: "" }];

export default function BusinessPolicyScreen({ onSave, onCancel }) {
  const [step, setStep] = useState(1);
  const [passName, setPassName] = useState("");
  const [passPriceEth, setPassPriceEth] = useState("");
  const [terms, setTerms] = useState("");
  const [durationValue, setDurationValue] = useState("");
  const [durationUnit, setDurationUnit] = useState("일");
  const [refundRules, setRefundRules] = useState(initialRefundRules);
  const [showLoading, setShowLoading] = useState(false);
  const [showComplete, setShowComplete] = useState(false);

  const canNext = useMemo(() => {
    if (step === 1) {
      return passName.trim().length > 0;
    }
    if (step === 2) {
      return terms.trim().length > 0;
    }
    if (step === 3) {
      if (!passPriceEth.trim() || !durationValue.trim()) {
        return false;
      }
      return refundRules.every(
        (rule) => rule.period.trim() && rule.refund.trim()
      );
    }
    if (step === 4) {
      return true;
    }
    return false;
  }, [step, passName, terms, passPriceEth, durationValue, refundRules]);

  const updateRefundRule = (index, field, value) => {
    setRefundRules((prev) =>
      prev.map((rule, ruleIndex) =>
        ruleIndex === index ? { ...rule, [field]: value } : rule
      )
    );
  };

  const addRefundRule = () => {
    setRefundRules((prev) => [...prev, { period: "", unit: "일", refund: "" }]);
  };

  const handleNext = () => {
    if (!canNext) {
      return;
    }
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const handleDeploy = () => {
    setShowLoading(true);
  };

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
      if (onSave) {
        onSave({
          title: passName,
          price: "정책 등록 완료",
          terms,
          duration: `${durationValue}${durationUnit}`,
          refundRules,
        });
      }
    }, 1400);
    return () => clearTimeout(timer);
  }, [showComplete, onSave, passName, terms, durationValue, durationUnit, refundRules]);

  if (showLoading) {
    return (
      <div className="main-screen business-main">
        <LoadingScreen message="계약서와 환불 정책을 위변조 불가능하도록\n블록체인에 배포하고 있어요." />
      </div>
    );
  }

  if (showComplete) {
    return (
      <div className="main-screen business-main no-back">
        <section className="main-section">
          <div className="complete-block">
            <h2 className="complete-title">등록이 완료되었어요.</h2>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="main-screen business-main">
      <section className="main-section flow-section">
        {onCancel && <BackButton onBack={onCancel} />}
        <div className="progress-wrap">
          <div className="progress-track">
            <span className="progress-fill" style={{ width: `${(step / 4) * 100}%` }} />
          </div>
          <div className="step-indicator">{step}/4</div>
        </div>

        {step === 1 && (
          <div className="form-block">
            <h2 className="form-title">이용권 이름을 정해볼게요.</h2>
            <input
              className="input-field"
              type="text"
              placeholder="예: 블록핏 헬스장 3개월권"
              value={passName}
              onChange={(event) => setPassName(event.target.value)}
            />
          </div>
        )}

        {step === 2 && (
          <div className="form-block">
            <h2 className="form-title">이용 약관을 추가해볼게요.</h2>
            <textarea
              className="terms-input"
              placeholder="이용 약관 내용을 입력해주세요"
              value={terms}
              onChange={(event) => setTerms(event.target.value)}
            />
          </div>
        )}

        {step === 3 && (
          <div className="form-block">
            <h2 className="form-title">가격 및 환불 정책을 추가해볼게요.</h2>
            <div className="duration-row price-row">
              <span className="policy-text">이용권 가격은</span>
              <input
                className="policy-input"
                type="text"
                placeholder=""
                value={passPriceEth}
                onChange={(event) => setPassPriceEth(event.target.value)}
              />
              <span className="policy-text">ETH에요.</span>
            </div>
            <div className="duration-row">
              <span className="policy-text">총</span>
              <input
                className="policy-input"
                type="number"
                placeholder="기간"
                value={durationValue}
                onChange={(event) => setDurationValue(event.target.value)}
              />
              <select
                className="policy-select"
                value={durationUnit}
                onChange={(event) => setDurationUnit(event.target.value)}
              >
                {units.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
              <span className="policy-text">이용 가능한 이용권이에요.</span>
            </div>

            <div className="refund-list">
              {refundRules.map((rule, index) => (
                <div className="refund-card" key={`refund-${index}`}>
                  <div className="refund-line">
                    사용자가
                    <input
                      className="policy-input"
                      type="number"
                      placeholder="기간"
                      value={rule.period}
                      onChange={(event) =>
                        updateRefundRule(index, "period", event.target.value)
                      }
                    />
                    <select
                      className="policy-select"
                      value={rule.unit}
                      onChange={(event) =>
                        updateRefundRule(index, "unit", event.target.value)
                      }
                    >
                      {units.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                    미만으로 사용하면
                  </div>
                  <div className="refund-line">
                    이용권 금액의
                    <input
                      className="policy-input"
                      type="number"
                      placeholder=""
                      value={rule.refund}
                      onChange={(event) =>
                        updateRefundRule(index, "refund", event.target.value)
                      }
                    />
                    %만큼 환불해요
                  </div>
                </div>
              ))}
            </div>
            <button className="add-rule" type="button" onClick={addRefundRule}>
              +
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="form-block">
            <h2 className="form-title">
              고객이 볼 수 있도록 계약서를 블록체인에 배포할게요.
            </h2>
            <button className="wallet-button" type="button" onClick={handleDeploy}>
              메타마스크 지갑으로 배포하기
            </button>
          </div>
        )}

        {step < 4 && (
          <button
            className="next-button cta-static"
            type="button"
            disabled={!canNext}
            onClick={handleNext}
          >
            다음
          </button>
        )}

        {step < 4 && (
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
    </div>
  );
}
