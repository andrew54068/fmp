import NonFungibleToken from 0x1d7e57aa55817448
import Inscription from 0xa217c76f53a1a081

transaction() {
	prepare(signer: AuthAccount) {
		signer.unlink(Inscription.CollectionPublicPath)
		if let res <- signer.load<@Inscription.Collection>(from: Inscription.CollectionStoragePath) {
			destroy res
		}
	}
}