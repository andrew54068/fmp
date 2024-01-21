import NonFungibleToken from 0xNonFungibleToken
import Inscription from 0xInscription

transaction() {
	prepare(signer: AuthAccount) {
		if signer.borrow<&Inscription.Collection>(from: Inscription.CollectionStoragePath) == nil {
			signer.save(<-Inscription.createEmptyCollection(), to: Inscription.CollectionStoragePath)
			signer.link<&Inscription.Collection{NonFungibleToken.CollectionPublic}>(
				Inscription.CollectionPublicPath, target: Inscription.CollectionStoragePath)
		}

		if signer.getCapability(Inscription.CollectionPublicPath)!.borrow<&{NonFungibleToken.CollectionPublic}>() == nil {
			signer.unlink(Inscription.CollectionPublicPath)
			signer.link<&Inscription.Collection{NonFungibleToken.CollectionPublic}>(
				Inscription.CollectionPublicPath, target: Inscription.CollectionStoragePath)
		}
	}
}