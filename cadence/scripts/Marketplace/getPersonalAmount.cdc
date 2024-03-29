import Inscription from 0xInscription

pub fun main(address: Address): Int {
    let account = getAccount(address)

    if let collectionRef = account
        .getCapability(Inscription.CollectionPublicPath)
        .borrow<&{Inscription.InscriptionCollectionPublic}>() {
        return collectionRef.getIDs().length
    }
    return 0
}