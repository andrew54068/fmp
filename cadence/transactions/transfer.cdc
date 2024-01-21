import NonFungibleToken from 0xNonFungibleToken
import Inscription from 0xInscription

/// This transaction is for transferring and Inscription from
/// one account to another
transaction(recipient: Address, withdrawID: UInt64) {

    /// Reference to the withdrawer's collection
    let withdrawRef: &Inscription.Collection

    /// Reference of the collection to deposit the Inscription to
    let depositRef: &{NonFungibleToken.CollectionPublic}

    prepare(signer: AuthAccount) {
        // borrow a reference to the signer's Inscription collection
        self.withdrawRef = signer
            .borrow<&Inscription.Collection>(from: Inscription.CollectionStoragePath)
            ?? panic("Account does not store an object at the specified path")

        // get the recipients public account object
        let recipient = getAccount(recipient)

        // borrow a public reference to the receivers collection
        self.depositRef = recipient
            .getCapability(Inscription.CollectionPublicPath)
            .borrow<&{NonFungibleToken.CollectionPublic}>()
            ?? panic("Could not borrow a reference to the receiver's collection")

    }

    execute {

        // withdraw the Inscription from the owner's collection
        let nft <- self.withdrawRef.withdraw(withdrawID: withdrawID)

        // Deposit the Inscription in the recipient's collection
        self.depositRef.deposit(token: <-nft)
    }

    post {
        !self.withdrawRef.getIDs().contains(withdrawID): "Original owner should not have the Inscription anymore"
        self.depositRef.getIDs().contains(withdrawID): "The reciever should now own the Inscription"
    }
}