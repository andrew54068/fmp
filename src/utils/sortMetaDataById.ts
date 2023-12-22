import { Metadata } from 'src/types'

export default function sortMetaDataById(arr: Metadata[]): Metadata[] {
  return arr.sort((a, b) => parseInt(b.id, 10) - parseInt(a.id, 10));
} 