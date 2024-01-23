import Fomopoly from 0xFomopoly

pub fun main(): [UFix64] {
    return [
        Fomopoly.stakingStartTime,
        Fomopoly.stakingEndTime,
        Fomopoly.stakingDivisor
    ]
}