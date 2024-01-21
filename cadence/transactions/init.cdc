import NonFungibleToken from 0xNonFungibleToken
import InscriptionMetadata from 0xInscriptionMetadata
import Inscription from 0xInscription

/// This transaction is what an account would run
/// to set itself up to receive Inscriptions

transaction {

    prepare(signer: AuthAccount) {
        // Return early if the account already has a collection
        if signer.borrow<&Inscription.Collection>(from: Inscription.CollectionStoragePath) != nil {
            return
        }

        // Create a new empty collection
        let collection <- Inscription.createEmptyCollection()

        // save it to the account
        signer.save(<-collection, to: Inscription.CollectionStoragePath)

        // create a public capability for the collection
        signer.link<&{NonFungibleToken.CollectionPublic, Inscription.InscriptionCollectionPublic, InscriptionMetadata.ResolverCollection}>(
            Inscription.CollectionPublicPath,
            target: Inscription.CollectionStoragePath
        )
    }
}