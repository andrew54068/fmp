import * as fcl from "@blocto/fcl";
import BigNumber from "bignumber.js";
import {
  useState,
  useContext,
  useCallback,
  useEffect,
  useRef,
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
  Modal,
  ModalContent,
  ModalFooter,
  ModalBody,
  InputGroup,
  InputRightAddon,
  Input,
  ModalCloseButton,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import { WarningIcon, SmallCloseIcon } from "@chakra-ui/icons";
import { Link } from "react-router-dom";
import Button from "src/components/Button";
import { InfoOutlineIcon } from "@chakra-ui/icons";
import InscriptionsCard from "src/components/InscriptionCard";
import { sendTransaction } from "src/services/fcl/send-transaction";
import { sendScript } from "src/services/fcl/send-script";
import {
  getBalanceScript,
  getBatchPurchaseScripts,
  getMarketListingAmountScripts,
  getMarketListingItemScripts,
} from "src/utils/getScripts";
import { FLOW_SCAN_URL, PURCHASE_MODEL_TYPE, PURCHASE_SUCCEED_EVENT } from "src/constants";
import { logSweepingButton, logSweeping } from "src/services/Amplitude/log";
import { fetchAllList } from "src/utils/fetchList";
import { FooterContext } from "src/context/marketplaceContext";
import { convertToPurchaseModel } from "src/utils/convertToPurchaseModel";

export type InscriptionDisplayModel = {
  listingId: string;
  nftId: string;
  inscription: string;
  seller: string;
  salePrice: BigNumber;
  timestamp: string;
};

export type PurchaseModel = {
  fields: [
    {
      name: "listingResourceID";
      value: string;
    },
    {
      name: "storefrontAddress";
      value: string;
    },
    {
      name: "buyPrice";
      value: string;
    }
  ];
};

interface ListingPanelProps {
  onUpdateAmount: (amount: BigNumber) => void;
  onLoading: (isLoading: boolean) => void;
}

export default function ListingPanel({
  onUpdateAmount,
  onLoading,
}: ListingPanelProps) {
  const footerRef = useRef<HTMLDivElement>(null);
  const { setFooterPosition } = useContext(FooterContext);

  const [waitingForTx, setWaitingForTx] = useState(false);
  const [flowBalance, setFlowBalance] = useState("");
  const [inscriptions, setInscriptions] = useState<InscriptionDisplayModel[]>(
    []
  );
  const [skipAmount, setSkipAmount] = useState<number>(0);
  const [selectedInscriptions, setSelectedInscriptions] = useState<string[]>(
    []
  );
  const [priceSummary, setPriceSummary] = useState<BigNumber>(new BigNumber(0));
  const [errorMessage, setErrorMessage] = useState("");
  const [showSweepErrorMessage, setShowSweepErrorMessage] = useState(false);
  const { account } = useContext(GlobalContext);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const hasSelected: boolean = (selectedInscriptions.length ?? 0) > 0;

  const updateFlowBalance = useCallback(async () => {
    if (account) {
      const balance: string = await sendScript(getBalanceScript(), (arg, t) => [
        arg(account, t.Address),
      ]);
      setFlowBalance(balance);
    }
  }, [account]);

  const updateList = useCallback(async () => {
    onLoading(true);
    updateFlowBalance();
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
    onUpdateAmount(BigNumber(inscriptionResults.length));

    const displayModels: InscriptionDisplayModel[] = inscriptionResults.map(
      (value) => {
        return {
          listingId: value.listingId,
          nftId: value.nftId,
          inscription: value.inscription,
          seller: value.seller,
          salePrice: new BigNumber(value.salePrice),
          timestamp: value.timestamp,
        };
      }
    );
    console.log(
      `💥 listing displayModels length: ${JSON.stringify(
        displayModels.length,
        null,
        "  "
      )}`
    );
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
    setInscriptions(displayModels.slice(0, 1000));
    onLoading(false);
  }, [onLoading, updateFlowBalance, onUpdateAmount]);

  useEffect(() => {
    updateList();
  }, [account, waitingForTx, setInscriptions, flowBalance, updateList]);

  // get footer position for showing toast
  useEffect(() => {
    if (footerRef.current) {
      const rect = footerRef.current.getBoundingClientRect();
      setFooterPosition({
        bottom: window.innerHeight - rect.top,
        left: rect.left,
      });
    }
  }, [setFooterPosition]);

  const handleCardSelect = (inscription: InscriptionDisplayModel) => {
    const salePrice: BigNumber = inscription.salePrice;
    console.log(
      `💥 selected inscription: ${JSON.stringify(inscription, null, "  ")}`
    );
    if (!selectedInscriptions.includes(inscription.nftId)) {
      setSelectedInscriptions((prev) => [...prev, inscription.nftId]);
      // Add price to summary
      if (inscription.salePrice) {
        setPriceSummary((prev) => prev.plus(salePrice));
      }
    } else {
      setSelectedInscriptions((prev) =>
        prev.filter((nftId) => nftId !== inscription.nftId)
      );
      // Remove price from summary
      if (inscription.salePrice) {
        setPriceSummary((prev) => prev.minus(salePrice));
      }
    }
  };

  const resetSelectionInfo = () => {
    setSelectedInscriptions([]);
    setPriceSummary(BigNumber(0));
    setSkipAmount(0);
    setShowSweepErrorMessage(false);
  };

  const handleSkipAmountChange = (event: ChangeEvent<HTMLInputElement>) => {
    setShowSweepErrorMessage(false);
    const inputValue = event.target.value;
    const bigNumberValue = BigNumber(inputValue);
    if (inputValue && bigNumberValue) {
      setSkipAmount(Math.floor(bigNumberValue.toNumber()));
    }
  };

  const handleSweepAmountChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setShowSweepErrorMessage(false);
      const inputValue = event.target.value;
      const bigNumberValue = BigNumber(inputValue);
      if (inputValue && bigNumberValue) {
        if (bigNumberValue.isGreaterThan(BigNumber(20))) {
          setShowSweepErrorMessage(true);
          return;
        }
        const selectedInscriptions = inscriptions.slice(
          skipAmount || 0,
          bigNumberValue.toNumber()
        );
        setSelectedInscriptions(
          selectedInscriptions.map((value) => value.nftId)
        );
        const sum = selectedInscriptions.reduce(
          (pre: BigNumber, current: InscriptionDisplayModel) => {
            return pre.plus(current.salePrice);
          },
          BigNumber(0)
        );
        setPriceSummary(sum);
      }
    },
    [skipAmount, inscriptions]
  );

  const handleSendTransaction = useCallback(async () => {
    try {
      if (!account) return;
      setWaitingForTx(true);
      const selectedDisplayModels: InscriptionDisplayModel[] =
        selectedInscriptions.reduce(
          (pre: InscriptionDisplayModel[], currentNFTId: string) => {
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
      const purchaseModels = convertToPurchaseModel(selectedDisplayModels);

      console.log(
        `💥 purchaseModels: ${JSON.stringify(purchaseModels, null, "  ")}`
      );

      const txData = await sendTransaction(
        getBatchPurchaseScripts(),
        (arg, types) => [
          arg(
            purchaseModels,
            types.Array(
              types.Struct(PURCHASE_MODEL_TYPE, [
                { value: types.UInt64 },
                { value: types.Address },
                { value: types.UFix64 },
              ])
            )
          ),
        ]
      );

      const successListingId = txData.events
        .filter((event) => {
          return (
            event.type === PURCHASE_SUCCEED_EVENT
          );
        })
        .map((event) => event.data.listingResourceID);

      const successAmount = successListingId.length;
      const failedAmount = selectedInscriptions.length - successAmount;

      console.log("txData :", txData);

      resetSelectionInfo();

      const status = successAmount > 0 ? "success" : "info";
      let displayMessage: string = "";
      if (successAmount == selectedInscriptions.length) {
        displayMessage = `You successfully bought ${successAmount} items`;
      } else if (successAmount > 0) {
        displayMessage = `You successfully bought ${successAmount} items, but the other ${failedAmount} were swept by others.`;
      } else {
        displayMessage = `All the selected items were brought before you. Good luck next time!`;
      }

      toast({
        status,
        position: "top",
        duration: null,
        isClosable: true,
        containerStyle: {
          marginTop: "20px",
        },
        render: () => (
          <Flex
            alignItems="center"
            bg={successAmount > 0 ? "green.500" : "yellow.500"}
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
              {displayMessage}
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
  }, [account, inscriptions, selectedInscriptions, toast]);

  const CallToActionButton = () => {
    return (
      <Box display="flex" columnGap="10px" w={["100%", "auto"]}>
        <Button
          onClick={() => {
            logSweepingButton();
            onOpen();
          }}
          width="auto"
          bg="#01ef8b"
          _hover={{
            bg: "#01ef8b",
            transform: "scale(0.98)",
          }}
          fontSize={window.innerWidth > 500 ? "size.heading.5" : "size.body.3"}
        >
          Sweep
        </Button>
        <Button
          onClick={() => {
            setErrorMessage("");
            if (account) {
              handleSendTransaction();
            } else {
              fcl.authenticate();
            }
          }}
          isLoading={waitingForTx}
          isDisabled={!!account && (selectedInscriptions.length ?? 0) == 0}
          width="auto"
          bg="#01ef8b"
          _hover={{
            bg: "#01ef8b",
            transform: "scale(0.98)",
          }}
          fontSize={window.innerWidth > 500 ? "size.heading.5" : "size.body.3"}
        >
          <Text>
            {account
              ? `Buy ${selectedInscriptions.length} Items`
              : "Connect Wallet"}
          </Text>
        </Button>
        {hasSelected && (
          <Button
            onClick={() => {
              setErrorMessage("");
              resetSelectionInfo();
            }}
            isLoading={waitingForTx}
            width="auto"
            fontSize={window.innerWidth > 500 ? "size.heading.5" : "size.body.3"}
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

      <Box
        ref={footerRef}
        pos="fixed"
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
              <Box ml="space.3xs">You can buy up to 20 items at a time.</Box>
            </Flex>
            <Box fontSize="size.body.1">
              You are buying {selectedInscriptions.length} items for{" "}
              {priceSummary.toString()} Flow
            </Box>
          </Box>
          <Flex
            direction="column"
            rowGap="10px"
            fontSize="size.body.2"
            mb="space.2xs"
            alignItems="center"
          >
            <CallToActionButton />
            <Box ml="space.3xs">Your Flow balance: {flowBalance}</Box>
          </Flex>
        </Flex>
      </Box>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent p="10px" bg="gray.700" color="white">
          <ModalHeader>Sweep</ModalHeader>
          <ModalCloseButton m="10px" onClick={resetSelectionInfo} />
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
                  isInvalid={showSweepErrorMessage}
                  errorBorderColor="red.300"
                  placeholder={"Skip how many?"}
                  onChange={handleSkipAmountChange}
                ></Input>
                <InputRightAddon bg="gray.700">Skipped</InputRightAddon>
              </InputGroup>
              <InputGroup>
                <Input
                  isInvalid={showSweepErrorMessage}
                  errorBorderColor="red.300"
                  placeholder={"How many do you want?"}
                  onChange={handleSweepAmountChange}
                ></Input>
                <InputRightAddon bg="gray.700">Amount</InputRightAddon>
              </InputGroup>
              <Box fontSize="size.body.1">
                You are sweeping {selectedInscriptions.length} items for{" "}
                {priceSummary.toString()} Flow
              </Box>
              {showSweepErrorMessage && (
                <Box color="red" fontSize="size.body.5">
                  If you sweep more than 20 items the transaction might exceeds
                  computation limit (9999)
                </Box>
              )}
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
                isDisabled={!account || showSweepErrorMessage}
                onClick={() => {
                  setErrorMessage("");
                  if (account) {
                    handleSendTransaction();
                    onClose();
                    logSweeping(selectedInscriptions.length.toString());
                  } else {
                    fcl.authenticate();
                  }
                }}
              >
                {account ? "Sweep" : "Connect Wallet"}
              </Button>
              <Button
                variant="plain"
                onClick={() => {
                  onClose();
                  resetSelectionInfo();
                }}
              >
                Cancel
              </Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
