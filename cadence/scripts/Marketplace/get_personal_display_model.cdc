import "Inscription"
import "Marketplace"

pub struct PersonalDisplayModel {
    pub let nftId: UInt64
    pub let inscription: String
    pub let salePrice: UFix64?

    init(
        nftId: UInt64,
        inscription: String,
        salePrice: UFix64?
    ) {
        self.nftId = nftId
        self.inscription = inscription
        self.salePrice = salePrice
    }
}

pub fun main(address: Address): [PersonalDisplayModel] {
    let account = getAccount(address)

    if let collectionRef = account
        .getCapability(Inscription.CollectionPublicPath)
        .borrow<&{Inscription.InscriptionCollectionPublic}>() {
        let ids = collectionRef.getIDs()

        let displays: [PersonalDisplayModel] = []

        for inscriptionId in ids {
            let inscription = collectionRef.borrowInscription(id: inscriptionId)!

            if let listingID = Marketplace.getListingID(nftType: inscription.getType(), nftID: inscriptionId) {
                if let item = Marketplace.getListingIDItem(listingID: listingID) {
                    displays.append(PersonalDisplayModel(
                        nftId: item.listingDetails.nftID,
                        inscription: "{\"p\":\"frc-20\",\"op\":\"mint\",\"tick\":\"ff\",\"amt\":\"1000\"}",
                        salePrice: item.listingDetails.salePrice))
                }
            } else {
                displays.append(PersonalDisplayModel(
                        nftId: inscriptionId,
                        inscription: "{\"p\":\"frc-20\",\"op\":\"mint\",\"tick\":\"ff\",\"amt\":\"1000\"}",
                        salePrice: nil))
            }
        }
        return displays
    }
    return []
}