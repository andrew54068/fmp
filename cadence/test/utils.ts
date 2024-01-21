import {
  getAccountAddress,
  deployContractByName,
  executeScript,
  sendTransaction,
  shallPass,
  shallRevert,
  getTemplate,
} from "@onflow/flow-js-testing";
import * as path from 'path';

const addressMap = {
  NonFungibleToken: "0xf8d6e0586b0a20c7",
  FungibleToken: "0xee82856bf20e2aa6",
  ViewResolver: "0xf8d6e0586b0a20c7",
  FlowToken: "0x0ae53cb6e3f42a79",
};

export const adminAddressName = "Alice";

export const expectContractDeployed = (deploymentResult, name: string) => {
  expect(deploymentResult.statusString).toEqual("SEALED");
  const event = deploymentResult.events.filter(
    (value) => value.type == "flow.AccountContractAdded" && value.data.contract == name
  );
  expect(event.length).toEqual(1);
};

export const deployContract = async (name: string) => {
  const admin = await getAccountAddress(adminAddressName);
  safeDeployContractByName(admin, name, addressMap)
}

export const deployInscription = async () => {
  const admin = await getAccountAddress(adminAddressName);

  const names = [
    "InscriptionMetadata",
    "Inscription"
  ];

  for (const name of names) {
    // We assume there is a file on "../cadence/contracts/Inscription.cdc" path
    await safeDeployContractByName(
      admin,
      name,
      addressMap,
    );
  }
};

export const serviceAccountMintTo = async (receiverName: string, amount: number) => {
  const serviceAccount = ["0xf8d6e0586b0a20c7"];
  const receiver = await getAccountAddress(receiverName);
  const mintArgs = [receiver, amount.toString()];
  const signers = [serviceAccount];

  try {
    const [, mintError] = await shallPass(
      sendTransaction({
        name: "mintFlow",
        args: mintArgs,
        signers,
        addressMap,
      })
    );
    expect(mintError).toBeNull();
    
    const [scriptResult, scriptError] = await safeExecuteScript("getFlowBalance", [receiver])
    expect(scriptError).toBeNull();
    console.log(`💥 scriptResult: ${JSON.stringify(scriptResult, null, '  ')}`);
  } catch (error) {
    console.log(`💥 error: ${JSON.stringify(error, null, "	")}`);
    throw error
  }
};

export const mintInscription = async (toPersonName: string, amount: number) => {
  const admin = await getAccountAddress(adminAddressName);
  const receiver = await getAccountAddress(toPersonName);
  const args = [amount.toString()];
  const signers = [receiver];

  const scriptName = "mintInscription"
  const [mintResult] = await safeExecuteTransaction(scriptName, args, signers, addressMap, true)
  const type = "A." + admin.slice(2) + ".Inscription.Deposit"
  const events = mintResult.events.filter(
    (value) => value.type == type && value.data.to == receiver
  );
  expect(events.length).toEqual(amount)

  const [scriptResult] = await safeExecuteScript(
    "getInscriptionIds",
    [receiver.toString()]
  );
  for (const event of events) {
    expect(scriptResult).toContain(event.data.id)
  }
}

export const updateStakeTime = async (start: string, end: string) => {
  const scriptName = "updateStakeTime"
  const admin = await getAccountAddress(adminAddressName);
  const args = [start, end];
  const signers = [admin];
  await safeExecuteTransaction(scriptName, args, signers, addressMap, true)
}

export const stakeInscription = async (toPersonName: string, ids: number[], expectSucceed: boolean) => {
  const staker = await getAccountAddress(toPersonName);
  const args = [ids.map(value => value.toString())];
  const signers = [staker];
  const scriptName = "staking"
  const [mintResult, error] = await safeExecuteTransaction(scriptName, args, signers, addressMap, expectSucceed)
  // console.log(`💥 mintResult: ${JSON.stringify(mintResult, null, '  ')}`);
  // const events = mintResult.events.filter(
  //   (value) => value.type == type && value.data.to == receiver
  // );
  // expect(events.length).toEqual(amount)
  return [mintResult, error]
}

export const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const safeExecuteTransaction = async (
  scriptName: string,
  args: any[],
  signers: string[],
  addressMap: Record<string, string>,
  expectSucceed: boolean
) => {
  const code = getTransactionCode(scriptName, addressMap)

  const expectWrap = expectSucceed ? shallPass : shallRevert

  const [txResult, error] = await expectWrap(
    sendTransaction({
      code: code,
      args: args,
      signers,
      addressMap,
    })
  );
  if (expectSucceed && error) {
    console.log(`💥 transaction Error: ${JSON.stringify(error, null, '  ')}`);
  }
  if (expectSucceed) {
    expect(error).toBeNull();
  } else {
    expect(error).not.toBeNull();
  }

  return [txResult, error]
}

export const safeExecuteScript = async (scriptName: string, args: any[]) => {
  const code = getScriptCode(scriptName, addressMap)
  const [scriptResult, scriptError] = await executeScript({
    code,
    args,
  });
  if (scriptError) {
    console.log(`💥 scriptError: ${JSON.stringify(scriptError, null, '  ')}`);
  }
  expect(scriptError).toBeNull();
  return [scriptResult, scriptError]
}

const getTransactionCode = (name: string, addressMap: Record<string, string>) => {
  const code = getTemplate(
    path.resolve(__dirname, `../transactions/` + name + `.cdc`),
    addressMap
  )
  return code
}

const getScriptCode = (name: string, addressMap: Record<string, string>) => {
  const code = getTemplate(
    path.resolve(__dirname, `../scripts/` + name + `.cdc`),
    addressMap
  )
  return code
}

const safeDeployContractByName = async (to: string, name: string, addressMap: Record<string, string>) => {
  const [deploymentResult, error] = await deployContractByName({
    to,
    name,
    addressMap,
  });
  if (error) {
    console.log(`💥 error: ${JSON.stringify(error, null, "	")}`);
  }
  expect(error).toBeNull();
  expect(deploymentResult.statusString).toEqual("SEALED");
  const event = deploymentResult.events.filter(
    (value) => value.type == "flow.AccountContractAdded"
  );
  expect(event.length).toEqual(1);
  expectContractDeployed(deploymentResult, name);
  addressMap[name] = to
  return [deploymentResult, error]
}