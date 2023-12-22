import { NonFungibleToken, Inscription, InscriptionMetadata } from 'src/constants';
import mintScript from '../../cadence/transactions/mint.cdc?raw';
import metaDataListScript from '../../cadence/scripts/get_inscription_metadata_list.cdc?raw';
import progressScript from '../../cadence/scripts/get_progress.cdc?raw';

export const getMintScripts = () => {
  return mintScript.replace(`import "NonFungibleToken"`, `import NonFungibleToken from ${NonFungibleToken}`)
    .replace(`import "Inscription"`, `import Inscription from ${Inscription}`)
    .replace(`import "InscriptionMetadata"`, `import InscriptionMetadata from ${InscriptionMetadata}`);
}

export const getMetaDataListScripts = () => {
  return metaDataListScript.replace(`import "Inscription"`, `import Inscription from ${Inscription}`)
    .replace(`import "InscriptionMetadata"`, `import InscriptionMetadata from ${InscriptionMetadata}`);
}

export const getProgressScript = () => {
  return progressScript.replace(`import "Inscription"`, `import Inscription from ${Inscription}`)
}