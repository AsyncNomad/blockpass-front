import { createWeb3Modal } from "@web3modal/wagmi/react";
import { wagmiConfig, projectId, chains } from "./web3Modal.js";

createWeb3Modal({
  wagmiConfig,
  projectId,
  chains,
  enableAnalytics: false,
});
