const isMainnet = import.meta.env.VITE_NETWORK === 'mainnet'

const testnetAddress = {
  NonFungibleToken: "0x631e88ae7f1d7c20",
  Inscription: "0x564b229bd8380848",
  InscriptionMetadata: "0x564b229bd8380848",
  Marketplace: "0xe1aa310cfe7750c4",
  NFTStorefront: "0x94b06cfca1d8a476",
  FlowToken: "0x7e60df042a9c0868",
  FungibleToken: "0x9a0766d93b6608b7",
  ListingUtils: "0x564b229bd8380848",
  MarketplaceCleaner: "",
  MarketplaceBlacklistV2: "",
}

const mainnetAddress = {
  NonFungibleToken: "0x1d7e57aa55817448",
  Inscription: "0x88dd257fcf26d3cc",
  InscriptionMetadata: "0x88dd257fcf26d3cc",
  Marketplace: "0xdc5127882cacf8d9",
  NFTStorefront: "0x4eb8a10cb9f87357",
  FlowToken: "0x1654653399040a61",
  FungibleToken: "0xf233dcee88fe0abe",
  ListingUtils: "0x88dd257fcf26d3cc",
  MarketplaceCleaner: "0x88dd257fcf26d3cc",
  MarketplaceBlacklistV2: "0x4219a16943bb0993",
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
export const { NonFungibleToken, FungibleToken, Inscription, InscriptionMetadata, Marketplace, NFTStorefront, FlowToken, ListingUtils, MarketplaceCleaner, MarketplaceBlacklistV2 } = isMainnet ? mainnetAddress : testnetAddress