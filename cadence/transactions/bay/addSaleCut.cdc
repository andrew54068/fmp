import "FungibleToken"
import "Marketplace"
import "FlowToken"
import "Inscription"

// This transaction creates SaleCutRequirements of Marketplace for NFT & Blocto

transaction {

    prepare(signer: AuthAccount) {
        let bloctoRecipient: Address = 0x77e38c96fda5c5c5
        let bloctoRatio = 0.025 // 2.5%
        // let nftRecipient: Address = 0x609a2ea0548b4b51
        let nftRecipient: Address = 0xf8d6e0586b0a20c7
        let nftRatio = 0.05

        assert(nftRatio + bloctoRatio <= 1.0, message: "total of ratio must be less than or equal to 1.0")

        let admin = signer.borrow<&Marketplace.Administrator>(from: Marketplace.MarketplaceAdminStoragePath)
            ?? panic("Cannot borrow marketplace admin")

        let requirements: [Marketplace.SaleCutRequirement] = []

        // Blocto SaleCut
        // if bloctoRatio > 0.0 {
        //     let bloctoFlowTokenReceiver = getAccount(bloctoRecipient).getCapability<&FlowToken.Vault{FungibleToken.Receiver}>(/public/flowTokenReceiver)
        //     assert(bloctoFlowTokenReceiver.borrow() != nil, message: "Missing or mis-typed blocto FlowToken receiver")
        //     requirements.append(Marketplace.SaleCutRequirement(receiver: bloctoFlowTokenReceiver, ratio: bloctoRatio))
        // }

        // NFT SaleCut
        if nftRatio > 0.0 {
            let nftFlowTokenReceiver = getAccount(nftRecipient).getCapability<&FlowToken.Vault{FungibleToken.Receiver}>(/public/flowTokenReceiver)
            assert(nftFlowTokenReceiver.borrow() != nil, message: "Missing or mis-typed NFT FlowToken receiver")
            requirements.append(Marketplace.SaleCutRequirement(receiver: nftFlowTokenReceiver, ratio: nftRatio))
        }

        admin.updateSaleCutRequirements(requirements, nftType: Type<@Inscription.NFT>())
    }
}