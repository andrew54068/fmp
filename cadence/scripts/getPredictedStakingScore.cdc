import Fomopoly from 0xFomopoly

pub fun main(address: Address, amount: Int, endTime: UFix64): UFix64 {
    return Fomopoly.predictScore(address: address, amount: amount, endTime: endTime)
}