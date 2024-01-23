import FungibleToken from "./FungibleToken.cdc"
import NonFungibleToken from "./NonFungibleToken.cdc"
import Inscription from "./Inscription.cdc"
import FlowToken from "./FlowToken.cdc"

// Token contract of Fomopoly (FMP)
pub contract Fomopoly: FungibleToken {

    // Maximum supply of FMP tokens
    pub var totalSupply: UFix64

    // Maximum supply of FMP tokens
    pub let mintedByMinedSupply: UFix64

    // Maximum supply of FMP tokens
    pub var currentMintedByMinedSupply: UFix64

    // Maximum supply of FMP tokens
    pub let mintedByBurnSupply: UFix64

    // Maximum supply of FMP tokens
    pub var currentMintedByBurnedSupply: UFix64

    // Current supply of FMP tokens in existence
    pub var currentSupply: UFix64

    // Defines token vault storage path
    pub let TokenStoragePath: StoragePath

    // Defines token vault public balance path
    pub let TokenPublicBalancePath: PublicPath

    // Defines token vault public receiver path
    pub let TokenPublicReceiverPath: PublicPath

    // Defines admin storage path
    pub let adminStoragePath: StoragePath

    pub var stakingStartTime: UFix64

    pub var stakingEndTime: UFix64

    // Deside how many Flow does stake a inscription need
    pub var stakingDivisor: UFix64

    // Deside how many FMP you will get by burning a inscription
    pub var burningDivisor: UFix64

    // Events

    // Event that is emitted when the contract is created
    pub event TokensInitialized(initialSupply: UFix64)

    // Event that is emitted when tokens are withdrawn from a Vault
    pub event TokensWithdrawn(amount: UFix64, from: Address?)

    // Event that is emitted when tokens are deposited to a Vault
    pub event TokensDeposited(amount: UFix64, to: Address?)

    // Event that is emitted when new tokens are minted
    pub event TokensMinted(amount: UFix64)

    // Event that is emitted when tokens are destroyed
    pub event TokensBurned(amount: UFix64, from: Address?)

    // Event that is emitted when a new burner resource is created
    pub event BurnerCreated()

    // Event that is emitted when new inscriptions got staked
    pub event InscriptionStaked(stakeIds: [UInt64], from: Address)

    // Private

    priv let stakingModelMap: @{ Address: [StakingModel] }

    priv let stakingInfoMap: { Address: [StakingInfo] }

    priv let rewardClaimed: { Address: Bool }

    priv let flowVault: @FungibleToken.Vault

    // Vault
    //
    // Each user stores an instance of only the Vault in their storage
    // The functions in the Vault and governed by the pre and post conditions
    // in FungibleToken when they are called.
    // The checks happen at runtime whenever a function is called.
    //
    // Resources can only be created in the context of the contract that they
    // are defined in, so there is no way for a malicious user to create Vaults
    // out of thin air. A special Minter resource needs to be defined to mint
    // new tokens.
    //
    pub resource Vault: FungibleToken.Provider, FungibleToken.Receiver, FungibleToken.Balance {

        // holds the balance of a users tokens
        pub var balance: UFix64

        // initialize the balance at resource creation time
        init(balance: UFix64) {
            self.balance = balance
        }

        // withdraw
        //
        // Function that takes an integer amount as an argument
        // and withdraws that amount from the Vault.
        // It creates a new temporary Vault that is used to hold
        // the money that is being transferred. It returns the newly
        // created Vault to the context that called so it can be deposited
        // elsewhere.
        //
        pub fun withdraw(amount: UFix64): @FungibleToken.Vault {
            self.balance = self.balance - amount
            emit TokensWithdrawn(amount: amount, from: self.owner?.address)
            return <-create Vault(balance: amount)
        }

        // deposit
        //
        // Function that takes a Vault object as an argument and adds
        // its balance to the balance of the owners Vault.
        // It is allowed to destroy the sent Vault because the Vault
        // was a temporary holder of the tokens. The Vault's balance has
        // been consumed and therefore can be destroyed.
        pub fun deposit(from: @FungibleToken.Vault) {
            let vault <- from as! @Fomopoly.Vault
            self.balance = self.balance + vault.balance
            emit TokensDeposited(amount: vault.balance, to: self.owner?.address)
            vault.balance = 0.0
            destroy vault
        }

        // burnTokens
        //
        // Function that destroys a Vault instance, effectively burning the tokens.
        //
        // Note: the burned tokens are automatically subtracted from the
        // total supply in the Vault destructor.
        //
        pub fun burnTokens(amount: UFix64) {
            pre {
                self.balance >= amount: "Balance not enough!"
            }
            let vault <- self.withdraw(amount: amount)
            let amount = vault.balance
            destroy vault
            emit TokensBurned(amount: amount, from: self.owner?.address)
        }

        destroy() {
            Fomopoly.currentSupply = Fomopoly.currentSupply - self.balance
        }
    }

    // createEmptyVault
    //
    // Function that creates a new Vault with a balance of zero
    // and returns it to the calling context. A user must call this function
    // and store the returned Vault in their storage in order to allow their
    // account to be able to receive deposits of this token type.
    //
    pub fun createEmptyVault(): @FungibleToken.Vault {
        return <-create Vault(balance: 0.0)
    }

    priv fun createVault(balance: UFix64): @FungibleToken.Vault {
        return <-create Vault(balance: balance)
    }

    // Mint FMP by burning inscription
    pub fun mintTokensByBurn(collectionRef: &Inscription.Collection, burnedIds: [UInt64]): @Fomopoly.Vault {
        pre {
            collectionRef.getIDs().length > 0: "Amount minted must be greater than zero"
        }
        post {
            getCurrentBlock().timestamp >= self.stakingStartTime: "Can't burn before staking start time."
            getCurrentBlock().timestamp <= self.stakingEndTime: "Can't burn after staking end time."
            Fomopoly.currentSupply <= Fomopoly.totalSupply: "Current supply exceed total supply!"
            Fomopoly.currentMintedByBurnedSupply <= Fomopoly.mintedByBurnSupply: "Current minted by burning exceed supply!"
        }
        let burnedId: [UInt64] = collectionRef.burnInscription(ids: burnedIds)
        let mintedAmount: UFix64 = UFix64(burnedId.length) / self.burningDivisor
        self.currentSupply = self.currentSupply + mintedAmount
        self.currentMintedByBurnedSupply = self.currentMintedByBurnedSupply + mintedAmount

        emit TokensMinted(amount: mintedAmount)
        return <-create Vault(balance: mintedAmount)
    }

    pub fun stakingInscription(
        flowVault: @FungibleToken.Vault,
        collectionRef: auth &Inscription.Collection,
        stakeIds: [UInt64]
    ) {
        pre {
            collectionRef.owner != nil: "Owner not found!"
            flowVault.balance >= UFix64(stakeIds.length) / self.stakingDivisor: "Vault balance is not enough."
            getCurrentBlock().timestamp <= self.stakingEndTime: "Can't stake after stakingEndTime."
        }
        self.flowVault.deposit(from: <- flowVault)
        let newCollection <- Inscription.createEmptyCollection() as! @Inscription.Collection
        for id in stakeIds {
            newCollection.deposit(token: <- collectionRef.withdraw(withdrawID: id))
        }
        let ownerAddress = collectionRef.owner!.address
        let newCollectionRef = &newCollection as &Inscription.Collection
        let stakingInfo = self.generateStakingInfo(collection: newCollectionRef)
        let stakingModel <- self.generateStakingModel(collection: <- newCollection)
        self.addInfoToMap(info: stakingInfo, address: ownerAddress)
        self.addModelToMap(model: <- stakingModel, address: ownerAddress)
        emit InscriptionStaked(stakeIds: stakeIds, from: ownerAddress)
    }

    pub fun claimStakingReward(
        identityCollectionRef: auth &Fomopoly.Vault,
        inscriptionCollectionRef: auth &Inscription.Collection
    ) {
        pre {
            getCurrentBlock().timestamp >= self.stakingEndTime: "Can't withdraw reward before staking period ended."
        }
        let ownerAddress = identityCollectionRef.owner?.address
        let inscriptionoOwnerAddress = inscriptionCollectionRef.owner?.address
        assert(ownerAddress != nil, message: "Owner not found!")
        assert(inscriptionoOwnerAddress != nil, message: "Owner of inscription not found!")
        assert(ownerAddress == inscriptionoOwnerAddress, message: "Bad Boy!")
        self.distributeReward(identityCollectionRef: identityCollectionRef)
        self.unstakeInscription(collection: inscriptionCollectionRef)
        self.markStakingInfoClaimed(address: ownerAddress!)
    }

    priv fun distributeReward(identityCollectionRef: auth &Fomopoly.Vault) {
        pre {
            getCurrentBlock().timestamp >= self.stakingEndTime: "Can't distribute reward before staking period ended."
        }
        let receiver = identityCollectionRef.owner?.address
        assert(receiver != nil, message: "Receiver not found!")
        let totalScore = self.totalScore(endTime: self.stakingEndTime)
        let ownerScore = self.calculateScore(address: receiver!, endTime: self.stakingEndTime, includeClaimed: false)
        let percentage = ownerScore / totalScore
        let reward = self.mintedByMinedSupply * percentage
        emit TokensMinted(amount: reward)
        identityCollectionRef.deposit(from: <- self.createVault(balance: reward))
        self.currentMintedByMinedSupply = self.currentMintedByMinedSupply + reward
        assert(self.mintedByMinedSupply >= self.currentMintedByMinedSupply, message: "Reward exceed supply!")
    }

    // scripts
    pub fun totalScore(endTime: UFix64): UFix64 {
        let keys = self.stakingInfoMap.keys
        var finalScore: UFix64 = 0.0
        for address in keys {
            let score = self.calculateScore(address: address, endTime: endTime, includeClaimed: true)
            finalScore = finalScore + score
        }
        return finalScore
    }

    pub fun calculateScore(address: Address, endTime: UFix64, includeClaimed: Bool): UFix64 {
        let infos = self.stakingInfoMap[address] ?? []
        var finalScore: UFix64 = 0.0
        for info in infos {
            if !includeClaimed && info.claimed == true {
                continue
            }
            var startTime = info.timestamp
            if (startTime < self.stakingStartTime) {
                startTime = self.stakingStartTime
            }
            let age: UFix64 = endTime - startTime
            let score = UFix64(info.inscriptionAmount) * age
            finalScore = finalScore + score
        }
        return finalScore
    }

    pub fun predictScore(address: Address, amount: Int, endTime: UFix64): UFix64 {
        if (getCurrentBlock().timestamp > endTime) {
            return 0.0
        }
        let currentTime = getCurrentBlock().timestamp
        var finalEndTime = endTime
        if (endTime > self.stakingEndTime) {
            finalEndTime = self.stakingEndTime
        }
        let age = finalEndTime - currentTime
        let score = UFix64(amount) * age
        return score
    }

    priv fun addModelToMap(model: @Fomopoly.StakingModel, address: Address) {
        var storedModels: @[Fomopoly.StakingModel]? <- self.stakingModelMap[address] <- []
        if var stored <- storedModels {
            stored.append(<- model)
            var temp: @[Fomopoly.StakingModel]? <- stored
            self.stakingModelMap[address] <-> temp
            destroy temp
        } else {
            var newArray: @[Fomopoly.StakingModel]? <- [<- model] 
            self.stakingModelMap[address] <-> newArray
            destroy newArray
            destroy storedModels
        }
    }

    priv fun addInfoToMap(info: Fomopoly.StakingInfo, address: Address) {
        let infos = self.stakingInfoMap[address] ?? []
        infos.append(info)
        self.stakingInfoMap[address] = infos
    }

    priv fun generateStakingModel(collection: @Inscription.Collection): @StakingModel {
        let block = getCurrentBlock()
        return <- create StakingModel(
            timestamp: block.timestamp,
            inscriptionCollection: <- collection
        )
    }

    priv fun generateStakingInfo(collection: &Inscription.Collection): StakingInfo {
        let block = getCurrentBlock()
        return StakingInfo(
            timestamp: block.timestamp,
            inscriptionAmount: collection.getIDs().length
        )
    }

    priv fun unstakeInscription(collection: auth &Inscription.Collection) {
        let ownerAddress = collection.owner?.address
        assert(ownerAddress != nil, message: "Owner not found!")
        var currentModels: @[Fomopoly.StakingModel]? <- nil
        currentModels <-> self.stakingModelMap[ownerAddress!]
        if let unwrappedCurrentModels <- currentModels {
            var index = 0
            while index < unwrappedCurrentModels.length {
                let model: @Fomopoly.StakingModel <- unwrappedCurrentModels.remove(at: index)
                let stakedCollection <- model.withdrawCollection()
                collection.depositCollection(collection: <- stakedCollection)
                index = index + 1
                destroy model
            }
            destroy unwrappedCurrentModels
        } else {
            destroy currentModels
        }
        let storedModel <- self.stakingModelMap.remove(key: ownerAddress!)
        destroy storedModel
        assert(self.stakingModelMap.containsKey(ownerAddress!) == false, message: "Unstake failed!")
    }

    priv fun markStakingInfoClaimed(address: Address) {
        let infos: [Fomopoly.StakingInfo] = self.stakingInfoMap[address] ?? []
        let newInfos: [Fomopoly.StakingInfo] = []
        for info in infos {
            info.claimed = true
            newInfos.append(info)
        }
        self.stakingInfoMap[address] = newInfos
    }

    pub resource StakingModel {
        pub let timestamp: UFix64
        pub var inscriptionCollection: @Inscription.Collection?

        init(
            timestamp: UFix64,
            inscriptionCollection: @Inscription.Collection
        ) {
            self.timestamp = timestamp
            self.inscriptionCollection <- inscriptionCollection
        }

        pub fun withdrawCollection(): @Inscription.Collection {
            assert(self.inscriptionCollection != nil, message: "Collection not exist!")
            let collection <- self.inscriptionCollection <- nil
            return <- collection!
        }

        destroy() {
            destroy self.inscriptionCollection
        }
    }

    pub struct StakingInfo {
        pub let timestamp: UFix64
        pub let inscriptionAmount: Int
        pub(set) var claimed: Bool

        init(
            timestamp: UFix64,
            inscriptionAmount: Int
        ) {
            self.timestamp = timestamp
            self.inscriptionAmount = inscriptionAmount
            self.claimed = false
        }

    }

    pub resource Administrator {
        // updateStakingStartTime
        //
        pub fun updateStakingTime(start: UFix64, end: UFix64) {
            post {
                Fomopoly.stakingEndTime > Fomopoly.stakingStartTime: "End time should be later than start time."
            }
            Fomopoly.stakingStartTime = start
            Fomopoly.stakingEndTime = end
        }

        pub fun updateStakingDivisor(divisor: UFix64) {
            Fomopoly.stakingDivisor = divisor
        }

        pub fun updateBurningDivisor(divisor: UFix64) {
            Fomopoly.burningDivisor = divisor
        }
    }

    init() {
        // Total supply of FMP is 21M
        // 30% will minted from staking and mining
        self.totalSupply = 21_000_000.0
        self.mintedByBurnSupply = 4_200_000.0
        self.mintedByMinedSupply = self.totalSupply - self.mintedByBurnSupply
        self.currentMintedByMinedSupply = 0.0
        self.currentMintedByBurnedSupply = 0.0
        self.currentSupply = 0.0
        self.stakingStartTime = 0.0
        self.stakingEndTime = 0.0
        self.stakingDivisor = 20.0
        self.burningDivisor = 0.3

        self.stakingModelMap <- {}
        self.stakingInfoMap = {}
        self.rewardClaimed = {}
        self.flowVault <- FlowToken.createEmptyVault()

        self.TokenStoragePath = /storage/fomopolyTokenVault
        self.TokenPublicReceiverPath = /public/fomopolyTokenReceiver
        self.TokenPublicBalancePath = /public/fomopolyTokenBalance
        self.adminStoragePath = /storage/fomopolyAdmin

        // Create the Vault with the total supply of tokens and save it in storage
        // let vault <- create Vault(balance: self.totalSupply)
        // self.account.save(<-vault, to: self.TokenStoragePath)

        // Create a public capability to the stored Vault that only exposes
        // the `deposit` method through the `Receiver` interface
        // self.account.link<&Fomopoly.Vault{FungibleToken.Receiver}>(
        //     self.TokenPublicReceiverPath,
        //     target: self.TokenStoragePath
        // )

        // Create a public capability to the stored Vault that only exposes
        // the `balance` field through the `Balance` interface
        // self.account.link<&Fomopoly.Vault{FungibleToken.Balance}>(
        //     self.TokenPublicBalancePath,
        //     target: self.TokenStoragePath
        // )

        let admin <- create Administrator()
        self.account.save(<-admin, to: self.adminStoragePath)

        // Emit an event that shows that the contract was initialized
        emit TokensInitialized(initialSupply: self.totalSupply)
    }
}
