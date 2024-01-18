import path from "path";
import {
  emulator,
  init,
  getAccountAddress,
  deployContractByName,
} from "@onflow/flow-js-testing";
import {
  expectContractDeployed,
} from "./utils";

describe("Deploy Contracts", () => {
  beforeEach(async () => {
    const basePath = path.resolve(__dirname, "../../cadence");

    console.log(`💥 basePath: ${JSON.stringify(basePath, null, "  ")}`);

    await init(basePath);
    await emulator.start({
      logging: true,
    });
  });

  //  Stop emulator, so it could be restarted
  afterEach(async () => {
    return emulator.stop();
  });

  const addressMap = {
    NonFungibleToken: "0xf8d6e0586b0a20c7",
    FungibleToken: "0xee82856bf20e2aa6",
    ViewResolver: "0xf8d6e0586b0a20c7",
  };

  test("Depoly Inscription", async () => {
    const admin = await getAccountAddress("Alice");

    const names = [
      "InscriptionMetadata",
    ];

    let latestAddressMap = {}

    console.log(`💥 addressMap: ${JSON.stringify(addressMap, null, '  ')}`);

    for (const name of names) {
      const [deploymentResult, error] = await deployContractByName({
        to: admin,
        name,
        addressMap,
      });
      console.log(`💥 error: ${JSON.stringify(error, null, "  ")}`);
      expect(error).toBeNull();
      expectContractDeployed(deploymentResult, name);
      latestAddressMap = {...addressMap, name: admin}
    }

    // We assume there is a file on "../cadence/contracts/Inscription.cdc" path
    const name = "Inscription";
    const [deploymentResult, error] = await deployContractByName({
      to: admin,
      name,
      addressMap: latestAddressMap,
    });
    if (error) {
      console.log(`💥 error: ${JSON.stringify(error, null, "	")}`);
    }
    expect(error).toBeNull();
    expectContractDeployed(deploymentResult, name);
  });
});
