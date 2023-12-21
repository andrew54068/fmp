import * as fcl from '@blocto/fcl'

export class TransactionError extends Error {
  name = 'TransactionError'
  hash?: string
  origin: unknown

  constructor(origin: unknown, hash?: string) {
    super()
    this.origin = origin
    this.hash = hash

    if (typeof origin === 'string') {
      this.message = origin
    } else if (origin instanceof Error || (typeof origin === 'object' && 'message' in (origin as any))) {
      this.message = (origin as any).message
    }
  }
}

export const sendTransaction = async (
  script: string,
  args?: (arg: any, t: any) => any[],
  limit = 9999
): Promise<Transaction> => {
  let txId
  let transaction
  try {
    txId = await fcl.mutate({
      cadence: script,
      args,
      limit,
    })
  } catch (error) {
    throw new TransactionError(error)
  }

  try {
    transaction = await fcl.tx(txId).onceSealed()
  } catch (error) {
    throw new TransactionError(error, txId)
  }

  return {
    hash: txId,
    ...transaction,
  }
}

export type TransactionEvent<T = any> = {
  type: string
  transactionIndex: number
  transactionId: string
  eventIndex: number
  data: T
}

export type Transaction<
  TEvents extends TransactionEvent[] = TransactionEvent[]
> = {
  hash: string
  status: number
  statusCode: number
  statusString: string
  errorMessage: string
  blockId: string
  events: TEvents
}
