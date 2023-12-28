import "Inscription"
import "Marketplace"

pub fun main(): {UInt64: UInt64} {
    return Marketplace.getNFTIDListingIDMap(nftType: Type<@Inscription.NFT>())
}