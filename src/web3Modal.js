import { QueryClient } from "@tanstack/react-query";
import { defaultWagmiConfig } from "@web3modal/wagmi/react";
import { sepolia } from "wagmi/chains";

// WalletConnect Project ID는 .env에 VITE_WALLETCONNECT_PROJECT_ID로 설정하세요.
export const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

export const metadata = {
  name: "Blockpass",
  description: "Membership pass dApp",
  url: typeof window !== "undefined" ? window.location.origin : "https://test.sbserver.store",
  icons: [],
};

export const chains = [sepolia];

export const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  enableWalletConnect: true,
  enableInjected: true,
});

export const queryClient = new QueryClient();
