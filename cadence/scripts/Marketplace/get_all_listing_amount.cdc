import "Inscription"
import "Marketplace"
import "MarketplaceBlacklist"

pub fun main(): Int {
    return Marketplace.getNFTIDListingIDMap(nftType: Type<@Inscription.NFT>()).values.length
}