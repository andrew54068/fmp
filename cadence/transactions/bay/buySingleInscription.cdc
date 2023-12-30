import "FungibleToken"
import "NonFungibleToken"
import "NFTStorefront"
import "Marketplace"
import "FlowToken"
import "Inscription"
import "ListingUtils"

transaction(purchaseModel: ListingUtils.PurchaseModel) {
    let paymentVault: @FungibleToken.Vault
    let storefront: &NFTStorefront.Storefront{NFTStorefront.StorefrontPublic}
    let nftCollection: &{NonFungibleToken.Receiver}
    let listing: &NFTStorefront.Listing{NFTStorefront.ListingPublic}

    prepare(signer: AuthAccount) {
        // Create a collection to store the purchase if none present
        if signer.borrow<&Inscription.Collection>(from: Inscription.CollectionStoragePath) == nil {
            signer.save(<- Inscription.createEmptyCollection(), to: Inscription.CollectionStoragePath)
            signer.link<&{NonFungibleToken.CollectionPublic, Inscription.InscriptionCollectionPublic}>(
			    Inscription.CollectionPublicPath,
			    target: Inscription.CollectionStoragePath
		    )
        }

        self.storefront = getAccount(purchaseModel.storefrontAddress)
            .getCapability<&NFTStorefront.Storefront{NFTStorefront.StorefrontPublic}>(NFTStorefront.StorefrontPublicPath)
            .borrow()
            ?? panic("Could not borrow Storefront from provided address")

        self.listing = self.storefront.borrowListing(listingResourceID: purchaseModel.listingResourceID)
            ?? panic("No Offer with that ID in Storefront")
        let price = self.listing.getDetails().salePrice

        assert(purchaseModel.buyPrice == price, message: "buyPrice is NOT same with salePrice")

        let targetTokenVault = signer.borrow<&{FungibleToken.Provider}>(from: /storage/flowTokenVault)
            ?? panic("Cannot borrow target token vault from signer storage")
        self.paymentVault <- targetTokenVault.withdraw(amount: price)

        self.nftCollection = signer.borrow<&{NonFungibleToken.Receiver}>(from: Inscription.CollectionStoragePath)
                    ?? panic("Cannot borrow NFT collection receiver from account")
    }

    execute {
        let item <- self.listing.purchase(payment: <-self.paymentVault)
        self.nftCollection.deposit(token: <-item)

        // Be kind and recycle
        self.storefront.cleanup(listingResourceID: purchaseModel.listingResourceID)
        Marketplace.removeListing(id: purchaseModel.listingResourceID)
    }

}