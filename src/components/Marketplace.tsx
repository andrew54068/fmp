import {
  Box,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Flex,
  Spinner,
} from "@chakra-ui/react";
import ListingPanel from "src/components/ListingPanel";
import PersonalPanel from "./PersonalPanel";
import { useEffect, useState } from "react";
import { sendScript } from "src/services/fcl/send-script";
import { getBalanceScript } from "src/utils/getScripts";
import BigNumber from "bignumber.js";
import InfoBlock from "./InfoBlock";

export default function Marketplace() {
  const [flowBalance, setFlowBalance] = useState("");
  const [listingLoading, setListingLoading] = useState(true);
  const [personalItemLoading, setPersonalItemLoading] = useState(false);
  const [personalInsccriptionAmount, setPersonalInsccriptionAmount] =
    useState<BigNumber | null>(null);
  const [listingAmount, setListingAmount] = useState<BigNumber | null>(null);

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
        margin="20px 0px"
        fontSize="size.heading.3"
        color="gray.700"
      >
        <Flex
          p="20px"
          w="100%"
          borderRadius="md"
          margin="20px 0px"
          fontSize="size.heading.3"
          color="gray.700"
          columnGap="20px"
        >
          <InfoBlock
            statistic={`${flowBalance} Flow`}
            desc="Total Trading Volume"
          ></InfoBlock>
          <InfoBlock statistic={`20000+`} desc="Total Holders"></InfoBlock>
        </Flex>
      </Flex>
      <Tabs colorScheme="whiteAlpha" variant="marketplace">
        <TabList>
          <Tab pr="5px">
            <Text m="10px">
              Listing Items{listingAmount ? ` ${listingAmount}` : ""}
            </Text>
            {listingLoading && (
              <Spinner m="0px 10px" size="md" color="#01ef8b" thickness='3px'/>
            )}
          </Tab>
          <Tab>
            <Text m="10px">
              My Items
              {personalInsccriptionAmount
                ? ` ${personalInsccriptionAmount}`
                : ""}
            </Text>
            {personalItemLoading && (
              <Spinner m="0px 10px" size="md" color="#01ef8b" thickness='3px'/>
            )}
          </Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <ListingPanel
              onUpdateAmount={setListingAmount}
              onLoading={setListingLoading}
            />
          </TabPanel>
          <TabPanel>
            <PersonalPanel
              onUpdateAmount={setPersonalInsccriptionAmount}
              onLoading={setPersonalItemLoading}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}
