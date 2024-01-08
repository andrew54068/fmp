import { useState, useCallback, useEffect } from 'react';
import useInterval from './useInterval';
import * as fcl from "@blocto/fcl";
import { LISTING_EVENT_NAME, FLOW_SCAN_URL } from 'src/constants'
import { useToast, Box, Flex } from '@chakra-ui/react'
import { Link } from "react-router-dom";

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

  const getLatestTenEvent = useCallback(async () => {
    const { height: latestBlockHeight } = await fcl
      .send([
        fcl.getBlock(true), // isSealed = true
      ])
      .then(fcl.decode);


    if (!latestBlockHeight) return
    if (`${prevBlockHeight}` === `${latestBlockHeight}`) return

    setPrevBlockHeight(latestBlockHeight)

    const fromBlock = latestBlockHeight
    const toBlock = latestBlockHeight - 250

    // while (realTimeListingEvent.length < 10) {
    const latestListingEvent = await getListingEventByRange(fromBlock, toBlock)
    if (Array.isArray(latestListingEvent) && latestListingEvent.length > 0) {
      setRealTimeListingEvent(latestListingEvent)
    }
    // }
  }, [getListingEventByRange, prevBlockHeight])

  useEffect(() => {
    getLatestTenEvent()
  }, [getLatestTenEvent])

  // useInterval(() => {
  // getLatestTenEvent()
  // }, 3000)




  useEffect(() => {
    if (realTimeListingEvent.length > 0) {
      for (const [index, events] of realTimeListingEvent.entries()) {
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
                  Someone just bought {events.length} FF inscription!
                </Link>
              </Box>
            </Flex>
          ),
        })
      }
    }
  }, [footerPosition.bottom, footerPosition.left, realTimeListingEvent, toast])
}

