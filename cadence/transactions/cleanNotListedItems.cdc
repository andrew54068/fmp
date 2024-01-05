import "FungibleToken"
import "NonFungibleToken"
import "NFTStorefront"
import "Marketplace"
import "FlowToken"
import "Inscription"
import "ListingUtils"
import "MarketplaceBlacklistV2"

transaction(listingIDs: [UInt64]) {

    prepare(signer: AuthAccount) {

        for listingID in listingIDs {
            if let item: Marketplace.Item = Marketplace.getListingIDItem(listingID: listingID) {
                let nftId = item.listingDetails.nftID

                let sellerAddress = getAccount(item.storefrontPublicCapability.address)

                let account = getAccount(item.storefrontPublicCapability.address)
                if let collectionRef = sellerAddress
                    .getCapability(Inscription.CollectionPublicPath)
                    .borrow<&{Inscription.InscriptionCollectionPublic}>() {
                    if collectionRef.borrowInscription(id: nftId) == nil {
                        Marketplace.removeListing(id: listingID)

                        if let blacklistAdmin = signer.borrow<&MarketplaceBlacklistV2.Administrator>(from: MarketplaceBlacklistV2.AdminStoragePath) {
                            blacklistAdmin.add(listingId: listingID, nftId: nftId)
                        } else {
                            panic("You are not admin! Fuck you!")
                        }
                    }
                }
            }
        }
    }

    execute {
    }

}