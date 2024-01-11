import "NFTStorefront"
import "Marketplace"

transaction(listingResourceIDs: [UInt64]) {
    let storefrontManager: &NFTStorefront.Storefront{NFTStorefront.StorefrontManager}
    let storefrontPublic: &NFTStorefront.Storefront{NFTStorefront.StorefrontPublic}

    prepare(signer: AuthAccount) {
        self.storefrontManager = signer.borrow<&NFTStorefront.Storefront{NFTStorefront.StorefrontManager}>(
            from: NFTStorefront.StorefrontStoragePath)
            ?? panic("Missing or mis-typed NFTStorefront.Storefront")

        self.storefrontPublic = signer.borrow<&NFTStorefront.Storefront{NFTStorefront.StorefrontPublic}>(
            from: NFTStorefront.StorefrontStoragePath)
            ?? panic("Missing or mis-typed NFTStorefront.Storefront")
    }

    execute {
        for listingResourceID in listingResourceIDs {
            if self.storefrontPublic.borrowListing(listingResourceID: listingResourceID) != nil {
                self.storefrontManager.removeListing(listingResourceID: listingResourceID)
                Marketplace.removeListing(id: listingResourceID)
            }
        }
    }
}