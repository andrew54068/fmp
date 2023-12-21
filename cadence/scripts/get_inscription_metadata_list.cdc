import "InscriptionMetadata"
import "Inscription"

pub fun main(address: Address): [InscriptionMetadata.InscriptionView] {
    let account = getAccount(address)

    let collectionRef = account
        .getCapability(Inscription.CollectionPublicPath)
        .borrow<&{Inscription.InscriptionCollectionPublic}>()
        ?? panic("Could not borrow a reference to the collection")

    let ids = collectionRef.getIDs()

    var views: [InscriptionMetadata.InscriptionView] = []

    for inscriptionId in ids {
        let inscription = collectionRef.borrowInscription(id: inscriptionId)! as &{InscriptionMetadata.Resolver}

        // Get the basic display information for this Inscription
        let view: InscriptionMetadata.InscriptionView = InscriptionMetadata.getInscriptionView(id: inscriptionId, viewResolver: inscription)
        views.append(view)
    }

    return views
}
