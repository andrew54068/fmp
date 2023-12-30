import { NonFungibleToken, FungibleToken, Inscription, InscriptionMetadata, Marketplace, NFTStorefront, FlowToken, ListingUtils } from 'src/constants';
import mintScript from '../../cadence/transactions/mint.cdc?raw';
import purchaseScript from '../../cadence/transactions/bay/buySingleInscription.cdc?raw';
import batchPurchaseScript from '../../cadence/transactions/batchBuyInscription.cdc?raw';
import metaDataListScript from '../../cadence/scripts/get_inscription_metadata_list.cdc?raw';
import progressScript from '../../cadence/scripts/get_progress.cdc?raw';

const replacement = (script: string): string => {
  return script
    .replace(`import "NonFungibleToken"`, `import NonFungibleToken from ${NonFungibleToken}`)
    .replace(`import "FungibleToken"`, `import FungibleToken from ${FungibleToken}`)
    .replace(`import "Inscription"`, `import Inscription from ${Inscription}`)
    .replace(`import "InscriptionMetadata"`, `import InscriptionMetadata from ${InscriptionMetadata}`)
    .replace(`import "Marketplace"`, `import Marketplace from ${Marketplace}`)
    .replace(`import "NFTStorefront"`, `import NFTStorefront from ${NFTStorefront}`)
    .replace(`import "FlowToken"`, `import FlowToken from ${FlowToken}`)
    .replace(`import "ListingUtils"`, `import ListingUtils from ${ListingUtils}`);
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

export const getMetaDataListScripts = () => {
  return replacement(metaDataListScript)
}

export const getProgressScript = () => {
  return replacement(progressScript)
}