import path from "path";
import { emulator, init, getAccountAddress } from "@onflow/flow-js-testing";
import {
  deployInscription,
  deployContract,
  mintInscription,
  stakeInscription,
  serviceAccountMintTo,
  safeExecuteScript,
  updateStakeTime,
  sleep,
  claimFMP,
  claimFMPAttack,
  burnInscription
} from "./utils";
import BigNumber from "bignumber.js";

describe("Deploy Contracts", () => {
  beforeEach(async () => {
    const basePath = path.resolve(__dirname, "../../cadence");

    await init(basePath);
    await emulator.start({
      logging: true,
    });

    await deployInscription();
    await deployContract("Fomopoly");
  });

  //  Stop emulator, so it could be restarted
  afterEach(async () => {
    return emulator.stop();
  });

  test("Stake inscription balance insufficient", async () => {
    const user = "Bob"
    await mintInscription(user, 2)
    await serviceAccountMintTo(user, 0.09)
    const [, error] = await stakeInscription(user, 2, false)
    expect(error).toContain(`Amount withdrawn must be less than or equal than the balance of the Vault`);
  });

  test("Stake inscription balance enough with updated staking time", async () => {
    const user = "Bob"
    await mintInscription(user, 2)
    await serviceAccountMintTo(user, 0.1)
    const scriptName = "getStakingInfo"
    const [stakingTimeResult, stakingTimeError] = await safeExecuteScript(scriptName, [])
    expect(stakingTimeError).toBeNull()
    expect(stakingTimeResult).toEqual([
      "0.00000000",
      "0.00000000"
    ])
    const start: number = Math.floor((new Date()).getTime() / 1000)
    const end: number = start + 3
    await updateStakeTime(start.toString(), end.toString())

    const [stakingTimeResult2, stakingTimeError2] = await safeExecuteScript(scriptName, [])
    expect(stakingTimeError2).toBeNull()
    expect(stakingTimeResult2).toEqual([
      start.toString() + ".00000000",
      end.toString() + ".00000000"
    ])

    await stakeInscription(user, 2, true)
  });

  test("Stake inscription balance enough after end time", async () => {
    const user = "Bob"
    await mintInscription(user, 2)
    await serviceAccountMintTo(user, 0.1)
    const scriptName = "getStakingInfo"
    const [stakingTimeResult, stakingTimeError] = await safeExecuteScript(scriptName, [])
    expect(stakingTimeError).toBeNull()
    expect(stakingTimeResult).toEqual([
      "0.00000000",
      "0.00000000"
    ])
    const start: number = Math.floor((new Date()).getTime() / 1000)
    const end: number = start + 3
    await updateStakeTime(start.toString(), end.toString())

    const [stakingTimeResult2, stakingTimeError2] = await safeExecuteScript(scriptName, [])
    expect(stakingTimeError2).toBeNull()
    expect(stakingTimeResult2).toEqual([
      start.toString() + ".00000000",
      end.toString() + ".00000000"
    ])

    await updateStakeTime(start.toString(), end.toString())
    await sleep(1 * 1000)
    await updateStakeTime(start.toString(), end.toString())
    await sleep(1 * 1000)
    await updateStakeTime(start.toString(), end.toString())
    await sleep(1 * 1000)
    await updateStakeTime(start.toString(), end.toString())
    await sleep(1 * 1000)
    await updateStakeTime(start.toString(), end.toString())

    const [, stakingTimeError3] = await safeExecuteScript(scriptName, [])
    expect(stakingTimeError3).toBeNull()

    const [, error] = await stakeInscription(user, 2, false)
    expect(error).toContain(`Can't stake after stakingEndTime.`);
  });

  test("Stake inscription and check score", async () => {
    const user = "Bob"
    const user2 = "Jack"
    await mintInscription(user, 2)
    await mintInscription(user2, 10)
    await serviceAccountMintTo(user, 0.1)
    await serviceAccountMintTo(user2, 0.5)
    const scriptName = "getStakingInfo"
    const [stakingTimeResult, stakingTimeError] = await safeExecuteScript(scriptName, [])
    expect(stakingTimeError).toBeNull()
    expect(stakingTimeResult).toEqual([
      "0.00000000",
      "0.00000000"
    ])
    const start: number = Math.floor((new Date()).getTime() / 1000)
    const end: number = start + 3
    await updateStakeTime(start.toString(), end.toString())

    const [stakingTimeResult2, stakingTimeError2] = await safeExecuteScript(scriptName, [])
    expect(stakingTimeError2).toBeNull()
    expect(stakingTimeResult2).toEqual([
      start.toString() + ".00000000",
      end.toString() + ".00000000"
    ])

    await stakeInscription(user, 2, true)
    await stakeInscription(user2, 10, true)

    const scoreScriptName = "getStakingScore"
    await safeExecuteScript(scoreScriptName, [await getAccountAddress(user), end.toString()])

    await safeExecuteScript(scoreScriptName, [await getAccountAddress(user2), end.toString()])

    await claimFMP(user, false)

    await updateStakeTime(start.toString(), end.toString())
    await sleep(1 * 1000)
    await updateStakeTime(start.toString(), end.toString())
    await sleep(1 * 1000)
    await updateStakeTime(start.toString(), end.toString())
    await sleep(1 * 1000)
    await updateStakeTime(start.toString(), end.toString())
    await sleep(1 * 1000)
    await updateStakeTime(start.toString(), end.toString())

    await claimFMP(user, true)
    await claimFMP(user2, true)

    await safeExecuteScript(scoreScriptName, [await getAccountAddress(user), end.toString()])
    await claimFMP(user, true)
  });

  test("Stake inscription multiple times and check score", async () => {
    const user = "Bob"
    const user2 = "Jack"
    const user3 = "Joe"
    await mintInscription(user, 4)
    await mintInscription(user2, 10)
    await mintInscription(user3, 3)
    await serviceAccountMintTo(user, 0.2)
    await serviceAccountMintTo(user2, 0.5)
    await serviceAccountMintTo(user3, 0.5)
    const scriptName = "getStakingInfo"
    const [stakingTimeResult, stakingTimeError] = await safeExecuteScript(scriptName, [])
    expect(stakingTimeError).toBeNull()
    expect(stakingTimeResult).toEqual([
      "0.00000000",
      "0.00000000"
    ])
    const start: number = Math.floor((new Date()).getTime() / 1000)
    const end: number = start + 5
    await updateStakeTime(start.toString(), end.toString())

    const [stakingTimeResult2, stakingTimeError2] = await safeExecuteScript(scriptName, [])
    expect(stakingTimeError2).toBeNull()
    expect(stakingTimeResult2).toEqual([
      start.toString() + ".00000000",
      end.toString() + ".00000000"
    ])

    await stakeInscription(user, 2, true)
    await stakeInscription(user2, 10, true)
    await stakeInscription(user3, 3, true)

    const scoreScriptName = "getStakingScore"
    await safeExecuteScript(scoreScriptName, [await getAccountAddress(user), end.toString()])

    await safeExecuteScript(scoreScriptName, [await getAccountAddress(user2), end.toString()])

    await claimFMP(user, false)

    await updateStakeTime(start.toString(), end.toString())
    await sleep(1 * 1000)
    await updateStakeTime(start.toString(), end.toString())
    await sleep(1 * 1000)

    await stakeInscription(user, 2, true)

    await updateStakeTime(start.toString(), end.toString())
    await sleep(1 * 1000)
    await updateStakeTime(start.toString(), end.toString())
    await sleep(1 * 1000)
    await updateStakeTime(start.toString(), end.toString())

    const [claimResult] = await claimFMP(user, true)
    const event = claimResult.events.find(
      (value) => value.type == "A.01cf0e2f2f715450.Fomopoly.TokensMinted"
    );
    const claimAmount = event?.data.amount ?? 0

    const [claimResult2] = await claimFMP(user2, true)
    const event2 = claimResult2.events.find(
      (value) => value.type == "A.01cf0e2f2f715450.Fomopoly.TokensMinted"
    );
    const claimAmount2 = event2?.data.amount ?? 0

    const [claimResult3] = await claimFMP(user3, true)
    const event3 = claimResult3.events.find(
      (value) => value.type == "A.01cf0e2f2f715450.Fomopoly.TokensMinted"
    );
    const claimAmount3 = event3?.data.amount ?? 0

    const total = BigNumber(claimAmount).plus(BigNumber(claimAmount2)).plus(BigNumber(claimAmount3))
    const result = BigNumber(16800000).minus(total).toNumber()
    expect(1 > result).toBeTruthy()

    await safeExecuteScript(scoreScriptName, [await getAccountAddress(user), end.toString()])
    await claimFMP(user, true)
  });

  test("claim other's reward", async () => {
    const user = "Bob"
    const user2 = "Jack"
    await mintInscription(user, 2)
    await mintInscription(user2, 10)
    await serviceAccountMintTo(user, 0.1)
    await serviceAccountMintTo(user2, 0.5)
    const scriptName = "getStakingInfo"
    const [stakingTimeResult, stakingTimeError] = await safeExecuteScript(scriptName, [])
    expect(stakingTimeError).toBeNull()
    expect(stakingTimeResult).toEqual([
      "0.00000000",
      "0.00000000"
    ])
    const start: number = Math.floor((new Date()).getTime() / 1000)
    const end: number = start + 3
    await updateStakeTime(start.toString(), end.toString())

    const [stakingTimeResult2, stakingTimeError2] = await safeExecuteScript(scriptName, [])
    expect(stakingTimeError2).toBeNull()
    expect(stakingTimeResult2).toEqual([
      start.toString() + ".00000000",
      end.toString() + ".00000000"
    ])

    await stakeInscription(user, 2, true)
    await stakeInscription(user2, 10, true)

    const scoreScriptName = "getStakingScore"
    await safeExecuteScript(scoreScriptName, [await getAccountAddress(user), end.toString()])

    await safeExecuteScript(scoreScriptName, [await getAccountAddress(user2), end.toString()])

    await claimFMP(user, false)

    await updateStakeTime(start.toString(), end.toString())
    await sleep(1 * 1000)
    await updateStakeTime(start.toString(), end.toString())
    await sleep(1 * 1000)
    await updateStakeTime(start.toString(), end.toString())
    await sleep(1 * 1000)
    await updateStakeTime(start.toString(), end.toString())
    await sleep(1 * 1000)
    await updateStakeTime(start.toString(), end.toString())

    const [, attackError] = await claimFMPAttack(user, user2, false)
    expect(attackError).toContain(`value of type \`PublicAccount\` has no member \`borrow\``);
  });

  test("Burn inscription success", async () => {
    const user = "Bob"
    await mintInscription(user, 20)
    await burnInscription(user, 20, true)
  });

  test("Burn more than inscription balance", async () => {
    const user = "Bob"
    await mintInscription(user, 20)
    const [, error] = await burnInscription(user, 21, false)
    expect(error).toContain(`are out of bounds`);
  });

  test("Burn great amount of inscription", async () => {
    const user = "Bob"
    await serviceAccountMintTo(user, 1)
    let amount = 500
    let deductor = 5
    let partialMax = 0
    const max = 2000
    for (let i = 0; i <= max; i = i + amount) {
      try {
        await mintInscription(user, amount)
      } catch (err) {
        partialMax = Math.max(partialMax, i)
        i = i - amount
        if (partialMax - amount > i) {
          deductor++
        }
        amount = Math.max(amount - deductor, 0)
      }
    }
    const [, error] = await burnInscription(user, 1000, true)
    expect(error).toBeNull()
  });

});
