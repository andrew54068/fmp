import path from "path";
import { emulator, init } from "@onflow/flow-js-testing";
import { deployInscription, deployContract, mintInscription, stakeInscription, serviceAccountMintTo } from "./utils";

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

  test("Stake inscription balance enough", async () => {
    const user = "Bob"
    await mintInscription(user, 2)
    await serviceAccountMintTo(user, 0.1)
    const [result] = await stakeInscription(user, [0, 1000], true)
    console.log(`💥 result: ${JSON.stringify(result, null, '  ')}`);
    // expect(error).toContain(`Vault balance is not enough.`);
  });

  test("Burn Fomopoly", async () => {

  });
});
