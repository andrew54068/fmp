import "FungibleToken"
import "NonFungibleToken"
import "NFTStorefront"
import "Marketplace"
import "FlowToken"
import "Inscription"
import "ListingUtils"

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

        for purchaseModel in purchaseModels {
            let storefront = getAccount(purchaseModel.storefrontAddress)
                .getCapability<&NFTStorefront.Storefront{NFTStorefront.StorefrontPublic}>(NFTStorefront.StorefrontPublicPath)
                .borrow()
                ?? panic("Could not borrow Storefront from provided address")

            if let listing = storefront.borrowListing(listingResourceID: purchaseModel.listingResourceID) {
                if let collectionRef = getAccount(purchaseModel.storefrontAddress)
                    .getCapability(Inscription.CollectionPublicPath)
                    .borrow<&{Inscription.InscriptionCollectionPublic}>() {
                    let nftId = listing.getDetails().nftID
                    if collectionRef.borrowInscription(id: nftId) != nil {
                        let nft = listing.borrowNFT()
                        let price = listing.getDetails().salePrice

                        assert(purchaseModel.buyPrice == price, message: "buyPrice is NOT same with salePrice")

                        let targetTokenVault = signer.borrow<&{FungibleToken.Provider}>(from: /storage/flowTokenVault)
                            ?? panic("Cannot borrow target token vault from signer storage")
                        let paymentVault <- targetTokenVault.withdraw(amount: price)

                        let nftCollection = signer.borrow<&{NonFungibleToken.Receiver}>(from: Inscription.CollectionStoragePath)
                                    ?? panic("Cannot borrow NFT collection receiver from account")

                        let item <- listing.purchase(payment: <- paymentVault)
                        nftCollection.deposit(token: <-item)

                        // Be kind and recycle
                        storefront.cleanup(listingResourceID: purchaseModel.listingResourceID)
                        Marketplace.removeListing(id: purchaseModel.listingResourceID)
                    }
                }
            }
        }

    }

    execute {
    }

}