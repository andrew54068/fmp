import { Metadata } from 'src/types'

export default function sortMetaDataById(arr: Metadata[]): Metadata[] {
  return arr.sort((a, b) => parseInt(a.id, 10) - parseInt(b.id, 10));
} 