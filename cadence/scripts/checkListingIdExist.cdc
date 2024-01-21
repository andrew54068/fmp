import FungibleToken from 0xFungibleToken
import Inscription from 0xInscription
import Marketplace from 0xMarketplace

pub fun main(listingId: UInt64): Bool {
    let mapping = Marketplace.getNFTIDListingIDMap(nftType: Type<@Inscription.NFT>())

    return mapping.values.contains(listingId)
}