import "Inscription"
import "Marketplace"

pub struct DisplayModel {
    pub let listingId: UInt64
    pub let nftId: UInt64
    pub let seller: Address
    pub let salePrice: UFix64
    pub let timestamp: UFix64

    init(
        listingId: UInt64,
        nftId: UInt64,
        seller: Address,
        salePrice: UFix64,
        timestamp: UFix64
    ) {
        self.listingId = listingId
        self.nftId = nftId
        self.seller = seller
        self.salePrice = salePrice
        self.timestamp = timestamp
    }
}

pub fun main(): [DisplayModel] {
    let mapping = Marketplace.getNFTIDListingIDMap(nftType: Type<@Inscription.NFT>())

    let items: [DisplayModel] = []
    for listingID in mapping.values {
        if let item: Marketplace.Item = Marketplace.getListingIDItem(listingID: listingID) {
            items.append(DisplayModel(
                listingId: listingID,
                nftId: item.listingDetails.nftID,
                seller: item.storefrontPublicCapability.address,
                salePrice: item.listingDetails.salePrice,
                timestamp: item.timestamp))
        }
    }

    return items
}