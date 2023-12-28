export interface Metadata {
  id: string;
  uuid: string;
  inscription: string;
  [key: string]: any;
}

export interface ListingMetadata extends Metadata {
  price?: string;
}