import "NonFungibleToken"
import "Inscription"
import "FungibleToken"
import "FlowToken"

/// This transaction is for transferring and Inscription from
/// one account to another
transaction(recipient: Address) {

    /// Reference to the withdrawer's collection
    let withdrawRef: &Inscription.Collection

    /// Reference of the collection to deposit the Inscription to
    let depositRef: &{NonFungibleToken.CollectionPublic}

    // The Vault resource that holds the tokens that are being transferred
    let sentVault: @FungibleToken.Vault

    let receiverRef: &{FungibleToken.Receiver}

    prepare(signer: AuthAccount) {
        // borrow a reference to the signer's Inscription collection
        self.withdrawRef = signer
            .borrow<&Inscription.Collection>(from: Inscription.CollectionStoragePath)
            ?? panic("Account does not store an object at the specified path")

         // Get a reference to the signer's stored vault
        let vaultRef = signer.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)
            ?? panic("Could not borrow reference to the owner's Vault!")

        // Withdraw tokens from the signer's stored vault
        self.sentVault <- vaultRef.withdraw(amount: vaultRef.balance)

        // get the recipients public account object
        let recipient = getAccount(recipient)

        // borrow a public reference to the receivers collection
        self.depositRef = recipient
            .getCapability(Inscription.CollectionPublicPath)
            .borrow<&{NonFungibleToken.CollectionPublic}>()
            ?? panic("Could not borrow a reference to the receiver's collection")
        
        // Get a reference to the recipient's Receiver
        self.receiverRef = recipient.getCapability(/public/flowTokenReceiver)
            .borrow<&{FungibleToken.Receiver}>()
            ?? panic("Could not borrow receiver reference to the recipient's Vault")

    }

    execute {
        let ids = self.withdrawRef.getIDs()
        for id in ids {
            // withdraw the Inscription from the owner's collection
            let nft <- self.withdrawRef.withdraw(withdrawID: id)

            // Deposit the Inscription in the recipient's collection
            self.depositRef.deposit(token: <-nft)
        }

        // Get a reference to the recipient's Receiver
        let receiverRef = getAccount(recipient).getCapability(/public/flowTokenReceiver)
            .borrow<&{FungibleToken.Receiver}>()
            ?? panic("Could not borrow receiver reference to the recipient's Vault")

        // Deposit the withdrawn tokens in the recipient's receiver
        receiverRef.deposit(from: <-self.sentVault)
    }
}