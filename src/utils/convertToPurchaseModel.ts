import { InscriptionDisplayModel, PurchaseModel } from "src/components/ListingPanel";

export const convertToPurchaseModel = (
    displayModels: InscriptionDisplayModel[]
): PurchaseModel[] => {
    return displayModels.map((model) => {
        return {
            fields: [
                {
                    name: "listingResourceID",
                    value: model.listingId,
                },
                {
                    name: "storefrontAddress",
                    value: model.seller,
                },
                {
                    name: "buyPrice",
                    value: model.salePrice.toString(),
                },
            ],
        };
    });
};