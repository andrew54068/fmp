import { NonFungibleToken, FungibleToken, Inscription, InscriptionMetadata, Marketplace, NFTStorefront, FlowToken, ListingUtils, MarketplaceCleaner, MarketplaceBlacklistV2 } from 'src/constants';
import mintScript from '../../cadence/transactions/mint.cdc?raw';
import purchaseScript from '../../cadence/transactions/bay/buySingleInscription.cdc?raw';
import batchPurchaseScript from '../../cadence/transactions/batchBuyInscription.cdc?raw';
import batchSellScript from '../../cadence/transactions/batchListInscription.cdc?raw';
import personalDisplayModel from '../../cadence/scripts/Marketplace/get_personal_display_model.cdc?raw';
import personalAmount from '../../cadence/scripts/Marketplace/get_personal_amount.cdc?raw';
import metaDataListScript from '../../cadence/scripts/get_inscription_metadata_list.cdc?raw';
import listingItemScript from '../../cadence/scripts/Marketplace/get_all_listing_display_model.cdc?raw';
import listingAmountScript from '../../cadence/scripts/Marketplace/get_all_listing_amount.cdc?raw';
import cleanNotListedItemsScript from '../../cadence/transactions/cleanNotListedItems.cdc?raw';
import checkListingIdExistScript from '../../cadence/scripts/checkListingIdExist.cdc?raw';
import progressScript from '../../cadence/scripts/get_progress.cdc?raw';
import flowBalance from '../../cadence/scripts/get_flow_balance.cdc?raw';
import createAccountScript from '../../cadence/transactions/createAccount.cdc?raw';
import createAccountAndDepositScript from '../../cadence/transactions/createAccountAndDeposit.cdc?raw';
import transferInscriptionAndFlowScript from '../../cadence/transactions/transferInscriptionAndFlow.cdc?raw';

const replacement = (script: string): string => {
  return script
    .replace(`import "NonFungibleToken"`, `import NonFungibleToken from ${NonFungibleToken}`)
    .replace(`import "FungibleToken"`, `import FungibleToken from ${FungibleToken}`)
    .replace(`import "Inscription"`, `import Inscription from ${Inscription}`)
    .replace(`import "InscriptionMetadata"`, `import InscriptionMetadata from ${InscriptionMetadata}`)
    .replace(`import "Marketplace"`, `import Marketplace from ${Marketplace}`)
    .replace(`import "NFTStorefront"`, `import NFTStorefront from ${NFTStorefront}`)
    .replace(`import "FlowToken"`, `import FlowToken from ${FlowToken}`)
    .replace(`import "ListingUtils"`, `import ListingUtils from ${ListingUtils}`)
    .replace(`import "MarketplaceCleaner"`, `import MarketplaceCleaner from ${MarketplaceCleaner}`)
    .replace(`import "MarketplaceBlacklistV2"`, `import MarketplaceBlacklistV2 from ${MarketplaceBlacklistV2}`);
}

export const getMintScripts = () => {
  return replacement(mintScript)
}

export const getPurchaseScripts = () => {
  return replacement(purchaseScript)
}

export const getBatchPurchaseScripts = () => {
  return replacement(batchPurchaseScript)
}

export const getBatchSellScripts = () => {
  return replacement(batchSellScript)
}

export const getPersonalDisplayModelScripts = () => {
  return replacement(personalDisplayModel)
}

export const getPersonalAmountScripts = () => {
  return replacement(personalAmount)
}

export const getMetaDataListScripts = () => {
  return replacement(metaDataListScript)
}

export const getMarketListingItemScripts = () => {
  return replacement(listingItemScript)
}

export const getMarketListingAmountScripts = () => {
  return replacement(listingAmountScript)
}

export const getProgressScript = () => {
  return replacement(progressScript)
}

export const getBalanceScript = () => {
  return replacement(flowBalance)
}

export const getCleanNotListedItemsScript = () => {
  return replacement(cleanNotListedItemsScript)
}

export const getCheckListingIdExistScript = () => {
  return replacement(checkListingIdExistScript)
}

export const getCreateAccountScript = () => {
  return replacement(createAccountScript)
}

export const getCreateAccountAndDepositScript = () => {
  return replacement(createAccountAndDepositScript)
}

export const getTransferInscriptionAndFlowScript = () => {
  return replacement(transferInscriptionAndFlowScript)
}