import { useState, useCallback, useEffect } from 'react';
import useInterval from './useInterval';
import * as fcl from "@blocto/fcl";
import { LISTING_EVENT_NAME, LATEST_BLOCK_HEIGHT_KEY, FLOW_SCAN_URL } from 'src/constants'
import { useToast, Box, Flex } from '@chakra-ui/react'
import { Link } from "react-router-dom";

export default function useRealTimeListingEvent({ footerPosition }: {
  footerPosition: {
    bottom: number;
    left: number;
  }
}) {

  const [realTimeListingEvent, setRealTimeListingEvent] = useState<any[]>([])
  const toast = useToast()

  const getRealTimeListingEvent = useCallback(async () => {
    const prevLatestBlockHeight = localStorage.getItem(LATEST_BLOCK_HEIGHT_KEY)
    const { height: latestBlockHeight } = await fcl
      .send([
        fcl.getBlock(true), // isSealed = true
      ])
      .then(fcl.decode);


    if (!latestBlockHeight) return
    if (`${prevLatestBlockHeight}` === `${latestBlockHeight}`) return

    localStorage.setItem(LATEST_BLOCK_HEIGHT_KEY, latestBlockHeight);
    const latestListingEvents = await fcl
      .send([
        fcl.getEventsAtBlockHeightRange(LISTING_EVENT_NAME, prevLatestBlockHeight || latestBlockHeight, latestBlockHeight),
      ]).then(fcl.decode)

    const blockEventMap: Record<string, any[]> = {}

    console.log(`💥 latestListingEvent: ${JSON.stringify(latestListingEvents, null, '  ')}`);
    if (Array.isArray(latestListingEvents) && latestListingEvents.length > 0) {
      const filteredEvents = latestListingEvents
        .filter(event => event.data.nftType.typeID === "A.88dd257fcf26d3cc.Inscription.NFT" && event.data.purchased)
      filteredEvents.forEach(event => {
        blockEventMap[event.transactionId] = blockEventMap[event.transactionId] ? [...blockEventMap[event.transactionId], event] : [event]
      })
      if (filteredEvents.length > 0) {
        setRealTimeListingEvent(Object.values(blockEventMap))
      }
    }

  }, [])

  useInterval(() => {
    getRealTimeListingEvent()
  }, 3000)


  useEffect(() => {
    getRealTimeListingEvent()
  }, [getRealTimeListingEvent])

  useEffect(() => {
    if (realTimeListingEvent.length > 0) {
      for (const [index, events] of realTimeListingEvent.entries()) {
        // show toast  
        toast({
          position: 'bottom-left',
          duration: 10 * 1000,
          containerStyle: {
            position: 'fixed',
            bottom: `${footerPosition.bottom + 50 * index}px`,
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

