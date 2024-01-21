import FlowToken from 0xFlowToken
import FungibleToken from 0xFungibleToken

transaction() {

    prepare(host: AuthAccount) {

        if host.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault) == nil {
            host.save(<-FlowToken.createEmptyVault(), to: /storage/flowTokenVault)
        }

        if host
            .getCapability<&FlowToken.Vault{FungibleToken.Receiver}>(/public/flowTokenReceiver)
            .check() == false {
            host.link<&FlowToken.Vault{FungibleToken.Receiver}>(
                /public/flowTokenReceiver,
                target: /storage/flowTokenVault
            )
        }
    }

    execute {
    }
}