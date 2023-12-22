import * as fcl from "@blocto/fcl";
export const DEFAULT_APP_ID = "00000000-0000-0000-0000-000000000000";
export const DAPP_ID = "776b8c25-1c11-43ba-a1ec-47b9281b8bc6"
// mainnet
fcl.config({
  "accessNode.api": "https://rest-mainnet.onflow.org", // connect to Flow mainnet
  "discovery.wallet": `https://wallet-v2.blocto.app/${DAPP_ID}/flow/authn` // use Blocto mainnet wallet
});

// testnet
// fcl.config({
//   'flow.network': 'testnet',
//   "accessNode.api": "https://rest-testnet.onflow.org", // connect to Flow mainnet
//   "discovery.wallet": `https://wallet-v2-dev.blocto.app/${DAPP_ID}/flow/authn`, // use Blocto mainnet wallet
// })

console.log('fcl config!!')
