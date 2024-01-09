import * as fcl from "@blocto/fcl";
import { ec as EC } from "elliptic";
import { SHA3 } from 'sha3'

const ec = new EC("secp256k1");

export const hashMsgHex = (msgHex: string) => {
  const sha = new SHA3(256);
  sha.update(Buffer.from(msgHex, "hex"));
  return sha.digest();
};

const signHashBufferWithKey = (privateKey: string, hashBuffer: Buffer) => {
  const key = ec.keyFromPrivate(Buffer.from(privateKey, "hex"));
  const sig = key.sign(hashBuffer);
  const n = 32; // half of signature length?
  const r = sig.r.toArrayLike(Buffer, "be", n);
  const s = sig.s.toArrayLike(Buffer, "be", n);
  return Buffer.concat([r, s]).toString("hex");
};

export const signWithKey = (privateKey: string, msgHex: string) =>
  signHashBufferWithKey(privateKey, hashMsgHex(msgHex));

export const signHashWithKey = (privateKey: string, msgHexHash: string) =>
  signHashBufferWithKey(privateKey, Buffer.from(msgHexHash, "hex"));

// Will be handled by fcl.user(addr).info()
const getAccount = async addr => {
  const { account } = await fcl.send([fcl.getAccount(addr)])
  return account
}

type Account = {
  role?: { proposer: string };
  signature?: string;
  roles?: any
}

export const generateKeyPair = (secret?: string | null) => {
  let keyPair
  if (secret) {
    keyPair = ec.keyFromPrivate(secret)
  } else {
    keyPair = ec.genKeyPair()
  }
  const keyPub = keyPair.getPublic();
  const pub1 = keyPub.encode('hex');
  const final = pub1.slice(2)
  const keyPri = keyPair.getPrivate('hex');
  console.log(`💥 final: ${JSON.stringify(final, null, '  ')}`);
  console.log(`💥 keyPri: ${JSON.stringify(keyPri, null, '  ')}`);
  return {
    privateKey: keyPri,
    publicKey: final
  }
}

export const getAuthorization = (address: string, privateKey: string) => async (account: Account = {}) => {
  const user = await getAccount(address)
  const key = user.keys[0]

  let sequenceNum
  if (account.role && account.role.proposer) sequenceNum = key.sequenceNumber

  const signingFunction = async data => {
    return {
      addr: user.address,
      keyId: key.index,
      signature: signWithKey(privateKey, data.message),
    }
  }

  return {
    ...account,
    addr: user.address,
    keyId: key.index,
    sequenceNum,
    signature: account.signature || null,
    signingFunction,
    resolve: null,
    roles: account.roles,
  }
}