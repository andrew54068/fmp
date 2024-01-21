import Inscription from 0xInscription
import Marketplace from 0xMarketplace

pub fun main(): Int {
    return Marketplace.getNFTIDListingIDMap(nftType: Type<@Inscription.NFT>()).length
}