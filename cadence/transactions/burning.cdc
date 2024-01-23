import FlowToken from 0xFlowToken
import FungibleToken from 0xFungibleToken
import Inscription from 0xInscription
import Fomopoly from 0xFomopoly

transaction(amount: UInt64) {
    let withdrawRef: auth &Inscription.Collection
    let recipientVaultRef: auth &Fomopoly.Vault

    prepare(signer: AuthAccount) {
        // borrow a reference to the signer's Inscription collection
        self.withdrawRef = signer.borrow<auth &Inscription.Collection>(from: Inscription.CollectionStoragePath)
            ?? panic("Could not borrow auth reference to the owner's inscription collection!")

        if signer.borrow<&Fomopoly.Vault>(from: Fomopoly.TokenStoragePath) == nil {
			signer.save(<-Fomopoly.createEmptyVault(), to: Fomopoly.TokenStoragePath)
            signer.link<&Fomopoly.Vault{FungibleToken.Receiver}>(Fomopoly.TokenPublicReceiverPath, target: Fomopoly.TokenStoragePath)
			signer.link<&Fomopoly.Vault{FungibleToken.Balance}>(Fomopoly.TokenPublicBalancePath, target: Fomopoly.TokenStoragePath)
		} else if signer
            .getCapability(Fomopoly.TokenPublicReceiverPath)
            .borrow<&{FungibleToken.Receiver}>() == nil {
            signer.link<&Fomopoly.Vault{FungibleToken.Receiver}>(Fomopoly.TokenPublicReceiverPath, target: Fomopoly.TokenStoragePath)
			signer.link<&Fomopoly.Vault{FungibleToken.Balance}>(Fomopoly.TokenPublicBalancePath, target: Fomopoly.TokenStoragePath)
        }

        self.recipientVaultRef = signer
            .borrow<auth &Fomopoly.Vault>(from: Fomopoly.TokenStoragePath)
            ?? panic("Could not get receiver reference to the recipient's fomopoly vault")
    }

    execute {
        let rewardVault: @Fomopoly.Vault <- Fomopoly.mintTokensByBurn(
            collectionRef: self.withdrawRef,
            burnedIds: self.withdrawRef.getIDs().slice(from: 0, upTo: Int(amount))
        )
        self.recipientVaultRef.deposit(from: <- rewardVault)
    }

}