interface EventData {
  id?: string;
  to?: string;
  [key: string]: any; // Additional properties, if any
}

interface Event {
  type: string;
  data: EventData;
  [key: string]: any; // Additional properties, if any
}

interface Transaction {
  events: Event[];
  [key: string]: any; // Additional properties of the transaction
}

export default function getMintedId(transaction: Transaction): string | undefined {
  const mintEvent = transaction.events.find(event => event.type.includes('Inscription.Deposit'));
  return mintEvent?.data.id;
}
