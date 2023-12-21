import * as fcl from '@blocto/fcl'

export const sendScript = async <T = unknown>(
  script: string,
  args?: (arg: any, t: any) => any[]
): Promise<T> => {
  const result = await fcl.query({ cadence: script, args })
  return result
}
