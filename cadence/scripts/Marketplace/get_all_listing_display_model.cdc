import Inscription from 0xInscription
import Marketplace from 0xMarketplace
import MarketplaceBlacklistV2 from 0xMarketplaceBlacklistV2

pub struct DisplayModel {
    pub let listingId: UInt64
    pub let nftId: UInt64
    pub let inscription: String
    pub let seller: Address
    pub let salePrice: UFix64
    pub let timestamp: UFix64

    init(
        listingId: UInt64,
        nftId: UInt64,
        inscription: String,
        seller: Address,
        salePrice: UFix64,
        timestamp: UFix64
    ) {
        self.listingId = listingId
        self.nftId = nftId
        self.inscription = inscription
        self.seller = seller
        self.salePrice = salePrice
        self.timestamp = timestamp
    }
}

pub fun main(from: Int, upTo: Int): [DisplayModel] {
    let mapping = Marketplace.getNFTIDListingIDMap(nftType: Type<@Inscription.NFT>())

    let items: [DisplayModel] = []
    var finalUpTo = upTo
    if (finalUpTo >= mapping.length) {
        finalUpTo = mapping.length - 1
    }
    for listingID in mapping.values.slice(from: from, upTo: finalUpTo) {
        if MarketplaceBlacklistV2.exist(listingId: listingID) == false {
            if let item: Marketplace.Item = Marketplace.getListingIDItem(listingID: listingID) {
                items.append(DisplayModel(
                    listingId: listingID,
                    nftId: item.listingDetails.nftID,
                    inscription: "{\"p\":\"frc-20\",\"op\":\"mint\",\"tick\":\"ff\",\"amt\":\"1000\"}",
                    seller: item.storefrontPublicCapability.address,
                    salePrice: item.listingDetails.salePrice,
                    timestamp: item.timestamp))
            }
        }
    }

    return items
}