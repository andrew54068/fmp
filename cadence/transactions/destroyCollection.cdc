import NonFungibleToken from 0x631e88ae7f1d7c20
import Inscription from 0x564b229bd8380848

transaction() {
	prepare(signer: AuthAccount) {
		signer.unlink(Inscription.CollectionPublicPath)
		if let res <- signer.load<@Inscription.Collection>(from: Inscription.CollectionStoragePath) {
			destroy res
		}
	}
}