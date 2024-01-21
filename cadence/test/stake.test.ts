import path from "path";
import { emulator, init } from "@onflow/flow-js-testing";
import {
  deployInscription,
  deployContract,
  mintInscription,
  stakeInscription,
  serviceAccountMintTo,
  safeExecuteScript,
  updateStakeTime,
  sleep
} from "./utils";

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
    const [, error] = await stakeInscription(user, [0, 1000], false)
    expect(error).toContain(`Amount withdrawn must be less than or equal than the balance of the Vault`);
  });

  test("Stake inscription balance insufficient 2", async () => {
    const user = "Bob"
    await mintInscription(user, 2)
    await serviceAccountMintTo(user, 0.09)
    const [result] = await stakeInscription(user, [0, 1000], false)
    console.log(`💥 result: ${JSON.stringify(result, null, '  ')}`);
  });

  test("Stake inscription balance enough with updated staking time", async () => {
    const user = "Bob"
    await mintInscription(user, 2)
    await serviceAccountMintTo(user, 0.1)
    const scriptName = "getStakingTime"
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

    await stakeInscription(user, [0, 1000], true)
  });

  test("Stake inscription balance enough after end time", async () => {
    const user = "Bob"
    await mintInscription(user, 2)
    await serviceAccountMintTo(user, 0.1)
    const scriptName = "getStakingTime"
    const [stakingTimeResult, stakingTimeError] = await safeExecuteScript(scriptName, [])
    expect(stakingTimeError).toBeNull()
    console.log(`💥 stakingTimeResult: ${JSON.stringify(stakingTimeResult, null, '  ')}`);
    expect(stakingTimeResult).toEqual([
      "0.00000000",
      "0.00000000"
    ])
    const start: number = Math.floor((new Date()).getTime() / 1000)
    const end: number = start + 3
    await updateStakeTime(start.toString(), end.toString())

    const [stakingTimeResult2, stakingTimeError2] = await safeExecuteScript(scriptName, [])
    expect(stakingTimeError2).toBeNull()
    console.log(`💥 stakingTimeResult2: ${JSON.stringify(stakingTimeResult2, null, '  ')}`);
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

    const [stakingTimeResult3, stakingTimeError3] = await safeExecuteScript(scriptName, [])
    expect(stakingTimeError3).toBeNull()
    console.log(`💥 stakingTimeResult3: ${JSON.stringify(stakingTimeResult3, null, '  ')}`);

    const [, error] = await stakeInscription(user, [0, 1000], false)
    console.log(`💥 result: ${JSON.stringify(error, null, '  ')}`);
    expect(error).toContain(`Can't stake after stakingEndTime.`);
  });

  test("Burn Fomopoly", async () => {

  });
});
