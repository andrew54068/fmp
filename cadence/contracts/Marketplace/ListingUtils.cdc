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

}