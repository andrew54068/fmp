import * as fcl from "@blocto/fcl";
import BigNumber from "bignumber.js";
import {
  useState,
  useContext,
  useCallback,
  useEffect,
  ChangeEvent,
} from "react";
import { GlobalContext } from "src/context/global";
import {
  Icon,
  Card,
  Text,
  Flex,
  Box,
  SimpleGrid,
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalHeader,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Input,
  InputGroup,
  InputRightAddon,
} from "@chakra-ui/react";
import { WarningIcon, SmallCloseIcon } from "@chakra-ui/icons";
import { Link } from "react-router-dom";
import Button from "src/components/Button";
import { InfoOutlineIcon } from "@chakra-ui/icons";
import InscriptionsCard from "src/components/InscriptionCard";
import { sendTransaction } from "src/services/fcl/send-transaction";
import { sendScript } from "src/services/fcl/send-script";
import {
  getBatchSellScripts,
  getPersonalAmountScripts,
  getPersonalDisplayModelScripts,
} from "src/utils/getScripts";
import { FLOW_SCAN_URL } from "src/constants";
import { fetchAllList } from "src/utils/fetchList";

type PersonalDisplayModel = {
  nftId: string;
  inscription: string;
  salePrice: BigNumber | null;
};

type ListingModel = {
  fields: [
    {
      name: "saleNFTID";
      value: string;
    },
    {
      name: "saleItemPrice";
      value: string;
    }
  ];
};

interface PersonalPanelProps {
  onUpdateAmount: (amount: BigNumber) => void;
  onLoading: (isLoading: boolean) => void;
}

