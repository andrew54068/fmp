import { useState, useCallback, useEffect } from 'react';
import useInterval from './useInterval';
import * as fcl from "@blocto/fcl";
import { LISTING_EVENT_NAME } from 'src/constants'

type EventData = {
  listingResourceID: string;
  storefrontResourceID: string;
  purchased: boolean;
  nftType: any; // Replace 'any' with a more specific type if you have the structure
  nftID: string;
};

export type BlockEvent = {
  blockHeight: number;
  blockId: string;
  blockTimestamp: string;
  data: EventData;
  eventIndex: number;
  transactionId: string;
  transactionIndex: number;
  type: string;
};


export default function useRealTimeListingEvent() {

  const [prevBlockHeight, setPrevBlockHeight] = useState<number>(0)
  const [realTimeListingEvent, setRealTimeListingEvent] = useState<BlockEvent[][]>([])

  const getListingEventByRange = useCallback(async (fromBlockHeight: number, toBlockHeight: number) => {
    const blockEventMap: Record<string, BlockEvent[]> = {}
    let startBlockHeight = fromBlockHeight
    let endBlockHeight = Math.min(startBlockHeight + 249, toBlockHeight)

    while (startBlockHeight < toBlockHeight) {
      const listingEvents = await fcl
        .send([
          fcl.getEventsAtBlockHeightRange(
            LISTING_EVENT_NAME,
            startBlockHeight,
            endBlockHeight
          ),
        ]).then(fcl.decode)
      if (Array.isArray(listingEvents) && listingEvents.length > 0) {
        const filteredEvents = listingEvents
          .filter(event => event.data.nftType.typeID === "A.88dd257fcf26d3cc.Inscription.NFT" && event.data.purchased)
        filteredEvents.forEach(event => {
          blockEventMap[event.transactionId] = blockEventMap[event.transactionId] ? [...blockEventMap[event.transactionId], event] : [event]
        })
      }

      startBlockHeight = endBlockHeight + 1
      endBlockHeight = Math.min(startBlockHeight + 249, toBlockHeight)
    }

    if (Object.keys(blockEventMap).length > 0) {
      return Object.values(blockEventMap)
    }

  }, [])


  const getLatestEvent = useCallback(async (prevBlockHeight: number) => {

    const { height: latestBlockHeight } = await fcl
      .send([
        fcl.getBlock(true), // isSealed = true
      ])
      .then(fcl.decode);

    if (!prevBlockHeight || !latestBlockHeight) return

    setPrevBlockHeight(latestBlockHeight)

    const latestListingEvent: undefined | BlockEvent[][] = await getListingEventByRange(prevBlockHeight, latestBlockHeight);
    if (latestListingEvent && latestListingEvent.length > 0) {
      return latestListingEvent
    }


  }, [getListingEventByRange])



  const getLatestTenEvent = useCallback(async () => {
    const { height: latestBlockHeight } = await fcl
      .send([
        fcl.getBlock(true), // isSealed = true
      ])
      .then(fcl.decode);

    if (!latestBlockHeight) return

    let fromBlock = latestBlockHeight - 249;
    let toBlock = latestBlockHeight;
    let attempt = 0
    const recentEvents: BlockEvent[][] = [];
    const maxAttempt = 30;

    while (recentEvents.length < 10 && attempt < maxAttempt) {
      const latestListingEvent = await getListingEventByRange(fromBlock, toBlock);
      if (Array.isArray(latestListingEvent) && latestListingEvent.length > 0) {
        recentEvents.push(...latestListingEvent);
      }
      if (recentEvents.length >= 10) {
        break;
      }
      toBlock = fromBlock - 1;
      fromBlock -= 249;
      attempt += 1
    }

    const latestEventsAfterInitChecking = await getLatestEvent(latestBlockHeight)

    setRealTimeListingEvent(latestEventsAfterInitChecking ?
      [...recentEvents.slice(0, 10), ...latestEventsAfterInitChecking] :
      recentEvents.slice(0, 10));
  }, [getLatestEvent, getListingEventByRange])


  useEffect(() => {
    getLatestTenEvent()
  }, [getLatestTenEvent])


  useInterval(() => {
    if (!prevBlockHeight) return
    getLatestEvent(prevBlockHeight).then(
      (latestEvent: undefined | BlockEvent[][]) => {
        if (latestEvent && latestEvent.length > 0) {
          setRealTimeListingEvent(latestEvent)
        }
      }
    )

  }, 3000)

  return {
    realTimeListingEvent,
    setRealTimeListingEvent
  }
}

