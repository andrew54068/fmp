import "InscriptionMetadata"
import "Inscription"

pub fun main(address: Address): Int {
    let account = getAccount(address)

    if let collectionRef = account
        .getCapability(Inscription.CollectionPublicPath)
        .borrow<&{Inscription.InscriptionCollectionPublic}>() {
        let ids = collectionRef.getIDs()

        var views: [InscriptionMetadata.InscriptionView] = []

        for inscriptionId in ids {
            let inscription = collectionRef.borrowInscription(id: inscriptionId)! as &{InscriptionMetadata.Resolver}

            // Get the basic display information for this Inscription
            let view: InscriptionMetadata.InscriptionView = InscriptionMetadata.getInscriptionView(id: inscriptionId, viewResolver: inscription)
            views.append(view)
        }

        return views.length
    }
    return 0

}
