import {
  Box,
  Text,
  Tabs,
  TabList,
  TabPanels,
  TabPanel,
  Flex,
  Spinner,
} from "@chakra-ui/react";
import CustomTab from "./Tab";
import ListingPanel from "src/components/ListingPanel";
import PersonalPanel from "./PersonalPanel";
import { useEffect, useState, useContext } from "react";
import { GlobalContext } from "src/context/global";
import { sendScript } from "src/services/fcl/send-script";
import { getBalanceScript } from "src/utils/getScripts";
import BigNumber from "bignumber.js";
import InfoBlock from "./InfoBlock";
import { ROYALTY_ADDRESS } from "src/constants";
import PurchaseBoard from './PurchaseBoard';

export default function Marketplace() {
  const { account } = useContext(GlobalContext);
  const [flowBalance, setFlowBalance] = useState("");
  const [listingLoading, setListingLoading] = useState(true);
  const [personalItemLoading, setPersonalItemLoading] = useState(false);
  const [personalInsccriptionAmount, setPersonalInscriptionAmount] =
    useState<BigNumber | null>(null);
  const [listingAmount, setListingAmount] = useState<BigNumber | null>(null);

  useEffect(() => {
    const fetchRoyaltyFeeBalance = async () => {
      const balance: string = await sendScript(getBalanceScript(), (arg, t) => [
        arg(ROYALTY_ADDRESS, t.Address),
      ]);
      const value = new BigNumber(balance).multipliedBy(BigNumber(40));
      setFlowBalance(value.toString());
    };

    const refreshTradingVolume = setInterval(function () {
      fetchRoyaltyFeeBalance();
    }, 5000);
    return () => clearInterval(refreshTradingVolume);
  }, []);

  useEffect(() => {
    if (!account) {
      setPersonalInscriptionAmount(null);
    }
  }, [setPersonalInscriptionAmount, account]);


  return (
    <Box
      mt="75px"
      minH="calc(100vh - 75px)"
      padding="16px"
      pb="172px"
      pt="60px"
    >
      <Flex
        borderRadius="md"
        margin="20px 0px"
        fontSize="size.heading.3"
        color="gray.700"
      >
        <Flex
          w="100%"
          flexDir={["column", "column", "row"]}
          borderRadius="md"
          color="gray.700"
          gap="12px"
          columnGap="20px"
          mb={["0", "0", "56px"]}
        >
          <InfoBlock
            statistic={`${flowBalance} Flow`}
            desc="Total Trading Volume"
          ></InfoBlock>
          <InfoBlock statistic={`21915`} desc="Total Holders"></InfoBlock>
        </Flex>
      </Flex>
      <Flex flexDir={["column-reverse", "column-reverse", "row"]} mx="auto">
        <Tabs colorScheme="whiteAlpha" variant="marketplace" flex="1" >
          <TabList gap="24px" mb="24px">
            <CustomTab>
              <Text m="10px">
                Listing Items{listingAmount ? ` ${listingAmount}` : ""}
              </Text>
              {listingLoading && (
                <Spinner m="0px 10px" size="sm" color="primary" thickness='3px' />
              )}
            </CustomTab>
            <CustomTab >
              <Text m="8px">
                My Items
                {personalInsccriptionAmount
                  ? ` ${personalInsccriptionAmount}`
                  : ""}
              </Text>
              {personalItemLoading && (
                <Spinner m="0px 10px" size="sm" color="primary" thickness='3px' />
              )}
            </CustomTab>
          </TabList>

          <TabPanels borderRadius="20px" borderColor="primary" >
            <TabPanel borderRadius="20px" >
              <ListingPanel
                onUpdateAmount={setListingAmount}
                onLoading={setListingLoading}
              />
            </TabPanel>
            <TabPanel borderRadius="20px" >
              <PersonalPanel
                onUpdateAmount={setPersonalInscriptionAmount}
                onLoading={setPersonalItemLoading}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
        <PurchaseBoard />
      </Flex>
    </Box >
  );
}
