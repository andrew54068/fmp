import { NonFungibleToken, Inscription, InscriptionMetadata, Marketplace, NFTStorefront, FlowToken } from 'src/constants';
import mintScript from '../../cadence/transactions/mint.cdc?raw';
import metaDataListScript from '../../cadence/scripts/get_inscription_metadata_list.cdc?raw';
import progressScript from '../../cadence/scripts/get_progress.cdc?raw';

const replacement = (script: string) => {
  script
    .replace(`import "NonFungibleToken"`, `import NonFungibleToken from ${NonFungibleToken}`)
    .replace(`import "Inscription"`, `import Inscription from ${Inscription}`)
    .replace(`import "InscriptionMetadata"`, `import InscriptionMetadata from ${InscriptionMetadata}`)
    .replace(`import "Marketplace"`, `import Marketplace from ${Marketplace}`)
    .replace(`import "NFTStorefront"`, `import Marketplace from ${NFTStorefront}`)
    .replace(`import "FlowToken"`, `import Marketplace from ${FlowToken}`);
}

export const getMintScripts = () => {
  return replacement(mintScript)
}

export const getMetaDataListScripts = () => {
  return replacement(metaDataListScript)
}

export const getProgressScript = () => {
  return replacement(progressScript)
}