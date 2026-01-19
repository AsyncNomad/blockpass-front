import { QueryClient } from "@tanstack/react-query";
import { defaultWagmiConfig, createWeb3Modal } from "@web3modal/wagmi/react";
import { mainnet } from "wagmi/chains";

// WalletConnect Project ID는 .env에 VITE_WALLETCONNECT_PROJECT_ID로 설정하세요.
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

const metadata = {
  name: "Blockpass",
  description: "Membership pass dApp",
  url: typeof window !== "undefined" ? window.location.origin : "https://test.sbserver.store",
  icons: [],
};

const chains = [mainnet];

export const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  enableWalletConnect: true,
  enableInjected: true,
});

export const queryClient = new QueryClient();

// Web3Modal 인스턴스 생성 (앱 시작 시 1회)
createWeb3Modal({
  wagmiConfig,
  projectId,
  chains,
  enableAnalytics: false,
});
