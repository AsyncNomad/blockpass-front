import { createWeb3Modal } from "@web3modal/wagmi/react";
import { wagmiConfig, projectId, chains, walletEnabled } from "./web3Modal.js";

if (walletEnabled) {
  createWeb3Modal({
    wagmiConfig,
    projectId,
    chains,
    enableAnalytics: false,
  });
}
