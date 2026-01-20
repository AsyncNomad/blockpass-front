import { QueryClient } from "@tanstack/react-query";
import { defaultWagmiConfig } from "@web3modal/wagmi/react";
import { createConfig, http } from "wagmi";
import { sepolia } from "wagmi/chains";

// WalletConnect Project ID는 .env에 VITE_WALLETCONNECT_PROJECT_ID로 설정하세요.
export const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
const isValidProjectId =
  typeof projectId === "string" &&
  projectId.trim() !== "" &&
  projectId !== "undefined" &&
  projectId !== "null";
export const walletEnabled = Boolean(isValidProjectId);

export const metadata = {
  name: "Blockpass",
  description: "Membership pass dApp",
  url: typeof window !== "undefined" ? window.location.origin : "https://test.sbserver.store",
  icons: [],
};

export const chains = [sepolia];

export const wagmiConfig = walletEnabled
  ? defaultWagmiConfig({
      chains,
      projectId,
      metadata,
      enableWalletConnect: true,
      enableInjected: true,
    })
  : createConfig({
      chains,
      transports: { [sepolia.id]: http() },
      connectors: [],
    });

export const queryClient = new QueryClient();
