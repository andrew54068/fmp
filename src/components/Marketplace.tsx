import {
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Flex,
} from "@chakra-ui/react";
import ListingPanel from "src/components/ListingPanel";
import PersonalPanel from "./PersonalPanel";
import { useEffect, useState } from "react";
import { sendScript } from "src/services/fcl/send-script";
import { getBalanceScript } from "src/utils/getScripts";
import BigNumber from "bignumber.js";

export default function Marketplace() {
  const [flowBalance, setFlowBalance] = useState("");

  useEffect(() => {
    const fetchRoyaltyFeeBalance = async () => {
      const balance: string = await sendScript(getBalanceScript(), (arg, t) => [
        arg("0x81bfc5cc7d1e0c74", t.Address),
      ]);
      const value = new BigNumber(balance).multipliedBy(BigNumber(40));
      setFlowBalance(value.toString());
    };

    const refreshTradingVolume = setInterval(function () {
      fetchRoyaltyFeeBalance();
    }, 5000);
    return () => clearInterval(refreshTradingVolume);
  }, []);

  return (
    <Box
      bg="gray.700"
      mt="75px"
      minH="calc(100vh - 75px)"
      padding="16px"
      pb="172px"
      pt="60px"
    >
      <Flex
        p="20px"
        borderRadius="md"
        bg="white"
        margin="20px 0px"
        fontSize="size.heading.3"
        color="gray.700"
      >
        Total Trading Volume: {flowBalance} Flow
      </Flex>
      <Tabs colorScheme="whiteAlpha" variant="marketplace">
        <TabList>
          <Tab>Listing</Tab>
          <Tab>My Items</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <ListingPanel />
          </TabPanel>
          <TabPanel>
            <PersonalPanel />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}
