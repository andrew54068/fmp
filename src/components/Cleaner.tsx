import BigNumber from "bignumber.js";
import { useState, useCallback } from "react";
import { Card, Text, Flex, Box } from "@chakra-ui/react";
import Button from "src/components/Button";
import { sendScript } from "src/services/fcl/send-script";
import {
  getCheckListingIdExistScript,
  getCleanNotListedItemsScript,
  getMarketListingAmountScripts,
  getMarketListingItemScripts,
} from "src/utils/getScripts";
import { fetchAllList } from "src/utils/fetchList";
import { sendTransactionWithLocalWallet } from "src/services/fcl/send-transaction";
import { MARKETPLACE_BLACKLIST_ADD_EVENT } from "src/constants";

type InscriptionDisplayModel = {
  listingId: string;
  nftId: string;
  salePrice: BigNumber;
};

const ADDRESS = import.meta.env.VITE_APP_CLEANER_ADDRESS;
const PRIVATE_KEY = import.meta.env.VITE_APP_CLEANER_PRIVATE_KEY;

export default function Cleaner() {
  const [waitingForTx, setWaitingForTx] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");

  const handleClean = useCallback(async () => {
    setWaitingForTx(true);
    try {
      const totalListingAmount: number = await sendScript(
        getMarketListingAmountScripts()
      );
      const itemRequests = await fetchAllList(
        totalListingAmount,
        1000,
        getMarketListingItemScripts(),
        []
      );

      const inscriptionReqeuestResults = await Promise.all(itemRequests);
      const inscriptionResults = inscriptionReqeuestResults.flat();

      const displayModels: InscriptionDisplayModel[] = inscriptionResults.map(
        (value) => {
          return {
            listingId: value.listingId,
            nftId: value.nftId,
            seller: value.seller,
            salePrice: new BigNumber(value.salePrice),
            timestamp: value.timestamp,
          };
        }
      );
      setMessage(pre => pre + `listing displayModels length: ${displayModels.length}\n`)
      // console.log(
      //   `💥 listing displayModels length: ${JSON.stringify(
      //     displayModels.length,
      //     null,
      //     "  "
      //   )}`
      // );
      displayModels.sort(
        (a: InscriptionDisplayModel, b: InscriptionDisplayModel) => {
          const aSalePrice = new BigNumber(a.salePrice);
          const bSalePrice = new BigNumber(b.salePrice);
          if (aSalePrice.minus(bSalePrice).isGreaterThan(new BigNumber(0))) {
            return 1;
          }
          if (aSalePrice.minus(bSalePrice).isLessThan(new BigNumber(0))) {
            return -1;
          }
          return 0;
        }
      );
      const listingIds = displayModels.map((value) => value.listingId);
      const totalAmount = listingIds.length;
      const limit = 100;
      let startOffset = 0;
      let endOffset = Math.min(startOffset + limit - 1, totalAmount);
      
      while (startOffset + 1 < totalAmount) {
        setMessage(
          (pre) => pre + "\nSending transactions...\n"
        );
        console.log(`💥 startOffset: ${JSON.stringify(startOffset, null, '  ')}`);
        console.log(`💥 endOffset: ${JSON.stringify(endOffset, null, '  ')}`);
        const txData = await sendTransactionWithLocalWallet(
          ADDRESS,
          PRIVATE_KEY,
          getCleanNotListedItemsScript(),
          (arg, types) => [
            arg(
              listingIds.slice(startOffset, endOffset + 1),
              types.Array(types.UInt64)
            ),
          ]
        );
        console.log(`💥 txData: ${JSON.stringify(txData, null, '  ')}`);
        const successRemovedListingIds = txData.events
          .filter((event) => {
            return (
              event.type === MARKETPLACE_BLACKLIST_ADD_EVENT
            );
          })
          .map((event) => event.data.listingId);
        setMessage(
          (pre) =>
            pre +
            `\ntx id: ${txData.hash}\n\nListing ids:\n` +
            successRemovedListingIds.join("\n") +
            "\nHas been added to blacklist."
        );
        // check whether id exist still
        const firstRemovedId = successRemovedListingIds[0]
        if (firstRemovedId) {
          const exist = await sendScript(getCheckListingIdExistScript(), (arg, t) => [
            arg(firstRemovedId, t.UInt64)
          ])
          if (exist) {
            setMessage((pre) => pre + `\n 🥵 ${firstRemovedId} exist: ${exist}`);
          } else {
            setMessage((pre) => pre + `\n 👍 ${firstRemovedId} exist: ${exist}`);
          }
        }
        startOffset = Math.min(endOffset + 1, totalAmount);
        endOffset = Math.min(startOffset + limit - 1, totalAmount);
      }

      

      setMessage((pre) => pre + "\n✅ All clean!");
    } catch (err: any) {
      setErrorMessage(err.message);
      throw err;
    }
    setWaitingForTx(false);
  }, []);

  return (
    <Box bg="gray.700" mt="75px" minH="calc(100vh - 75px)" p="16px">
      <Flex
        height="80vh"
        alignItems="center"
        justifyContent="space-between"
        p="space.m"
        margin="0 auto"
      >
        <Flex
          direction="column"
          alignItems="center"
          // justifyContent="space-between"
          justifyContent="start"
          p="space.m"
          maxWidth="820px"
          margin="0 auto"
        >
          <Button
            ml={["0", "space.m"]}
            mt={["space.s", "0"]}
            colorScheme="blue"
            onClick={() => {
              setErrorMessage("");
              setMessage("");
              handleClean();
            }}
            isLoading={waitingForTx}
            width={["100%", "auto"]}
          >
            Clean
          </Button>
          {errorMessage && (
            <Card p="16px" bg="red.200" mt="space.l" maxW="90%" overflowY="auto">
              <Text color="red.500" whiteSpace="pre-line">{errorMessage}</Text>
            </Card>
          )}
        </Flex>
        <Card w="50%" h="90%" p="16px" bg="gray.300" mt="space.l" overflowY="auto">
          <Text color="red.500" whiteSpace="pre-line">{message}</Text>
        </Card>
      </Flex>
    </Box>
  );
}
