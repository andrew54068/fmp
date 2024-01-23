import FlowToken from 0xFlowToken
import Inscription from 0xInscription
import Fomopoly from 0xFomopoly

transaction(amount: UInt64) {
    let withdrawRef: auth &Inscription.Collection
    let sentVault: @FlowToken.Vault

    prepare(signer: AuthAccount) {
        // borrow a reference to the signer's Inscription collection
        self.withdrawRef = signer.borrow<auth &Inscription.Collection>(from: Inscription.CollectionStoragePath)
            ?? panic("Could not borrow auth reference to the owner's inscription collection!")

        // Get a reference to the signer's stored vault
        let vaultRef = signer.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)
            ?? panic("Could not borrow reference to the owner's Vault!")

        // Withdraw tokens from the signer's stored vault
        self.sentVault <- vaultRef.withdraw(amount: UFix64(amount) / Fomopoly.stakingDivisor) as! @FlowToken.Vault
    }

    execute {
        Fomopoly.stakingInscription(
            flowVault: <- self.sentVault,
            collectionRef: self.withdrawRef,
            stakeIds: self.withdrawRef.getIDs().slice(from: 0, upTo: Int(amount))
        )
    }

}