import { NonFungibleToken, FungibleToken, Inscription, InscriptionMetadata, Marketplace, NFTStorefront, FlowToken, ListingUtils, MarketplaceCleaner, MarketplaceBlacklistV2, Fomopoly } from 'src/constants';
import mintScript from '../../cadence/transactions/mintInscription.cdc?raw';
import purchaseScript from '../../cadence/transactions/bay/buySingleInscription.cdc?raw';
import batchPurchaseScript from '../../cadence/transactions/batchBuyInscription.cdc?raw';
import batchSellScript from '../../cadence/transactions/batchListInscription.cdc?raw';
import personalDisplayModel from '../../cadence/scripts/Marketplace/get_personal_display_model.cdc?raw';
import personalAmount from '../../cadence/scripts/Marketplace/getPersonalAmount.cdc?raw';
import metaDataListScript from '../../cadence/scripts/getInscriptionMetadataList.cdc?raw';
import listingItemScript from '../../cadence/scripts/Marketplace/get_all_listing_display_model.cdc?raw';
import listingAmountScript from '../../cadence/scripts/Marketplace/get_all_listing_amount.cdc?raw';
import cleanNotListedItemsScript from '../../cadence/transactions/cleanNotListedItems.cdc?raw';
import checkListingIdExistScript from '../../cadence/scripts/checkListingIdExist.cdc?raw';
import progressScript from '../../cadence/scripts/getProgress.cdc?raw';
import flowBalance from '../../cadence/scripts/getFlowBalance.cdc?raw';
import createAccountScript from '../../cadence/transactions/createAccount.cdc?raw';
import createAccountAndDepositScript from '../../cadence/transactions/createAccountAndDeposit.cdc?raw';
import transferInscriptionAndFlowScript from '../../cadence/transactions/transferInscriptionAndFlow.cdc?raw';
import inscriptionIdsScript from '../../cadence/scripts/getInscriptionIds.cdc?raw';
import transferFlowScript from '../../cadence/transactions/transferFlow.cdc?raw';
import batchDelistScript from '../../cadence/transactions/bay/batchDelist.cdc?raw';
import predictedStakingScript from '../../cadence/scripts/getPredictedStakingScore.cdc?raw';
import stakingInfoScript from '../../cadence/scripts/getStakingInfo.cdc?raw';
import burningInfoScript from '../../cadence/scripts/getBurningInfo.cdc?raw';
import stakingScoreScript from '../../cadence/scripts/getStakingScore.cdc?raw';
import burningScript from '../../cadence/transactions/burning.cdc?raw';
import stakingScript from '../../cadence/transactions/staking.cdc?raw';

export const replacement = (script: string): string => {
  return script
    .replace(`import NonFungibleToken from "./NonFungibleToken.cdc"`, `import NonFungibleToken from ${NonFungibleToken}`)
    .replace(`import "NonFungibleToken"`, `import NonFungibleToken from ${NonFungibleToken}`)
    .replace(`import NonFungibleToken from 0xNonFungibleToken`, `import NonFungibleToken from ${NonFungibleToken}`)
    .replace(`import FungibleToken from "./FungibleToken.cdc"`, `import FungibleToken from ${FungibleToken}`)
    .replace(`import "FungibleToken"`, `import FungibleToken from ${FungibleToken}`)
    .replace(`import FungibleToken from 0xFungibleToken`, `import FungibleToken from ${FungibleToken}`)
    .replace(`import Inscription from "./Inscription.cdc"`, `import Inscription from ${Inscription}`)
    .replace(`import "Inscription"`, `import Inscription from ${Inscription}`)
    .replace(`import Inscription from 0xInscription`, `import Inscription from ${Inscription}`)
    .replace(`import InscriptionMetadata from "./InscriptionMetadata.cdc"`, `import InscriptionMetadata from ${InscriptionMetadata}`)
    .replace(`import "InscriptionMetadata"`, `import InscriptionMetadata from ${InscriptionMetadata}`)
    .replace(`import InscriptionMetadata from 0xInscriptionMetadata`, `import InscriptionMetadata from ${InscriptionMetadata}`)
    .replace(`import Marketplace from "./Marketplace.cdc"`, `import Marketplace from ${Marketplace}`)
    .replace(`import "Marketplace"`, `import Marketplace from ${Marketplace}`)
    .replace(`import Marketplace from 0xMarketplace`, `import Marketplace from ${Marketplace}`)
    .replace(`import NFTStorefront from "./NFTStorefront.cdc"`, `import NFTStorefront from ${NFTStorefront}`)
    .replace(`import "NFTStorefront"`, `import NFTStorefront from ${NFTStorefront}`)
    .replace(`import NFTStorefront from 0xNFTStorefront`, `import NFTStorefront from ${NFTStorefront}`)
    .replace(`import FlowToken from "./FlowToken.cdc"`, `import FlowToken from ${FlowToken}`)
    .replace(`import "FlowToken"`, `import FlowToken from ${FlowToken}`)
    .replace(`import FlowToken from 0xFlowToken`, `import FlowToken from ${FlowToken}`)
    .replace(`import ListingUtils from "./ListingUtils.cdc"`, `import ListingUtils from ${ListingUtils}`)
    .replace(`import "ListingUtils"`, `import ListingUtils from ${ListingUtils}`)
    .replace(`import ListingUtils from 0xListingUtils`, `import ListingUtils from ${ListingUtils}`)
    .replace(`import MarketplaceCleaner from "./MarketplaceCleaner.cdc"`, `import MarketplaceCleaner from ${MarketplaceCleaner}`)
    .replace(`import "MarketplaceCleaner"`, `import MarketplaceCleaner from ${MarketplaceCleaner}`)
    .replace(`import MarketplaceCleaner from 0xMarketplaceCleaner`, `import MarketplaceCleaner from ${MarketplaceCleaner}`)
    .replace(`import MarketplaceBlacklistV2 from "./MarketplaceBlacklistV2.cdc"`, `import MarketplaceBlacklistV2 from ${MarketplaceBlacklistV2}`)
    .replace(`import "MarketplaceBlacklistV2"`, `import MarketplaceBlacklistV2 from ${MarketplaceBlacklistV2}`)
    .replace(`import MarketplaceBlacklistV2 from 0xMarketplaceBlacklistV2`, `import MarketplaceBlacklistV2 from ${MarketplaceBlacklistV2}`)
    .replace(`import Fomopoly from "./Fomopoly.cdc"`, `import Fomopoly from ${Fomopoly}`)
    .replace(`import "Fomopoly"`, `import Fomopoly from ${Fomopoly}`)
    .replace(`import Fomopoly from 0xFomopoly`, `import Fomopoly from ${Fomopoly}`);
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

export const getInscriptionIdsScript = () => {
  return replacement(inscriptionIdsScript)
}

export const getTransferFlowScript = () => {
  return replacement(transferFlowScript)
}

export const getBatchDelistScript = () => {
  return replacement(batchDelistScript)
}

export const getPredictedStakingScript = () => {
  return replacement(predictedStakingScript)
}

export const getStakingInfoScript = () => {
  return replacement(stakingInfoScript)
}

export const getBurningInfoScript = () => {
  return replacement(burningInfoScript)
}

export const getStakingScoreScript = () => {
  return replacement(stakingScoreScript)
}

export const getBurningScript = () => {
  return replacement(burningScript)
}

export const getStakingScript = () => {
  return replacement(stakingScript)
}