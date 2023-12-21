import { NonFungibleToken, Inscription, InscriptionMetadata } from 'src/constants';
import mintScript from '../../cadence/transactions/mint.cdc?raw';
import getMetaDataListScript from '../../cadence/scripts/get_inscription_metadata_list.cdc?raw';

export const getMintScripts = () => {
  return mintScript.replace(`import "NonFungibleToken"`, `import NonFungibleToken from ${NonFungibleToken}`)
    .replace(`import "Inscription"`, `import Inscription from ${Inscription}`)
    .replace(`import "InscriptionMetadata"`, `import InscriptionMetadata from ${InscriptionMetadata}`);
}

export const getMetaDataListScripts = () => {
  return getMetaDataListScript.replace(`import "Inscription"`, `import Inscription from ${Inscription}`)
    .replace(`import "InscriptionMetadata"`, `import InscriptionMetadata from ${InscriptionMetadata}`);
}