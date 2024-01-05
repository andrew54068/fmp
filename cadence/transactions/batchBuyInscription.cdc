import "FungibleToken"
import "NonFungibleToken"
import "NFTStorefront"
import "Marketplace"
import "FlowToken"
import "Inscription"
import "ListingUtils"
import "MarketplaceBlacklist"

transaction(purchaseModels: [ListingUtils.PurchaseModel]) {

    prepare(signer: AuthAccount) {
        // Create a collection to store the purchase if none present
        if signer.borrow<&Inscription.Collection>(from: Inscription.CollectionStoragePath) == nil {
            signer.save(<- Inscription.createEmptyCollection(), to: Inscription.CollectionStoragePath)
            signer.link<&{NonFungibleToken.CollectionPublic, Inscription.InscriptionCollectionPublic}>(
			    Inscription.CollectionPublicPath,
			    target: Inscription.CollectionStoragePath
		    )
        }

        // Gas Used: 9
        for purchaseModel in purchaseModels {
            let storefront = getAccount(purchaseModel.storefrontAddress)
                .getCapability<&NFTStorefront.Storefront{NFTStorefront.StorefrontPublic}>(NFTStorefront.StorefrontPublicPath)
                .borrow()
                ?? panic("Could not borrow Storefront from provided address")
            // Gas Used: 24
            if let listing = storefront.borrowListing(listingResourceID: purchaseModel.listingResourceID) {
                // Gas Used: 49
                if let collectionRef = getAccount(purchaseModel.storefrontAddress)
                    .getCapability(Inscription.CollectionPublicPath)
                    .borrow<&{Inscription.InscriptionCollectionPublic}>() {
                    // Gas Used: 54
                    let nftId = listing.getDetails().nftID
                    // Gas Used: 70
                    if collectionRef.borrowInscription(id: nftId) != nil {
                    // Gas Used: 72
                    
                        let nft = listing.borrowNFT()
                        // Gas Used: 72

                        let price = listing.getDetails().salePrice
                        // Gas Used: 72

                        assert(purchaseModel.buyPrice == price, message: "buyPrice is NOT same with salePrice")
                        // Gas Used: 72

                        let targetTokenVault = signer.borrow<&{FungibleToken.Provider}>(from: /storage/flowTokenVault)
                            ?? panic("Cannot borrow target token vault from signer storage")
                        // Gas Used: 72
                        
                        let paymentVault <- targetTokenVault.withdraw(amount: price)

                        let nftCollection = signer.borrow<&{NonFungibleToken.Receiver}>(from: Inscription.CollectionStoragePath)
                                    ?? panic("Cannot borrow NFT collection receiver from account")

                        let item <- listing.purchase(payment: <- paymentVault)
                        nftCollection.deposit(token: <-item)

                        // Be kind and recycle
                        storefront.cleanup(listingResourceID: purchaseModel.listingResourceID)
                        Marketplace.removeListing(id: purchaseModel.listingResourceID)
                        // Gas Used: 72
                    } else {
                        MarketplaceBlacklist.add(listingId: purchaseModel.listingResourceID, nftId: nftId)
                    }
                }
            }
        }

    }

    execute {
    }

}