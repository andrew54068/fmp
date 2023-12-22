import "Inscription"

/// Script to get current supply and hard cap
///
pub fun main(): [UInt64] {
    return [Inscription.totalSupply + 1000, Inscription.hardCap]
}