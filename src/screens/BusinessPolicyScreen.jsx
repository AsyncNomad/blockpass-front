import { useEffect, useMemo, useRef, useState } from "react";
import BackButton from "./BackButton.jsx";
import LoadingScreen from "./LoadingScreen.jsx";
import api from "../utils/api"; // 추가
import { useAccount, useChainId, usePublicClient, useSwitchChain, useWalletClient } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { parseEther } from "viem";
import { blockpassAbi, blockpassBytecode } from "../contracts/blockpassPass.js";
import { sepolia } from "wagmi/chains";

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
  const [savedPass, setSavedPass] = useState(null);
  const [deployError, setDeployError] = useState("");

  const persistPendingPolicy = (extra) => {
    const pending = {
      passName,
      terms,
      passPriceEth,
      durationValue,
      durationUnit,
      refundRules,
      ...extra,
    };
    localStorage.setItem("businessPolicyPending", JSON.stringify(pending));
  };

  const clearPendingPolicy = () => {
    localStorage.removeItem("businessPolicyPending");
  };
  const saveTriggered = useRef(false);
  const { isConnected } = useAccount();
  const { open } = useWeb3Modal();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const toSeconds = (period, unit) => {
    const value = Number(period);
    if (!Number.isFinite(value)) return 0;
    if (unit === "일") return value * 24 * 60 * 60;
    if (unit === "시간") return value * 60 * 60;
    return value * 60;
  };

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

  const removeRefundRule = (index) => {
    setRefundRules((prev) => {
      if (prev.length <= 1) {
        return prev;
      }
      return prev.filter((_, ruleIndex) => ruleIndex !== index);
    });
  };

  const handleNext = () => {
    if (!canNext) {
      return;
    }
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setStep((prev) => {
      if (prev > 1) {
        return prev - 1;
      }
      if (onCancel) {
        onCancel();
      }
      return prev;
    });
  };

  const handleDeploy = async () => {
    setDeployError("");
    if (!isConnected) {
      await open();
      return;
    }
    if (!blockpassBytecode || blockpassBytecode === "0x") {
      setDeployError("컨트랙트 빌드가 필요합니다. build:contracts를 먼저 실행해주세요.");
      return;
    }
    if (chainId !== sepolia.id) {
      setDeployError("Sepolia 네트워크로 전환해주세요.");
      if (switchChainAsync) {
        try {
          await switchChainAsync({ chainId: sepolia.id });
        } catch (error) {
          console.error("네트워크 전환 실패:", error);
        }
      }
      return;
    }
    if (!walletClient || !publicClient) {
      setDeployError("지갑 연결 상태를 확인해주세요.");
      return;
    }
    try {
      persistPendingPolicy();
      setShowLoading(true);

      const durationSeconds = toSeconds(durationValue, durationUnit);
      if (!durationSeconds) {
        throw new Error("duration_invalid");
      }
      const thresholds = refundRules.map((rule) =>
        BigInt(toSeconds(rule.period, rule.unit))
      );
      const percents = refundRules.map((rule) => BigInt(Number(rule.refund)));

      const hash = await walletClient.deployContract({
        abi: blockpassAbi,
        bytecode: blockpassBytecode,
        args: [parseEther(passPriceEth), BigInt(durationSeconds), thresholds, percents],
      });
      persistPendingPolicy({ txHash: hash, chainId: publicClient.chain?.id || sepolia.id });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      const contractAddress = receipt.contractAddress;
      if (!contractAddress) {
        throw new Error("컨트랙트 주소를 확인할 수 없습니다.");
      }

      let durationMinutes = parseInt(durationValue, 10);
      if (durationUnit === "일") {
        durationMinutes = durationMinutes * 24 * 60;
      } else if (durationUnit === "시간") {
        durationMinutes = durationMinutes * 60;
      }
      const durationInDays = Math.max(1, Math.ceil(durationMinutes / (24 * 60)));

      const response = await api.post("/business/passes", {
        title: passName,
        terms,
        price: parseFloat(passPriceEth),
        duration_days: durationInDays,
        duration_minutes: durationMinutes,
        refund_rules: refundRules.map((rule) => ({
          period: Number(rule.period),
          unit: rule.unit,
          refund_percent: Number(rule.refund),
        })),
        contract_address: contractAddress,
        contract_chain: publicClient.chain ? String(publicClient.chain.id) : "sepolia",
      });

      setShowLoading(false);
      const createdPass = response?.data ?? null;
      setSavedPass(createdPass);
      if (createdPass) {
        localStorage.setItem("businessPolicyComplete", "1");
        localStorage.setItem("lastBusinessPass", JSON.stringify(createdPass));
      }
      setShowComplete(true);
    } catch (error) {
      console.error("컨트랙트 배포 실패:", error);
      setShowLoading(false);
      setDeployError("배포에 실패했습니다. 다시 시도해주세요.");
      clearPendingPolicy();
    }
  };

  useEffect(() => {
    if (!showComplete || !savedPass) {
      return undefined;
    }
    if (saveTriggered.current) {
      return undefined;
    }
    saveTriggered.current = true;
    const timer = setTimeout(() => {
      if (onSave) {
        onSave(savedPass);
      }
      localStorage.removeItem("businessPolicyComplete");
      localStorage.removeItem("lastBusinessPass");
      clearPendingPolicy();
    }, 1800);
    return () => clearTimeout(timer);
  }, [showComplete, onSave, savedPass]);

  useEffect(() => {
    if (showComplete || savedPass) {
      return;
    }
    const completedFlag = localStorage.getItem("businessPolicyComplete");
    const lastPass = localStorage.getItem("lastBusinessPass");
    if (!completedFlag || !lastPass) {
      return;
    }
    try {
      const parsed = JSON.parse(lastPass);
      setSavedPass(parsed);
      setShowComplete(true);
    } catch {
      localStorage.removeItem("businessPolicyComplete");
      localStorage.removeItem("lastBusinessPass");
    }
  }, [showComplete, savedPass]);

  useEffect(() => {
    if (showComplete || savedPass) {
      return;
    }
    const pendingRaw = localStorage.getItem("businessPolicyPending");
    if (!pendingRaw) {
      return;
    }
    let pending;
    try {
      pending = JSON.parse(pendingRaw);
    } catch {
      clearPendingPolicy();
      return;
    }
    if (!pending?.txHash || !publicClient) {
      return;
    }
    const resume = async () => {
      try {
        setDeployError("");
        setShowLoading(true);
        const receipt = await publicClient.waitForTransactionReceipt({
          hash: pending.txHash,
        });
        const contractAddress = receipt.contractAddress;
        if (!contractAddress) {
          throw new Error("컨트랙트 주소를 확인할 수 없습니다.");
        }
        let durationMinutes = parseInt(pending.durationValue, 10);
        if (pending.durationUnit === "일") {
          durationMinutes = durationMinutes * 24 * 60;
        } else if (pending.durationUnit === "시간") {
          durationMinutes = durationMinutes * 60;
        }
        const durationInDays = Math.max(1, Math.ceil(durationMinutes / (24 * 60)));
        const response = await api.post("/business/passes", {
          title: pending.passName,
          terms: pending.terms,
          price: parseFloat(pending.passPriceEth),
          duration_days: durationInDays,
          duration_minutes: durationMinutes,
          refund_rules: (pending.refundRules || []).map((rule) => ({
            period: Number(rule.period),
            unit: rule.unit,
            refund_percent: Number(rule.refund),
          })),
          contract_address: contractAddress,
          contract_chain: String(pending.chainId || sepolia.id),
        });
        setShowLoading(false);
        const createdPass = response?.data ?? null;
        setSavedPass(createdPass);
        if (createdPass) {
          localStorage.setItem("businessPolicyComplete", "1");
          localStorage.setItem("lastBusinessPass", JSON.stringify(createdPass));
        }
        setShowComplete(true);
      } catch (error) {
        console.error("배포 복구 실패:", error);
        setShowLoading(false);
        setDeployError("배포 복구에 실패했습니다. 다시 시도해주세요.");
        clearPendingPolicy();
      }
    };
    resume();
  }, [publicClient, showComplete, savedPass]);

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
        {onCancel && <BackButton onBack={handleBack} />}
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
          <div className="form-block stagger-block">
            <div className="policy-step">
              <div className="policy-fixed">
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
                  placeholder=""
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
            </div>

            <div className="refund-scroll">
              <div className="refund-list">
                {refundRules.map((rule, index) => (
                  <div className="refund-card" key={`refund-${index}`}>
                    <div className="refund-line">
                      사용자가
                      <input
                        className="policy-input"
                        type="number"
                        placeholder=""
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
                    {refundRules.length > 1 && (
                      <div className="refund-actions">
                        <button
                          className="remove-rule"
                          type="button"
                          onClick={() => removeRefundRule(index)}
                        >
                          -
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <button className="add-rule" type="button" onClick={addRefundRule}>
                +
              </button>
            </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="form-block">
            <h2 className="form-title">
              계약서를
              <br />
              블록체인에 배포할게요
            </h2>
            <button className="wallet-button" type="button" onClick={handleDeploy}>
              메타마스크 지갑으로 배포하기
            </button>
            {deployError && <p className="wallet-error">{deployError}</p>}
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
