import "Inscription"
import "Marketplace"
import "MarketplaceBlacklistV2"

pub fun main(): Int {
    return Marketplace.getNFTIDListingIDMap(nftType: Type<@Inscription.NFT>()).values.length - MarketplaceBlacklistV2.getAmount()
}