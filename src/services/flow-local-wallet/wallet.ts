import * as fcl from "@blocto/fcl";
import { Buffer } from '@onflow/rlp'
import sha3 from 'js-sha3'
import elliptic from 'elliptic'

export type WalletAuthzAccount = {
	role: {
		proposer: boolean
	},
	roles: string[],
	signature: string
}

export type WalletAuthzReturn = WalletAuthzAccount & {
	addr: string
	keyId: number
	sequenceNum: number
	signature: string | null
	signingFunction: (data: any) => Promise<{
		addr: string
		keyId: number
		signature: string
	}>,
	resolve: any | null
	roles: string[]
}

export type WalletUser = {
	f_type: string
	f_vsn: string
	addr: string
	loggedIn: boolean
	expiresAt?: number
	services?: {
		f_type: string
		f_vsn: string
		type: string
		[x: string]: any
	}[]
}

export type Wallet = {
	user: () => Promise<WalletUser>
	authz: (account: WalletAuthzAccount) => Promise<WalletAuthzReturn>
	configs?: Record<string, string | any>
}


const ec = new elliptic.ec('p256')

const hashMsgHex = (msgHex: string) => {
	const hash = sha3.sha3_256.create()
	hash.update(Buffer.from(msgHex, 'hex'))
	return Buffer.from(hash.arrayBuffer())
}

const signWithKey = (privateKey: string, msgHex: string): string => {
	const key = ec.keyFromPrivate(Buffer.from(privateKey, 'hex'))
	const sig = key.sign(hashMsgHex(msgHex))
	const n = 32 // half of signature length?
	const r = sig.r.toArrayLike(Buffer, 'be', n)
	const s = sig.s.toArrayLike(Buffer, 'be', n)
	return Buffer.concat([r, s]).toString('hex')
}

const getAccount = async (addr: string) => {
	const { account } = await fcl.send([fcl.getAccount(addr)])
	return account
}

export type CreateLocalWalletOptions = {
	address: string
	privateKey: string
}

export const createLocalWallet = ({
	address,
	privateKey,
}: CreateLocalWalletOptions): Wallet => {
	const user: Wallet['user'] = async () => {
		return {
			f_type: 'USER',
			f_vsn: '1.0.0',
			addr: address,
			loggedIn: true,
		}
	}

	const authz: Wallet['authz'] = async (account) => {
		const user = await getAccount(address)
		const key = user.keys[0]

		let sequenceNum
		if (account.role && account.role.proposer) sequenceNum = key.sequenceNumber

		const signingFunction = async (data: any) => {
			const sig = signWithKey(privateKey, data.message)
			return {
				addr: user.address,
				keyId: key.index,
				signature: sig,
			}
		}

		return {
			...account,
			addr: user.address as string,
			keyId: key.index as number,
			sequenceNum,
			signingFunction,
			resolve: null,
		}
	}

	return {
		configs: {
			'discover.wallet': '',
			'fcl.authz': authz,
		},
		user,
		authz,
	}
}
