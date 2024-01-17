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
export const LISTING_EVENT_NAME = "A.4eb8a10cb9f87357.NFTStorefront.ListingCompleted"
export const LATEST_BLOCK_HEIGHT_KEY = 'LATEST_BLOCK_HEIGHT_KEY'
export const SWEEP_BOT_INFO = 'SWEEP_BOT_INFO'
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

// Events
export const FLOW_DEPOSIT_EVENT = 'A.1654653399040a61.FlowToken.TokensDeposited'
export const INSCRIPTION_DEPOSIT_EVENT = 'A.88dd257fcf26d3cc.Inscription.Deposit'
export const ACCOUNT_CREATED_EVENT = 'flow.AccountCreated'
export const PURCHASE_SUCCEED_EVENT = 'A.4eb8a10cb9f87357.NFTStorefront.ListingCompleted'
export const MARKETPLACE_BLACKLIST_ADD_EVENT = 'A.4219a16943bb0993.MarketplaceBlacklistV2.MarketplaceBlacklistAdd'

// Type
export const PURCHASE_MODEL_TYPE = 'A.88dd257fcf26d3cc.ListingUtils.PurchaseModel'
export const LISTING_MODEL_TYPE = 'A.88dd257fcf26d3cc.ListingUtils.ListingModel'

// Address
export const ROYALTY_ADDRESS = '0x81bfc5cc7d1e0c74'


export const purchaseLimit = 10;