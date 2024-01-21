import Fomopoly from 0xFomopoly

transaction(start: UFix64, end: UFix64) {
    let adminRef: &Fomopoly.Administrator

    prepare(signer: AuthAccount) {
        // borrow a reference to the signer's Inscription collection
        self.adminRef = signer.borrow<&Fomopoly.Administrator>(from: Fomopoly.adminStoragePath)
            ?? panic("Could not borrow reference to the owner's admin resource!")
    }

    execute {
        self.adminRef.updateStakingTime(start: start, end: end)
    }

}