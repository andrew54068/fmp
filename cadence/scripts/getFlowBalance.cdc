import FungibleToken from 0xFungibleToken
import FlowToken from 0xFlowToken

pub fun main (address: Address): UFix64 {
    let vaultRef = getAccount(address).getCapability(/public/flowTokenBalance)!.borrow<&AnyResource{FungibleToken.Balance}>()
        ?? panic("Could not borrow reference to the owner's Vault!")
    return vaultRef.balance
}