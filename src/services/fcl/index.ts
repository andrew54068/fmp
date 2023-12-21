import * as fcl from "@blocto/fcl";
export const DEFAULT_APP_ID = "00000000-0000-0000-0000-000000000000";
// mainnet
// fcl.config({
//   "accessNode.api": "https://rest-mainnet.onflow.org", // connect to Flow mainnet
//   "discovery.wallet": `https://wallet-v2.blocto.app/${DEFAULT_APP_ID}/flow/authn` // use Blocto mainnet wallet
// });

// testnet
fcl.config({
  'flow.network': 'testnet',
  "accessNode.api": "https://rest-testnet.onflow.org", // connect to Flow mainnet
  "discovery.wallet": `https://wallet-v2-dev.blocto.app/${DEFAULT_APP_ID}/flow/authn` // use Blocto mainnet wallet
})
