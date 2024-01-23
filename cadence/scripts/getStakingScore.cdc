import Fomopoly from 0xFomopoly

pub fun main(address: Address, endTime: UFix64): [UFix64] {
    return [
        Fomopoly.totalScore(endTime: endTime),
        Fomopoly.calculateScore(address: address, endTime: endTime, includeClaimed: false)
    ]
}