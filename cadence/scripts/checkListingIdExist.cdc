import "FungibleToken"
import "Inscription"
import "Marketplace"

pub fun main(listingId: UInt64): Bool {
    let mapping = Marketplace.getNFTIDListingIDMap(nftType: Type<@Inscription.NFT>())

    return mapping.values.contains(listingId)
}