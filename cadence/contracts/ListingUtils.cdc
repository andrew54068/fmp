pub contract ListingUtils {

    pub struct PurchaseModel {
        pub let listingResourceID: UInt64
        pub let storefrontAddress: Address
        pub let buyPrice: UFix64

        init(
            listingResourceID: UInt64,
            storefrontAddress: Address,
            buyPrice: UFix64
        ) {
            self.listingResourceID = listingResourceID
            self.storefrontAddress = storefrontAddress
            self.buyPrice = buyPrice
        }
    }

    pub struct ListingModel {
        pub let saleNFTID: UInt64
        pub let saleItemPrice: UFix64

        init(
            saleNFTID: UInt64,
            saleItemPrice: UFix64
        ) {
            self.saleNFTID = saleNFTID
            self.saleItemPrice = saleItemPrice        
        }
    }

}