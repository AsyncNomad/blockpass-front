import { useEffect, useMemo, useState } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import BackButton from "./BackButton.jsx";
import api from "../utils/api";

const steps = [
  {
    title: "결제에 활용할 가상자산 지갑을 등록해주세요",
    button: "완료",
  },
];

export default function CustomerScreen({ onComplete, onBack }) {
  const { address, isConnecting, status } = useAccount();
  const { disconnect } = useDisconnect();
  const { open } = useWeb3Modal();
  const [stepIndex, setStepIndex] = useState(-1);
  const [walletAddress, setWalletAddress] = useState("");
  const [walletError, setWalletError] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveComplete, setSaveComplete] = useState(false);

  const isIntro = stepIndex === -1 && !saveComplete;
  const isComplete = saveComplete;
  const isForm = stepIndex >= 0 && stepIndex < steps.length && !saveComplete;
  const stepLabel = useMemo(() => `${stepIndex + 1}/1`, [stepIndex]);
  const progressPercent = useMemo(() => ((stepIndex + 1) / 1) * 100, [stepIndex]);
  const isStepValid = useMemo(
    () => walletAddress.trim().length > 0,
    [walletAddress]
  );

  const handleNext = () => {
    if (stepIndex === -1) {
      setStepIndex(0);
      return;
    }
    if (!isStepValid) {
      return;
    }
    if (stepIndex === steps.length - 1) {
      handleComplete();
      return;
    }
    setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleWalletConnect = async () => {
    setWalletError("");
    try {
      // 이전 세션이 꼬여 있을 수 있으니 연결 중 상태면 끊고 다시 시도
      if (status === "connecting" || status === "reconnecting") {
        await disconnect();
      }
      await open();
    } catch (error) {
      setWalletError("지갑 연결에 실패했어요. 다시 시도해주세요.");
    }
  };

  const handleComplete = async () => {
    if (isSaving) {
      return;
    }
    setIsSaving(true);
    try {
      const signupDataStr = localStorage.getItem("signupData");
      if (signupDataStr) {
        const signupData = JSON.parse(signupDataStr);
        try {
          await api.post("/auth/register", {
            email: signupData.email,
            password: signupData.password,
            name: signupData.name,
            role: "customer",
          });
          const formBody = new URLSearchParams();
          formBody.append("username", signupData.email);
          formBody.append("password", signupData.password);
          const loginResponse = await api.post("/auth/login", formBody, {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          });
          localStorage.setItem("access_token", loginResponse.data.access_token);
          localStorage.setItem("user_role", "customer");
          localStorage.setItem("user_name", signupData.name);
        } catch (registerError) {
          if (registerError.response?.status === 400) {
            const formBody = new URLSearchParams();
            formBody.append("username", signupData.email);
            formBody.append("password", signupData.password);
            const loginResponse = await api.post("/auth/login", formBody, {
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
            });
            localStorage.setItem("access_token", loginResponse.data.access_token);
            localStorage.setItem("user_role", "customer");
            localStorage.setItem("user_name", signupData.name);
          } else {
            throw registerError;
          }
        }
        localStorage.removeItem("signupData");
      }
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("로그인이 필요합니다. 다시 로그인해주세요.");
      }
      const response = await api.patch("/auth/profile", {
        wallet_address: walletAddress,
      });
      if (response?.data?.status !== "success") {
        throw new Error("지갑 주소 저장에 실패했습니다.");
      }
      localStorage.setItem("user_wallet_address", walletAddress);
      setSaveComplete(true);
      setTimeout(() => {
        if (onComplete) {
          onComplete();
        }
      }, 800);
    } catch (error) {
      console.error("고객 정보 저장 실패:", error);
      alert("정보 저장에 실패했습니다. 다시 시도해주세요.");
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (address) {
      setWalletAddress(address);
      setWalletError("");
    }
  }, [address]);

  useEffect(() => {
    const storedName = localStorage.getItem("user_name");
    if (storedName) {
      setDisplayName(storedName);
    }
  }, []);

  return (
    <div className="flow-screen business-flow" key="customer">
      {onBack && !isComplete && <BackButton onBack={onBack} />}
      {isIntro && (
        <>
          <div className="greeting-block">
            <h2 className="greeting-title">
              {displayName ? `${displayName} 고객님,` : "고객님,"}
            </h2>
            <p className="greeting-sub">
              이용권 구매를 위해 필요한 몇 가지 질문에 답변해주세요.
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
            <button
              className="wallet-button"
              type="button"
              onClick={handleWalletConnect}
            >
              메타마스크 연결하기
            </button>
            {walletAddress && (
              <div className="wallet-address">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </div>
            )}
            {walletError && <div className="wallet-error">{walletError}</div>}
          </div>

          <button
            className="next-button cta-static"
            type="button"
            disabled={!isStepValid || isSaving}
            onClick={handleNext}
          >
            {isSaving ? "저장 중..." : steps[stepIndex].button}
          </button>
        </>
      )}

      {isComplete && (
        <div className="complete-block no-back">
          <h2 className="complete-title">등록이 완료되었어요.</h2>
        </div>
      )}
    </div>
  );
}
