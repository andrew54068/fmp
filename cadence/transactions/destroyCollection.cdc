import NonFungibleToken from 0xNonFungibleToken
import Inscription from 0xInscription

transaction() {
	prepare(signer: AuthAccount) {
		signer.unlink(Inscription.CollectionPublicPath)
		if let res <- signer.load<@Inscription.Collection>(from: Inscription.CollectionStoragePath) {
			destroy res
		}
	}
}