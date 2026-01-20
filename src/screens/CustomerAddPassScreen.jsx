import { useEffect, useMemo, useState } from "react";
import BackButton from "./BackButton.jsx";
import LoadingScreen from "./LoadingScreen.jsx";
import api from "../utils/api";
import { useAccount, useChainId, usePublicClient, useSwitchChain, useWalletClient } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { parseEther } from "viem";
import { blockpassAbi } from "../contracts/blockpassPass.js";
import { sepolia } from "wagmi/chains";

export default function CustomerAddPassScreen({ onComplete, onBack }) {
  const [mode, setMode] = useState("choice");
  const [step, setStep] = useState(1);
  const [query, setQuery] = useState("");
  const [merchants, setMerchants] = useState([]);
  const [merchantLoading, setMerchantLoading] = useState(true);
  const [merchantError, setMerchantError] = useState("");
  const [passes, setPasses] = useState([]);
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [selectedPass, setSelectedPass] = useState(null);
  const [showTerms, setShowTerms] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [paid, setPaid] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [showPaidScreen, setShowPaidScreen] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const { isConnected } = useAccount();
  const { open } = useWeb3Modal();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const filteredMerchants = useMemo(() => {
    const keyword = query.trim();
    if (!keyword) {
      return merchants;
    }
    return merchants.filter((item) => item.name.includes(keyword));
  }, [query, merchants]);

  const canNext =
    (step === 1 && selectedMerchant) ||
    (step === 2 && accepted) ||
    (step === 3 && paid);

  useEffect(() => {
    const fetchMerchants = async () => {
      try {
        setMerchantLoading(true);
        const response = await api.get("/facilities/list");
        setMerchants(response.data || []);
      } catch (err) {
        console.error("시설 목록 조회 실패:", err);
        setMerchantError("시설 목록을 불러올 수 없습니다.");
      } finally {
        setMerchantLoading(false);
      }
    };
    fetchMerchants();
  }, []);

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
    setSelectedPass(null);
    setAccepted(false);
    setPasses([]);
    if (!item?.id) {
      return;
    }
    const fetchPasses = async () => {
      try {
        const response = await api.get(`/facilities/${item.id}/passes`);
        setPasses(response.data || []);
      } catch (err) {
        console.error("이용권 조회 실패:", err);
        setPasses([]);
      }
    };
    fetchPasses();
  };

  const handleSelectPass = (pass) => {
    setSelectedPass(pass);
    setShowTerms(true);
  };

  const handleAccept = () => {
    setAccepted(true);
    setShowTerms(false);
  };

  const handlePay = async () => {
    if (!selectedPass?.id) {
      alert("이용권을 선택해주세요.");
      return;
    }
    if (!accepted) {
      setShowTerms(true);
      return;
    }
    if (!selectedPass.contract_address) {
      alert("이용권이 아직 블록체인에 배포되지 않았어요.");
      return;
    }
    if (!isConnected) {
      await open();
      return;
    }
    if (chainId !== sepolia.id) {
      setPaymentError("Sepolia 네트워크로 전환해주세요.");
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
      alert("지갑 연결 상태를 확인해주세요.");
      return;
    }
    try {
      const me = await api.get("/auth/me");
      if (me?.data?.role !== "customer") {
        setPaymentError("고객 계정으로 로그인되어 있지 않습니다.");
        return;
      }
      setPaymentError("");
      setPaid(true);
      setShowLoading(true);
      const hash = await walletClient.writeContract({
        address: selectedPass.contract_address,
        abi: blockpassAbi,
        functionName: "purchase",
        value: parseEther(String(selectedPass.price)),
      });
      await publicClient.waitForTransactionReceipt({ hash });
      await api.post(`/orders/purchase/${selectedPass.id}`, {
        tx_hash: hash,
        chain: "sepolia",
      });
      setShowLoading(false);
      setShowPaidScreen(true);
    } catch (err) {
      console.error("결제 실패:", err);
      setPaid(false);
      setShowLoading(false);
      setPaymentError("결제에 실패했습니다. 다시 시도해주세요.");
      alert("결제에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="main-screen">
      {mode === "choice" && (
        <section className="main-section">
          {onBack && <BackButton onBack={onBack} />}
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
          {onBack && <BackButton onBack={onBack} />}
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
                {merchantLoading && (
                  <div style={{ padding: "12px", color: "#94a3b8" }}>불러오는 중...</div>
                )}
                {!merchantLoading && merchantError && (
                  <div style={{ padding: "12px", color: "#ef4444" }}>{merchantError}</div>
                )}
                {!merchantLoading &&
                  !merchantError &&
                  filteredMerchants.map((item) => (
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
                {(passes || []).map((pass) => (
                  <button
                    key={pass.id}
                    className="ticket-card ticket-button"
                    type="button"
                    onClick={() => handleSelectPass(pass)}
                  >
                    <div className="ticket-title">{pass.title}</div>
                    <div className="ticket-period">{pass.price} ETH</div>
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
              {paymentError && <p className="wallet-error">{paymentError}</p>}
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
        <LoadingScreen message="계약 내용, 환불 규정, 결제 금액을 위변조 불가능하도록\n블록체인에 업로드하고 있어요." />
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
            <div className="qr-header">
              <div className="qr-ticket-title">이용 약관 및 환불 규정</div>
              <button className="qr-close" type="button" onClick={() => setShowTerms(false)}>
                닫기
              </button>
            </div>
            <div className="terms-body">
              <p>{selectedPass?.terms || "등록된 이용 약관이 없습니다."}</p>
              {Array.isArray(selectedPass?.refund_rules) &&
                selectedPass.refund_rules.length > 0 && (
                <div style={{ marginTop: "12px" }}>
                  {selectedPass.refund_rules.map((rule, index) => (
                    <p key={`refund-${index}`}>
                      {rule.period}
                      {rule.unit} 미만 사용 시 {rule.refund_percent}% 환불
                    </p>
                  ))}
                </div>
              )}
              <p style={{ marginTop: "12px" }}>
                이용권은 결제 즉시 활성화되며 환불 규정은 스마트 컨트랙트로 고정돼요.
              </p>
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
