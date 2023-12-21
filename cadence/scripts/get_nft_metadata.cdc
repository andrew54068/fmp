import "InscriptionMetadata"
import "Inscription"

pub fun main(address: Address, id: UInt64): InscriptionMetadata.InscriptionView {
    let account = getAccount(address)

    let collection = account
        .getCapability(Inscription.CollectionPublicPath)
        .borrow<&{Inscription.InscriptionCollectionPublic}>()
        ?? panic("Could not borrow a reference to the collection")

    let inscription = collection.borrowInscription(id: id)! as &{InscriptionMetadata.Resolver}

    // Get the basic display information for this Inscription
    let display: InscriptionMetadata.InscriptionView = InscriptionMetadata.getInscriptionView(id: id, viewResolver: inscription)

    return display
}
