import * as fcl from "@blocto/fcl";
const isMainnet = import.meta.env.VITE_NETWORK === 'mainnet'

export const DEFAULT_APP_ID = "00000000-0000-0000-0000-000000000000";
export const FREE_FLOW_DAPP_ID = "776b8c25-1c11-43ba-a1ec-47b9281b8bc6"
export const DAPP_ID = isMainnet ? FREE_FLOW_DAPP_ID : DEFAULT_APP_ID

const NODE_API = isMainnet ? "https://rest-mainnet.onflow.org" : "https://rest-testnet.onflow.org";
const WALLET_URL = isMainnet ? `https://wallet-v2.blocto.app/${DAPP_ID}/flow/authn` : `https://wallet-v2-dev.blocto.app/${DAPP_ID}/flow/authn`;

// mainnet
fcl.config({
  "accessNode.api": NODE_API,
  "discovery.wallet": WALLET_URL
});

console.log('fcl config!!')
