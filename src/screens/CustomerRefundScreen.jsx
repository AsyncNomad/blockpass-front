import { useEffect, useMemo, useState } from "react";
import BackButton from "./BackButton.jsx";
import LoadingScreen from "./LoadingScreen.jsx";
import api from "../utils/api";
import { useAccount, useChainId, useConnect, usePublicClient, useSwitchChain, useWalletClient } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { walletEnabled } from "../web3Modal.js";
import { blockpassAbi } from "../contracts/blockpassPass.js";
import { sepolia } from "wagmi/chains";

const toSeconds = (period, unit) => {
  const value = Number(period);
  if (!Number.isFinite(value)) return 0;
  if (unit === "일") return value * 24 * 60 * 60;
  if (unit === "시간") return value * 60 * 60;
  return value * 60;
};

const getElapsedLabel = (startAt) => {
  if (!startAt) return "0분";
  const elapsedMinutes = Math.max(0, Math.floor((Date.now() - Date.parse(startAt)) / 60000));
  if (elapsedMinutes >= 24 * 60) {
    return `${Math.ceil(elapsedMinutes / (24 * 60))}일`;
  }
  if (elapsedMinutes >= 60) {
    return `${Math.ceil(elapsedMinutes / 60)}시간`;
  }
  return `${Math.max(1, elapsedMinutes)}분`;
};

const getRefundRule = (ticket) => {
  const rules = Array.isArray(ticket?.refund_rules) ? ticket.refund_rules : [];
  if (!ticket?.startAt || rules.length === 0) {
    return { percent: 0, amountEth: "0" };
  }
  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - Date.parse(ticket.startAt)) / 1000));
  for (const rule of rules) {
    const threshold = toSeconds(rule.period, rule.unit);
    if (elapsedSeconds < threshold) {
      const percent = Number(rule.refund_percent) || 0;
      const amount = ((Number(ticket.price) || 0) * percent) / 100;
      return { percent, amountEth: amount.toFixed(6) };
    }
  }
  return { percent: 0, amountEth: "0" };
};

export default function CustomerRefundScreen({ ticket, onBack, onComplete }) {
  const [showLoading, setShowLoading] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { isConnected } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const web3Modal = walletEnabled ? useWeb3Modal() : { open: async () => {} };
  const { open } = web3Modal;
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const connectInjected = async () => {
    const connector =
      connectors.find((item) => item.id === "injected") || connectors[0];
    if (!connector) {
      setErrorMessage("?????? ??? ???.");
      return;
    }
    await connectAsync({ connector });
  };

  const elapsedLabel = useMemo(() => getElapsedLabel(ticket?.startAt), [ticket]);
  const refundInfo = useMemo(() => getRefundRule(ticket), [ticket]);

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

  if (!ticket) {
    return (
      <div className="main-screen">
        <section className="main-section detail-screen">
          {onBack && <BackButton onBack={onBack} />}
          <p className="confirm-copy">환불 정보를 불러올 수 없습니다.</p>
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
            이용권이 시작한지 <span className="detail-strong">{elapsedLabel}</span>이
            지났어요.
          </p>
          <p className="detail-spacer">
            지금 환불하면 이용권 금액의{" "}
            <span className="detail-strong">{refundInfo.percent}%</span>,{" "}
            <span className="detail-strong">{refundInfo.amountEth} ETH</span>이 환불돼요.
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
          onClick={async () => {
            setErrorMessage("");
            if (!ticket?.contract_address) {
              setErrorMessage("계약 정보를 찾을 수 없습니다.");
              return;
            }
            if (!isConnected) {
              if (walletEnabled) {
                await open();
              } else {
                await connectInjected();
              }
              return;
            }
            if (chainId !== sepolia.id) {
              setErrorMessage("Sepolia 네트워크로 전환해주세요.");
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
              setErrorMessage("지갑 연결 상태를 확인해주세요.");
              return;
            }
            try {
              setShowLoading(true);
              const hash = await walletClient.writeContract({
                address: ticket.contract_address,
                abi: blockpassAbi,
                functionName: "refund",
              });
              await publicClient.waitForTransactionReceipt({ hash });
              await api.post(`/orders/refund/${ticket.id}`, {
                tx_hash: hash,
                chain: "sepolia",
              });
              setShowLoading(false);
              setShowComplete(true);
            } catch (error) {
              console.error("환불 실패:", error);
              setShowLoading(false);
              setErrorMessage("환불에 실패했습니다. 다시 시도해주세요.");
            }
          }}
        >
          네, 환불할게요.
        </button>
        {errorMessage && <p className="wallet-error">{errorMessage}</p>}
      </section>
    </div>
  );
}
