import FungibleToken from 0xFungibleToken
import NonFungibleToken from 0xNonFungibleToken
import NFTStorefront from 0xNFTStorefront
import Marketplace from 0xMarketplace
import FlowToken from 0xFlowToken
import Inscription from 0xInscription
import ListingUtils from 0xListingUtils
import MarketplaceBlacklistV2 from 0xMarketplaceBlacklistV2

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