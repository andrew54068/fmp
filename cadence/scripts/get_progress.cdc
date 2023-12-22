import "Inscription"

/// Script to get current supply and hard cap
///
pub fun main(): [UInt64] {
    Inscription.totalSupply
    Inscription.hardCap

    return [Inscription.totalSupply + 1000, Inscription.hardCap]
}