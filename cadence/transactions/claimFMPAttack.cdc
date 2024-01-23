import FlowToken from 0xFlowToken
import FungibleToken from 0xFungibleToken
import Inscription from 0xInscription
import Fomopoly from 0xFomopoly

transaction(address: Address) {
    let recipientVaultRef: auth &Fomopoly.Vault
    let inscriptionReceivingRef: auth &Inscription.Collection

    prepare(signer: AuthAccount) {
        
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

        let account = getAccount(address)

        self.recipientVaultRef = account
            .borrow<auth &Fomopoly.Vault>(from: Fomopoly.TokenStoragePath)
            ?? panic("Could not get receiver reference to the recipient's fomopoly vault")

        // borrow a reference to the signer's Inscription collection
        self.inscriptionReceivingRef = account.borrow<auth &Inscription.Collection>(from: Inscription.CollectionStoragePath)
            ?? panic("Could not borrow auth reference to the owner's inscription collection!")
    }

    execute {
        Fomopoly.claimStakingReward(
            identityCollectionRef: self.recipientVaultRef,
            inscriptionCollectionRef: self.inscriptionReceivingRef
        )
    }

}