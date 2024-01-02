import BigNumber from "bignumber.js";
import { useState, useContext, useCallback, useEffect } from 'react';
import { GlobalContext } from 'src/context/global'
import { Icon, Card, Text, Flex, Box, SimpleGrid, useToast } from '@chakra-ui/react';
import { WarningIcon, SmallCloseIcon } from "@chakra-ui/icons";
import { Link } from "react-router-dom";
import Button from 'src/components/Button'
import { InfoOutlineIcon } from '@chakra-ui/icons'
import InscriptionsCard from 'src/components/InscriptionCard';
import { sendTransaction } from 'src/services/fcl/send-transaction';
import { sendScript } from 'src/services/fcl/send-script';
import { getBatchPurchaseScripts, getMarketListingItemScripts } from 'src/utils/getScripts'
import { FLOW_SCAN_URL } from 'src/constants'

type InscriptionDisplayModel = {
  listingId: string;
  nftId: string;
  inscription: string;
  seller: string;
  salePrice: BigNumber;
  timestamp: string;
};

type PurchaseModel = {
  fields: [
    {
      name: "listingResourceID",
      value: string,
    },
    {
      name: "storefrontAddress",
      value: string,
    },
    {
      name: "buyPrice",
      value: string,
    },
  ],
};

export default function ListingPanel() {
  const [waitingForTx, setWaitingForTx] = useState(false);
  const [inscriptions, setInscriptions] = useState<InscriptionDisplayModel[]>([]);
  const [selectedInscriptions, setSelectedInscriptions] = useState<string[]>([]);
  const [priceSummary, setPriceSummary] = useState<BigNumber>(new BigNumber(0));
  const [errorMessage, setErrorMessage] = useState('');
  const { account } = useContext(GlobalContext);
  const toast = useToast();
  const hasSelected: boolean = (selectedInscriptions.length ?? 0) > 0;

  useEffect(() => {
    const updateList = async () => {
      const results: any[] = await sendScript(getMarketListingItemScripts())
      const displayModels: InscriptionDisplayModel[] = results.map((value) => {
        return {
          listingId: value.listingId,
          nftId: value.nftId,
          inscription: value.inscription,
          seller: value.seller,
          salePrice: new BigNumber(value.salePrice),
          timestamp: value.timestamp,
        }
      });
      console.log(`💥 displayModels.length: ${JSON.stringify(displayModels.length, null, '  ')}`);
      displayModels.sort((a: InscriptionDisplayModel, b: InscriptionDisplayModel) => {
        const aSalePrice = new BigNumber(a.salePrice)
        const bSalePrice = new BigNumber(b.salePrice)
        if (aSalePrice.minus(bSalePrice).isGreaterThan(new BigNumber(0))) {
          return 1;
        }
        if (aSalePrice.minus(bSalePrice).isLessThan(new BigNumber(0))) {
          return -1;
        }
        return 0;
      })
      setInscriptions(displayModels);
    };
    updateList();
  }, [account, waitingForTx, setInscriptions])

  const handleCardSelect = (inscription: InscriptionDisplayModel) => {
    const salePrice: BigNumber = inscription.salePrice;
    if (!selectedInscriptions.includes(inscription.nftId)) {
      setSelectedInscriptions((prev) => [
        ... prev,
        inscription.nftId]);
      // Add price to summary
      if (inscription.salePrice) {
        setPriceSummary((prev) => prev.plus(salePrice));
      }
    } else {
      setSelectedInscriptions(
        (prev) => prev.filter((nftId) => nftId !== inscription.nftId));
      // Remove price from summary
      if (inscription.salePrice) {
        setPriceSummary((prev) => prev.minus(salePrice));
      }
    }
  };

  const handleCancel = () => {
    setSelectedInscriptions([]);
    setPriceSummary(BigNumber(0));
  };

  const convertToPurchaseModel = (displayModels: InscriptionDisplayModel[]): PurchaseModel[] => {
    return displayModels.map((model) => {
      return {
        fields: [
          {
            name: "listingResourceID",
            value: model.listingId,
          },
          {
            name: "storefrontAddress",
            value: model.seller,
          },
          {
            name: "buyPrice",
            value: model.salePrice.toString(),
          },
        ],
      }
    })
  }

  const handleSendTransaction = useCallback(async () => {
    try {
      console.log(`💥 account: ${JSON.stringify(account, null, '  ')}`);
      if (!account) return;
      setWaitingForTx(true);
      const selectedDisplayModels: InscriptionDisplayModel[] = selectedInscriptions.reduce((pre: InscriptionDisplayModel[], currentNFTId: string) => {
        const inscription = inscriptions.find((inscription) => inscription.nftId == currentNFTId)
        if (inscription) {
          return [...pre, inscription]
        } else {
          return [...pre]
        }
      }, [])
      const purchaseModels = convertToPurchaseModel(selectedDisplayModels)

      console.log(`💥 purchaseModels: ${JSON.stringify(purchaseModels, null, '  ')}`);

      const txData = await sendTransaction(
        getBatchPurchaseScripts(),
        (arg, types) => [
          arg(
            purchaseModels,
            types.Array(
              types.Struct("A.88dd257fcf26d3cc.ListingUtils.PurchaseModel", [
                { value: types.UInt64 },
                { value: types.Address },
                { value: types.UFix64 },
              ])
            )
          ),
        ]
      );

      console.log("txData :", txData);

      toast({
        status: "success",
        position: "top",
        duration: null,
        isClosable: true,
        containerStyle: {
          marginTop: "20px",
        },
        render: () => (
          <Flex
            alignItems="center"
            bg="green.500"
            color="white"
            padding="20px"
            borderRadius="12px"
          >
            <Link
              to={FLOW_SCAN_URL + txData.hash}
              target="_blank"
              style={{ textDecoration: "underline" }}
            >
              <Icon as={WarningIcon} mr="8px" />
              Inscription minted successfully!!
            </Link>
            <Box
              onClick={() => toast.closeAll()}
              ml="8px"
              cursor="pointer"
              p="4px"
            >
              <SmallCloseIcon />
            </Box>
          </Flex>
        ),
      });
    } catch (err: any) {
      setErrorMessage(err.message);
    }
    setWaitingForTx(false);
  }, [account]);

  const CallToActionButton = () => {
    return <Box w={["100%", "auto"]}>
      <Button
        colorScheme="blue"
        onClick={handleSendTransaction}
        isLoading={waitingForTx}
        isDisabled={(selectedInscriptions.length ?? 0) == 0}
        width={["100%", "auto"]}
        bg="#01ef8b"
        _hover={{
          bg: "#01ef8b",
          transform: "scale(0.98)"
        }}
      >
        Buy {selectedInscriptions.length} Items
      </Button>
      {
        hasSelected && <Button
        ml={["0", 'space.m']}
        mt={["space.s", "0"]}
        colorScheme="blue"
        onClick={handleCancel}
        isLoading={waitingForTx}
        width={["100%", "auto"]}
      >
        Cancel
      </Button>
      }
      {
        errorMessage && <Card p="16px" bg="red.200" mt="space.l">
          <Text color="red.500">{errorMessage}</Text>
        </Card>
      }
    </Box >
  }

  return (
    <Box p="16px">
      <SimpleGrid columns={[1, 2, 3, 4]} spacing="space.l">
        {inscriptions.map((inscription, index) => (

          <Box key={index}>
            <InscriptionsCard
              inscriptionData={JSON.parse(inscription.inscription)}
              selectable
              isSelected={selectedInscriptions.includes(inscription.nftId)}
              onClick={() => handleCardSelect(inscription)}
              price={inscription.salePrice}
              cursor="pointer"
            />

          </Box>
        ))}
      </SimpleGrid>

      <Box pos="fixed"
        bottom="0"
        left="0"
        right="0"
        width="100%"
        bg="gray.800"
      >
        <Flex
          alignItems="center"
          justifyContent="space-between"
          p="space.m"
          maxWidth="820px"
          margin="0 auto"
          flexDirection={["column", "column", "row"]}>
            <Box mb={["16px", "16px", "0"]}>
                <Flex fontSize="size.body.2" mb="space.2xs" color="gray.400" alignItems="center">
                  <InfoOutlineIcon />
                  <Box ml="space.3xs">
                    You can buy up to 100 items at a time.
                  </Box>
                </Flex>
                {
                  <Box fontSize="size.body.1">
                    You are buying {selectedInscriptions.length} items for {priceSummary.toString()} Flow
                  </Box>
                }
            </Box>
            <CallToActionButton />
        </Flex>
      </Box>
    </Box >
  );
}
