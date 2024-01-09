import "NFTStorefront"
import "Marketplace"

transaction(listingResourceIDs: [UInt64]) {
    let storefrontManager: &NFTStorefront.Storefront{NFTStorefront.StorefrontManager}

    prepare(signer: AuthAccount) {
        self.storefrontManager = signer.borrow<&NFTStorefront.Storefront{NFTStorefront.StorefrontManager}>(
            from: NFTStorefront.StorefrontStoragePath)
            ?? panic("Missing or mis-typed NFTStorefront.Storefront")
    }

    execute {
        for listingResourceID in listingResourceIDs {
            self.storefrontManager.removeListing(listingResourceID: listingResourceID)
            Marketplace.removeListing(id: listingResourceID)
        }
    }
}