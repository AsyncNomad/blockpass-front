import { useEffect, useState } from "react";
import BackButton from "./BackButton.jsx";
import LoadingScreen from "./LoadingScreen.jsx";
import api from "../utils/api";
import { useAccount, useChainId, useConnect, usePublicClient, useSwitchChain, useWalletClient } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { walletEnabled } from "../web3Modal.js";
import { blockpassAbi } from "../contracts/blockpassPass.js";
import { sepolia } from "wagmi/chains";

export default function CustomerBankruptcyConfirmScreen({ ticket, onBack, onComplete }) {
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
      setErrorMessage("?? ??? ??? ? ????.");
      return;
    }
    await connectAsync({ connector });
  };

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
        <h2 className="main-title top-title">파산 확인</h2>
        <div className="detail-card detail-hero stagger">
          <p>파산 신고가 접수되어 해당 사업체의 파산이 확인되었습니다.</p>
          <p className="detail-spacer">등록한 지갑 주소로 환불을 진행할까요?</p>
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
                functionName: "declareBankruptcyAndRefund",
              });
              await publicClient.waitForTransactionReceipt({ hash });
              await api.post(`/orders/bankruptcy/${ticket.id}`, {
                tx_hash: hash,
                chain: "sepolia",
              });
              setShowLoading(false);
              setShowComplete(true);
            } catch (error) {
              console.error("파산 환불 실패:", error);
              setShowLoading(false);
              setErrorMessage("환불에 실패했습니다. 다시 시도해주세요.");
            }
          }}
        >
          네, 진행할게요.
        </button>
        {errorMessage && <p className="wallet-error">{errorMessage}</p>}
      </section>
    </div>
  );
}
