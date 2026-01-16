import { useMemo, useState } from "react";

const initialRules = [{ period: "30", refund: "80" }];

export default function BusinessPolicyScreen({ onSave, onCancel }) {
  const [passName, setPassName] = useState("");
  const [passPrice, setPassPrice] = useState("");
  const [rules, setRules] = useState(initialRules);

  const updateRule = (index, field, value) => {
    setRules((prev) =>
      prev.map((rule, ruleIndex) =>
        ruleIndex === index ? { ...rule, [field]: value } : rule
      )
    );
  };

  const addRule = () => {
    setRules((prev) => [...prev, { period: "", refund: "" }]);
  };

  const isReady = useMemo(() => {
    if (!passName.trim() || !passPrice.trim()) {
      return false;
    }
    return rules.every(
      (rule) => rule.period.trim().length > 0 && rule.refund.trim().length > 0
    );
  }, [passName, passPrice, rules]);

  const handleSave = () => {
    if (!isReady) {
      return;
    }
    if (onSave) {
      onSave({
        title: `${passName} ${passPrice}`,
        price: passPrice,
        rules,
      });
    }
  };

  return (
    <div className="main-screen business-main">
      <section className="main-section">
        <h2 className="main-title">헬스장 전용 이용권 정책</h2>
        <div className="policy-form">
          <label className="policy-label">
            이용권 이름
            <input
              className="input-field"
              type="text"
              placeholder="예: 블록핏 헬스장 3개월권"
              value={passName}
              onChange={(event) => setPassName(event.target.value)}
            />
          </label>
          <label className="policy-label">
            판매 가격
            <input
              className="input-field"
              type="text"
              placeholder="예: 390,000원"
              value={passPrice}
              onChange={(event) => setPassPrice(event.target.value)}
            />
          </label>
        </div>
      </section>

      <section className="policy-section">
        <div className="policy-header">
          <h2 className="main-title">환불 정책 설정</h2>
          <button className="add-rule" type="button" onClick={addRule}>
            +
          </button>
        </div>
        <div className="policy-list">
          {rules.map((rule, index) => (
            <div className="policy-row" key={`rule-${index}`}>
              <input
                className="policy-input"
                type="number"
                placeholder="이용기간(%)"
                value={rule.period}
                onChange={(event) =>
                  updateRule(index, "period", event.target.value)
                }
              />
              <span className="policy-text">이전까지</span>
              <input
                className="policy-input"
                type="number"
                placeholder="환불(%)"
                value={rule.refund}
                onChange={(event) =>
                  updateRule(index, "refund", event.target.value)
                }
              />
              <span className="policy-text">환불해요</span>
            </div>
          ))}
        </div>
      </section>

      <div className="policy-actions">
        <button className="ghost" type="button" onClick={onCancel}>
          취소
        </button>
        <button className="primary" type="button" disabled={!isReady} onClick={handleSave}>
          저장
        </button>
      </div>
    </div>
  );
}
