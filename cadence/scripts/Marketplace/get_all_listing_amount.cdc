import "Inscription"
import "Marketplace"

pub fun main(): Int {
    return Marketplace.getNFTIDListingIDMap(nftType: Type<@Inscription.NFT>()).values.length
}