export default function PersonalPanel({ onUpdateAmount, onLoading }: PersonalPanelProps) {
  const [waitingForTx, setWaitingForTx] = useState(false);
  const [sellPrice, setSellPrice] = useState(new BigNumber(0));
  const [inscriptions, setInscriptions] = useState<PersonalDisplayModel[]>([]);
  const [selectedInscriptions, setSelectedInscriptions] = useState<string[]>(
    []
  );
  const [priceSummary, setPriceSummary] = useState<BigNumber>(new BigNumber(0));
  const [errorMessage, setErrorMessage] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { account } = useContext(GlobalContext);
  const toast = useToast();
  const hasSelected: boolean = (selectedInscriptions.length ?? 0) > 0;

  useEffect(() => {
    console.log(`💥 account: ${JSON.stringify(account, null, "  ")}`);
    const updateList = async () => {
      if (!account) {
        setInscriptions([]);
        return;
      }
      onLoading(true);

      const totalAmount: number = await sendScript(
        getPersonalAmountScripts(),
        (arg, t) => [arg(account, t.Address)]
      );
      onUpdateAmount(BigNumber(totalAmount))

      const itemRequests = await fetchAllList(
        totalAmount,
        300,
        getPersonalDisplayModelScripts(),
        [
          {
            arg: account,
            getType: (t) => t.Address
          }
        ]
      );
      const inscriptionReqeuestResults = await Promise.all(itemRequests);
      const inscriptionResults = inscriptionReqeuestResults.flat();

      const displayModels: PersonalDisplayModel[] = inscriptionResults.map((value) => {
        return {
          nftId: value.nftId,
          inscription: value.inscription,
          salePrice: value.salePrice ? new BigNumber(value.salePrice) : null,
        };
      });
      console.log(
        `💥 personal displayModels length: ${JSON.stringify(
          displayModels.length,
          null,
          "  "
        )}`
      );
      displayModels.sort((a: PersonalDisplayModel, b: PersonalDisplayModel) => {
        const aSalePrice = new BigNumber(a.salePrice ?? "0");
        const bSalePrice = new BigNumber(b.salePrice ?? "0");
        if (aSalePrice.minus(bSalePrice).isGreaterThan(new BigNumber(0))) {
          return -1;
        }
        if (aSalePrice.minus(bSalePrice).isLessThan(new BigNumber(0))) {
          return 1;
        }
        return 0;
      });
      setInscriptions(displayModels.slice(0, 200));
      onLoading(false);
    };
    updateList();
  }, [account, onLoading]);

  const handleCardSelect = (inscription: PersonalDisplayModel) => {
    if (inscription.salePrice) return;
    if (!selectedInscriptions.includes(inscription.nftId)) {
      setSelectedInscriptions((prev) => [...prev, inscription.nftId]);
    } else {
      setSelectedInscriptions((prev) =>
        prev.filter((nftId) => nftId !== inscription.nftId)
      );
    }
  };

  const handleSellPriceChange = (event: ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    const bigNumberValue = new BigNumber(inputValue);
    if (inputValue && bigNumberValue) {
      setSellPrice(bigNumberValue);
      setPriceSummary(
        bigNumberValue.multipliedBy(new BigNumber(selectedInscriptions.length))
      );
    }
  };

  const resetSelectionInfo = () => {
    setSelectedInscriptions([]);
    setPriceSummary(new BigNumber(0));
  };

  const convertToListingModel = useCallback(
    (displayModels: PersonalDisplayModel[]): ListingModel[] => {
      return displayModels.map((model) => {
        let finalPriceValue = sellPrice.toString();
        if (!finalPriceValue.includes(".")) {
          finalPriceValue = finalPriceValue + ".0";
        }
        return {
          fields: [
            {
              name: "saleNFTID",
              value: model.nftId,
            },
            {
              name: "saleItemPrice",
              value: finalPriceValue,
            },
          ],
        };
      });
    },
    [sellPrice]
  );

  const handleBatchListing = useCallback(async () => {
    onClose();
    try {
      console.log(`💥 account: ${JSON.stringify(account, null, "  ")}`);
      if (!account) return;
      setWaitingForTx(true);
      const selectedDisplayModels: PersonalDisplayModel[] =
        selectedInscriptions.reduce(
          (pre: PersonalDisplayModel[], currentNFTId: string) => {
            const inscription = inscriptions.find(
              (inscription) => inscription.nftId == currentNFTId
            );
            if (inscription) {
              return [...pre, inscription];
            } else {
              return [...pre];
            }
          },
          []
        );
      const listingModels = convertToListingModel(selectedDisplayModels);

      console.log(
        `💥 listingModels: ${JSON.stringify(listingModels, null, "  ")}`
      );

      const txData = await sendTransaction(
        getBatchSellScripts(),
        (arg, types) => [
          arg(
            listingModels,
            types.Array(
              types.Struct("A.88dd257fcf26d3cc.ListingUtils.ListingModel", [
                { value: types.UInt64 },
                { value: types.UFix64 },
              ])
            )
          ),
        ]
      );

      resetSelectionInfo();

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
              Inscription Listed successfully!!
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
  }, [
    account,
    convertToListingModel,
    inscriptions,
    onClose,
    selectedInscriptions,
    toast,
  ]);

  const CallToActionButton = () => {
    return (
      <Box w={["100%", "auto"]}>
        <Button
          colorScheme="blue"
          onClick={() => {
            setErrorMessage("");
            if (account) {
              onOpen();
            } else {
              fcl.authenticate();
            }
          }}
          isLoading={waitingForTx}
          isDisabled={!!account && (selectedInscriptions.length ?? 0) == 0}
          width={["100%", "auto"]}
          bg="#01ef8b"
          _hover={{
            bg: "#01ef8b",
            transform: "scale(0.98)",
          }}
        >
          {account
            ? `List ${selectedInscriptions.length} Items`
            : "Connect Wallet"}
        </Button>
        {hasSelected && (
          <Button
            ml={["0", "space.m"]}
            mt={["space.s", "0"]}
            colorScheme="blue"
            onClick={() => {
              setErrorMessage("");
              resetSelectionInfo();
            }}
            isLoading={waitingForTx}
            width={["100%", "auto"]}
          >
            Cancel
          </Button>
        )}
        {errorMessage && (
          <Card p="16px" bg="red.200" mt="space.l">
            <Text color="red.500">{errorMessage}</Text>
          </Card>
        )}
      </Box>
    );
  };

  return (
    <Box p="16px">
      {account ? (
        <>
          <SimpleGrid columns={[1, 2, 3, 4]} spacing="space.l">
            {inscriptions.length > 0 ? (
              inscriptions.map((inscription, index) => (
                <Box key={index}>
                  <InscriptionsCard
                    inscriptionData={JSON.parse(inscription.inscription)}
                    selectable={!inscription.salePrice}
                    isSelected={
                      !inscription.salePrice &&
                      selectedInscriptions.includes(inscription.nftId)
                    }
                    onClick={() => handleCardSelect(inscription)}
                    price={inscription.salePrice}
                    cursor="pointer"
                  />
                </Box>
              ))
            ) : (
              <Text fontSize="size.heading.5" mb="space.l" lineHeight="22px">
                You don't have Inscription yet!
              </Text>
            )}
          </SimpleGrid>
        </>
      ) : (
        <Text fontSize="size.heading.5" mb="space.l" lineHeight="22px">
          Wallet not connected yet!
        </Text>
      )}
      <Box pos="fixed" bottom="0" left="0" right="0" width="100%" bg="gray.800">
        <Flex
          alignItems="center"
          justifyContent="space-between"
          p="space.m"
          maxWidth="820px"
          margin="0 auto"
          flexDirection={["column", "column", "row"]}
        >
          <Box mb={["16px", "16px", "0"]}>
            <Flex
              fontSize="size.body.2"
              mb="space.2xs"
              color="gray.400"
              alignItems="center"
            >
              <InfoOutlineIcon />
              <Box ml="space.3xs">You can list up to 100 items at a time.</Box>
            </Flex>
          </Box>
          <CallToActionButton />
        </Flex>
      </Box>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent p="10px" bg="gray.700" color="white">
          <ModalHeader>Batch Listing Inscription</ModalHeader>
          <ModalCloseButton m="10px" />
          <ModalBody>
            <Flex
              alignItems="center"
              direction="column"
              rowGap="20px"
              padding="20px"
              borderRadius="12px"
            >
              <InputGroup>
                <Input
                  placeholder={
                    sellPrice.isEqualTo(new BigNumber(0))
                      ? "Sell Price"
                      : sellPrice.toString()
                  }
                  onChange={handleSellPriceChange}
                ></Input>
                <InputRightAddon bg="gray.700">Flow</InputRightAddon>
              </InputGroup>
              <Text fontSize="size.heading.5" mb="space.l" lineHeight="22px">
                The price you typed will apply to all the inscriptions
              </Text>
              <Box fontSize="size.body.1">
                You are Listing {selectedInscriptions.length} items for{" "}
                {priceSummary.toString()} Flow
              </Box>
            </Flex>
          </ModalBody>

          <ModalFooter>
            <Flex
              w="100%"
              alignItems="center"
              columnGap="20px"
              borderRadius="12px"
            >
              <Button
                isDisabled={sellPrice.isEqualTo(new BigNumber(0))}
                onClick={handleBatchListing}
              >
                List
              </Button>
              <Button variant="plain">Cancel</Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
