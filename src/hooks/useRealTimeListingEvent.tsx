import { useState, useCallback, useEffect } from 'react';
import useInterval from './useInterval';
import * as fcl from "@blocto/fcl";
import convertTimestampToLocalHHmm from 'src/utils/convertTimestampToLocalHHmm';
import { LISTING_EVENT_NAME, FLOW_SCAN_URL } from 'src/constants'
import { useToast, Box, Flex } from '@chakra-ui/react'
import { Link } from "react-router-dom";

type Event = any;


export default function useRealTimeListingEvent({ footerPosition }: {
  footerPosition: {
    bottom: number;
    left: number;
  }
}) {

  const [prevBlockHeight, setPrevBlockHeight] = useState<number>(0)
  const [realTimeListingEvent, setRealTimeListingEvent] = useState<any[]>([])

  const toast = useToast()



  const getListingEventByRange = useCallback(async (fromBlockHeight: number, toBlockHeight: number) => {
    const listingEvents = await fcl
      .send([
        fcl.getEventsAtBlockHeightRange(
          LISTING_EVENT_NAME,
          fromBlockHeight,
          toBlockHeight
        ),
      ]).then(fcl.decode)

    const blockEventMap: Record<string, any[]> = {}

    console.log(`💥 listingEvents: ${JSON.stringify(listingEvents, null, '  ')}`);
    if (Array.isArray(listingEvents) && listingEvents.length > 0) {
      const filteredEvents = listingEvents
        .filter(event => event.data.nftType.typeID === "A.88dd257fcf26d3cc.Inscription.NFT" && event.data.purchased)
      filteredEvents.forEach(event => {
        blockEventMap[event.transactionId] = blockEventMap[event.transactionId] ? [...blockEventMap[event.transactionId], event] : [event]
      })
      if (filteredEvents.length > 0) {
        return Object.values(blockEventMap)
      }
    }
  }, [])


  const getLatestEvent = useCallback(async (prevBlockHeight: number) => {

    const { height: latestBlockHeight } = await fcl
      .send([
        fcl.getBlock(true), // isSealed = true
      ])
      .then(fcl.decode);

    if (!prevBlockHeight || !latestBlockHeight) return

    const latestListingEvent = await getListingEventByRange(prevBlockHeight, latestBlockHeight);
    if (Array.isArray(latestListingEvent) && latestListingEvent.length > 0) {
      return latestListingEvent
    }

    setPrevBlockHeight(latestBlockHeight)

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
    const recentEvents: Event[] = [];
    const maxAttempt = 10;

    while (recentEvents.length < 10 && attempt < maxAttempt) {
      const latestListingEvent = await getListingEventByRange(fromBlock, toBlock);
      if (Array.isArray(latestListingEvent) && latestListingEvent.length > 0) {
        recentEvents.push(...latestListingEvent);
      }
      if (recentEvents.length >= 10) {
        break;
      }
      fromBlock -= 249;
      toBlock = fromBlock;
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
    const latestEvent = getLatestEvent(prevBlockHeight)
    if (Array.isArray(latestEvent) && latestEvent.length > 0) {
      setRealTimeListingEvent(latestEvent)
    }
  }, 3000)

  useEffect(() => {
    if (realTimeListingEvent.length > 0) {
      for (const [, events] of realTimeListingEvent.entries()) {
        const blockTimeStamp = events[0].blockTimestamp

        // show toast  
        toast({
          position: 'bottom-left',
          duration: 10 * 1000,
          containerStyle: {
            position: 'relative',
            bottom: `${footerPosition.bottom}px`,
            left: `${footerPosition.left}px`,
          },
          render: () => (
            <Flex>
              <Box color='gray.500' p={2} bg='gray.800' borderRadius="4px">
                <Link
                  to={FLOW_SCAN_URL + (events[0].transactionId as string)}
                  target="_blank"
                  style={{ textDecoration: "underline" }}
                >
                  Someone just bought {Array.isArray(events) ? events.length : 1} FF inscription
                  <br /> at {" "}
                  {convertTimestampToLocalHHmm(blockTimeStamp)}{" "}!
                </Link>
              </Box>
            </Flex>
          ),
        })
      }
      setRealTimeListingEvent([])
    }
  }, [footerPosition.bottom, footerPosition.left, realTimeListingEvent, toast])
}

