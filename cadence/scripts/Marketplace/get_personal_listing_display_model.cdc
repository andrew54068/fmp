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

pub fun main(address: Address): [DisplayModel] {
    let account = getAccount(address)

    if let collectionRef = account
        .getCapability(Inscription.CollectionPublicPath)
        .borrow<&{Inscription.InscriptionCollectionPublic}>() {
        let ids = collectionRef.getIDs()

        // var views: [InscriptionMetadata.InscriptionView] = []

        let displays: [DisplayModel] = []

        for inscriptionId in ids {
            let inscription = collectionRef.borrowInscription(id: inscriptionId)!

            if let listingID = Marketplace.getListingID(nftType: inscription.getType(), nftID: inscriptionId) {
                if let item = Marketplace.getListingIDItem(listingID: listingID) {
                    displays.append(DisplayModel(
                        listingId: listingID,
                        nftId: item.listingDetails.nftID,
                        seller: item.storefrontPublicCapability.address,
                        salePrice: item.listingDetails.salePrice,
                        timestamp: item.timestamp))
                }
            }
        }
        return displays
    }
    return []
}