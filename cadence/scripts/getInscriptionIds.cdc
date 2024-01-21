import NonFungibleToken from 0xNonFungibleToken
import Inscription from 0xInscription

/// Script to get Inscription IDs in an account's collection
///
pub fun main(address: Address): [UInt64] {
    let account = getAccount(address)

    if let collectionRef = account
        .getCapability(Inscription.CollectionPublicPath)
        .borrow<&{NonFungibleToken.CollectionPublic}>() {
        return collectionRef.getIDs()
    }
    return []
}