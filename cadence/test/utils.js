import {
	getAccountAddress,
	deployContractByName,
	executeScript,
	sendTransaction,
	shallPass,
} from "@onflow/flow-js-testing";

export const adminAddressName = "Alice";

export const expectContractDeployed = (deploymentResult, name) => {
	expect(deploymentResult.statusString).toEqual("SEALED");
	let event = deploymentResult.events.filter(
		(value) => value.type == "flow.AccountContractAdded"
	);
	expect(event.length).toEqual(1);
};

export const deployInscription = async () => {
	const to = await getAccountAddress("Alice");

	console.log(`💥 to: ${JSON.stringify(to, null, '  ')}`);

	// We assume there is a file on "../cadence/contracts/Inscription.cdc" path
	const name = "Inscription";

	const [deploymentResult, error] = await deployContractByName({ to, name });
	console.log(`💥 error: ${JSON.stringify(error, null, '  ')}`);
	expect(error).toBeNull();
	expect(deploymentResult.statusString).toEqual("SEALED");
	let event = deploymentResult.events.filter(
		(value) => value.type == "flow.AccountContractAdded"
	);
	expect(event.length).toEqual(1);
	expectContractDeployed(deploymentResult, name);
};

export const deployContract = async (name) => {
	const to = await getAccountAddress("Alice");

	try {
		const [deploymentResult, error] = await deployContractByName({ to, name });
		expect(error).toBeNull();
		expect(deploymentResult.statusString).toEqual("SEALED");
		let event = deploymentResult.events.filter(
			(value) => value.type == "flow.AccountContractAdded"
		);
		expect(event.length).toEqual(1);
		expectContractDeployed(deploymentResult, name);
	} catch (error) {
		console.log(`💥 error: ${JSON.stringify(error, null, "	")}`);
	}
};

export const serviceAccountMintTo = async (receiver, amount) => {
	const serviceAccount = ["0xf8d6e0586b0a20c7"];
	const mintArgs = [receiver, amount.toString()];

	try {
		const [mintResult, mintError] = await shallPass(
			sendTransaction("Mint-flow", serviceAccount, mintArgs)
		);
		expect(mintError).toBeNull();
	} catch (error) {
		console.log(`💥 error: ${JSON.stringify(error, null, "	")}`);
	}
};

export const registerWithFlowByAddress = async (addressName, bet) => {
	const admin = await getAccountAddress(adminAddressName);
	const args = [];
	const signers = [admin];

	try {
		const [txResult, error] = await shallPass(
			sendTransaction("TestMatcher-admin-active-register", signers, args)
		);
		expect(error).toBeNull();
	} catch (error) {
		console.log(`💥 error: ${JSON.stringify(error, null, "	")}`);
	}

	const account = await getAccountAddress(addressName);
	const args1 = [bet.toString()];
	const signers1 = [account];

	try {
		const [txResult1, error1] = await shallPass(
			sendTransaction("Gomoku-register", signers1, args1)
		);
		expect(error1).toBeNull();
	} catch (error) {
		console.log(`💥 error: ${JSON.stringify(error, null, "	")}`);
	}
};

export const matching = async (challenger, budget) => {
	const admin = await getAccountAddress(adminAddressName);
	const args = [];
	const signers = [admin];

	try {
		const [txResult, error] = await shallPass(
			sendTransaction("TestMatcher-admin-active-match", signers, args)
		);
		expect(error).toBeNull();
	} catch (error) {
		console.log(`💥 error: ${JSON.stringify(error, null, "	")}`);
	}

	const signers1 = [challenger];

	try {
		const [txResult1, error1] = await shallPass(
			sendTransaction("Gomoku-match", signers1, [budget.toString()])
		);
		expect(error1).toBeNull();
	} catch (error) {
		console.log(`💥 error: ${JSON.stringify(error, null, "	")}`);
	}
};

export const matchGomokuAlongWithRegister = async (
	index,
	hostAddressName,
	challengerAddressName,
	bet
) => {
	await registerWithFlowByAddress(hostAddressName, bet);

	const host = await getAccountAddress(hostAddressName);

	const challenger = await getAccountAddress(challengerAddressName);

	await matching(challenger, bet);

	const [scriptResult, scriptError] = await executeScript(
		"Gomoku-get-composition-ref",
		[index.toString()]
	);
	expect(scriptError).toBeNull();
	expect(scriptResult["host"]).toEqual(host);
	expect(scriptResult["challenger"]).toEqual(challenger);
	expect(scriptResult["currentRound"]).toEqual(0);
	expect(scriptResult["id"]).toEqual(index);
	expect(Object.keys(scriptResult["locationStoneMaps"]).length).toEqual(2);
	expect(scriptResult["roundWinners"]).toEqual([]);
	expect(scriptResult["steps"]).toEqual([[], []]);
	expect(scriptResult["totalRound"]).toEqual(2);
	expect(scriptResult["winner"]).toBeNull();

	const [scriptResult2, scriptError2] = await executeScript(
		"Gomoku-get-participants",
		[index.toString()]
	);
	expect(scriptError2).toBeNull();
	expect(scriptResult2).toEqual([host, challenger]);

	const [scriptResult3, scriptError3] = await executeScript(
		"Gomoku-get-opening-bet",
		[index.toString()]
	);
	expect(scriptError3).toBeNull();
	expect(scriptResult3).toEqual(`${bet * 2}.00000000`);

	const [scriptResult4, scriptError4] = await executeScript(
		"Gomoku-get-valid-bets",
		[index.toString()]
	);
	expect(scriptError4).toBeNull();
	expect(scriptResult4).toEqual(`${bet * 2}.00000000`);
};

export const makeMove = async (
	player,
	index,
	round,
	stone,
	raiseBet,
	expectStoneData
) => {
	const args = [
		index.toString(),
		stone.x.toString(),
		stone.y.toString(),
		raiseBet.toString(),
	];
	const signers = [player];
	const limit = 9999;

	try {
		const [txResult, error] = await shallPass(
			sendTransaction("Gomoku-make-move", signers, args, limit)
		);
		expect(error).toBeNull();
	} catch (error) {
		console.log(`💥 make move error: ${JSON.stringify(error, null, "  ")}`);
	}

	try {
		const [scriptResult, scriptError] = await executeScript(
			"Gomoku-get-stone-data",
			[index.toString(), round.toString()]
		);
		expect(scriptError).toBeNull();
		expect(scriptResult).toEqual(expectStoneData);
	} catch (error) {
		console.log(`💥 get stone data error: ${JSON.stringify(error, null, "	")}`);
	}
};
