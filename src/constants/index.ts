const isMainnet = import.meta.env.VITE_NETWORK === 'mainnet'

const testnetAddress = {
  NonFungibleToken: "0x631e88ae7f1d7c20",
  Inscription: "0x564b229bd8380848",
  InscriptionMetadata: "0x564b229bd8380848",
  Marketplace: "", // testnet not existed
  NFTStorefront: "", // testnet not found
  FlowToken: "0x7e60df042a9c0868"
}

const mainnetAddress = {
  NonFungibleToken: "0x1d7e57aa55817448",
  Inscription: "0x88dd257fcf26d3cc",
  InscriptionMetadata: "0x88dd257fcf26d3cc",
  Marketplace: "0xdc5127882cacf8d9",
  NFTStorefront: "0x4eb8a10cb9f87357",
  FlowToken: "0x1654653399040a61"
}

//testnet
// export const NonFungibleToken = "0x631e88ae7f1d7c20"
// export const Inscription = "0x564b229bd8380848"
// export const InscriptionMetadata = "0x564b229bd8380848"

// mainnet
// const NonFungibleToken = "0x1d7e57aa55817448"
// const Inscription = "0x88dd257fcf26d3cc"
// const InscriptionMetadata = "0x88dd257fcf26d3cc"

// testnet 
// export const FLOW_SCAN_URL = 'https://testnet.flowdiver.io/tx/'

export const FLOW_SCAN_URL = isMainnet ? 'https://flowdiver.io/tx/' : 'https://testnet.flowdiver.io/tx/'
export const { NonFungibleToken, Inscription, InscriptionMetadata, Marketplace, NFTStorefront, FlowToken } = isMainnet ? mainnetAddress : testnetAddress