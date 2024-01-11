import { useState, useEffect } from 'react';
import useRealTimeListingEvent, { BlockEvent } from 'src/hooks/useRealTimeListingEvent';
import convertTimestampToLocalTime from 'src/utils/convertTimestampToLocalTime';
import { Box, Card } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { motion } from 'framer-motion';
import { FLOW_SCAN_URL } from 'src/constants'
import BigNumber from 'bignumber.js';


export default function PurchaseBoard() {
  const { realTimeListingEvent } = useRealTimeListingEvent();
  const [displayedEventsMap, setDisplayedEventsMap] = useState<Record<string, BlockEvent[]>>({})
  console.log('displayedEventsMap :', displayedEventsMap);


  console.log('realTimeListingEvent :', realTimeListingEvent);

  useEffect(() => {
    realTimeListingEvent.forEach((events: BlockEvent[]) => {
      const transactionId = events[0].transactionId
      if (!displayedEventsMap[transactionId]) {
        setDisplayedEventsMap({
          ...displayedEventsMap,
          [transactionId]: events
        })
      }
    })
  }, [displayedEventsMap, realTimeListingEvent])

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (<Box
    p="16px"
    mb="16px"
    ml={["0px", "0px", "16px"]}
    mt={["0px", "0px", "58px"]}
    overflow="scroll"
    borderRadius="8px"
    width={["100%", "100%", "200px"]}
    maxHeight={["400px", "500px"]}
    boxShadow="inset 10px -8px 102px -40px rgba(0,0,0,0.7)" >
    {
      Object.values(displayedEventsMap).sort((a, b) => {
        return BigNumber(b[0].blockHeight).minus(BigNumber(a[0].blockHeight)).toNumber()
      }).map((events: BlockEvent[], index) => {
        const blockTimeStamp = events[0].blockTimestamp
        return (
          <motion.div
            key={index}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card key={index} p="8px" bg="white" color="gray.500" mb="8px">
              <Link
                to={FLOW_SCAN_URL + (events[0].transactionId as string)}
                target="_blank"
                style={{ textDecoration: "underline" }}
              >
                Someone just bought {Array.isArray(events) ? events.length : 1} FF inscription
                <br /> at {" "}
                {convertTimestampToLocalTime(blockTimeStamp)}{" "}!
              </Link>
            </Card>
          </motion.div>
        )
      })
    }
  </Box >)
} 