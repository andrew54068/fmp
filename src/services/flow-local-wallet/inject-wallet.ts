import * as fcl from '@blocto/fcl'
import { send } from '@onflow/util-actor'
import { type Wallet } from './wallet'

const NAME = 'CURRENT_USER'
const SET_CURRENT_USER = 'SET_CURRENT_USER'
const DEL_CURRENT_USER = 'DEL_CURRENT_USER'

export const injectWallet = async (wallet: Wallet) => {
	let oldConfig: any | undefined
	if (wallet.configs) {
		oldConfig = await fcl.config.all()
		await fcl.config(wallet.configs)
	}

	await send(NAME, DEL_CURRENT_USER)
	await send(NAME, SET_CURRENT_USER, await wallet.user())

	return async () => {
		oldConfig && await fcl.config(oldConfig)
		await send(NAME, DEL_CURRENT_USER)
	}
}
