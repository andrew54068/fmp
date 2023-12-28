import Inscription from 0x88dd257fcf26d3cc
import Marketplace from 0xdc5127882cacf8d9

pub fun main(address: Address): [Marketplace.Item] {
    let account = getAccount(address)

    if let collectionRef = account
        .getCapability(Inscription.CollectionPublicPath)
        .borrow<&{Inscription.InscriptionCollectionPublic}>() {
        let ids = collectionRef.getIDs()

        // var views: [InscriptionMetadata.InscriptionView] = []

        var items: [Marketplace.Item] = []

        for inscriptionId in ids {
            let inscription = collectionRef.borrowInscription(id: inscriptionId)!

            if let listingID = Marketplace.getListingID(nftType: inscription.getType(), nftID: inscriptionId) {
                if let item = Marketplace.getListingIDItem(listingID: listingID) {
                    items.append(item)
                }
            }
        }
        return items
    }
    return []
}