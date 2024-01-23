import React, { useContext, useEffect, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalFooter,
  Button as ChakraButton,
  Box,
  VStack,
  HStack,
  Image,
  Flex,
  Text,
  Progress,
  useToast,
  Icon,
} from "@chakra-ui/react";
import Button from "src/components/Button";
import ModalBanner from "src/assets/fomopolyModalBanner.png";
import TokenInput from "./TokenInput";
import InfoBlock from "./InfoBlock";
//@todo: update burn icon
import BurnIcon from "src/assets/burn.svg?react";
import BigNumber from "bignumber.js";
import useFomopolyContract, {
  BurningInfo,
} from "src/hooks/useFomopolyContract";
import { sendScript } from "src/services/fcl/send-script";
import { GlobalContext } from "src/context/global";
import { getPersonalAmountScripts } from "src/utils/getScripts";
import { Link } from "react-router-dom";
import { FLOW_SCAN_URL } from "src/constants";
import { WarningIcon, SmallCloseIcon } from "@chakra-ui/icons";

interface ModalProps {
  isModalOpen: boolean;
  onCloseModal: () => void;
}

const BurningModal = ({ isModalOpen, onCloseModal }: ModalProps) => {
  const [ffAmount, setFfAmount] = useState<BigNumber | null>(null);
  const [inputInvalid, setInputInvalid] = useState(false);
  const [holdingAmount, setHoldingAmount] = useState<number>(0);
  const [loadingForReceivingFMP, setLoadingForReceivingFMP] = useState(false);
  const [FMPAmountReceived, setFMPAmountReceived] = useState<BigNumber | null>(
    null
  );
  const [burningInfo, setBurningInfo] = useState<BurningInfo | null>(null);
  const [sendingTx, setSendingTx] = useState(false);

  const toast = useToast()
  const { account } = useContext(GlobalContext);

  const { fetchBurningInfo, burnInscription } = useFomopolyContract();

  const tokenIssueRatio =
    burningInfo?.currentIssued.dividedBy(burningInfo.totalSupply) ??
    BigNumber(0);
  const tokenIssuePercentage = tokenIssueRatio.multipliedBy(BigNumber(100));

  useEffect(() => {
    if (!account) return;
    const fetchInscriptionAmount = async () => {
      const inscriptionBalance: string = await sendScript(
        getPersonalAmountScripts(),
        (arg, t) => [arg(account, t.Address)]
      );
      setHoldingAmount(+inscriptionBalance);
    };
    fetchInscriptionAmount();
  }, [account]);

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    if (inputValue) {
      const bigValue = BigNumber(inputValue);
      if (!bigValue.isNaN()) {
        setFfAmount(bigValue);
        setLoadingForReceivingFMP(true);

        const burningInfoResult = await fetchBurningInfo();
        setBurningInfo(burningInfoResult);
        setLoadingForReceivingFMP(false);
        if (bigValue.isGreaterThan(BigNumber(holdingAmount))) {
          setInputInvalid(true);
          setFMPAmountReceived(null);
        } else {
          setInputInvalid(false);
          setFMPAmountReceived(bigValue.dividedBy(burningInfoResult.divisor));
        }
      } else {
        setFfAmount(null);
        setFMPAmountReceived(null);
      }
    } else {
      setFfAmount(null);
      setFMPAmountReceived(null);
    }
  };

  const onClickBurn = async () => {
    if (
      ffAmount &&
      ffAmount.isInteger() &&
      ffAmount.isGreaterThan(BigNumber(0))
    ) {
      setSendingTx(true);
      try {
        await burnInscription(ffAmount.toNumber());
      } catch (err: any) {
        toast({
          status: "error",
          position: "top",
          duration: null,
          isClosable: true,
          containerStyle: {
            marginTop: "20px",
          },
          render: () => (
            <Flex
              alignItems="center"
              bg="red.300"
              color="white"
              padding="20px"
              borderRadius="12px"
            >
              <Link
                to={FLOW_SCAN_URL + err.hash}
                target="_blank"
                style={{ textDecoration: "underline" }}
              >
                <Icon as={WarningIcon} mr="8px" />
                {err.origin}
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
      }
      setSendingTx(false);
    }
  };

  return (
    <>
      <Modal isOpen={isModalOpen} onClose={onCloseModal}>
        <ModalOverlay />
        <ModalContent
          bgColor="slate.600"
          borderRadius="30px"
          padding="24px"
          maxWidth="591px"
          width="100%"
          minHeight="709px"
          mt="5%"
          mx="16px"
        >
          <Box position="relative" paddingBottom="30%" mb="30px">
            <Box
              position="absolute"
              top="50%"
              left="50%"
              overflow="hidden"
              transform="translate(-50%,-50%)"
              w="100%"
            >
              <Image src={ModalBanner} width="100%" />
            </Box>
          </Box>

          <ModalBody>
            <VStack spacing="30px" alignItems="center">
              <Flex
                width="100%"
                justifyContent="space-between"
                flexDirection={["column", "row"]}
                alignItems="center"
                gap="16px"
              >
                <TokenInput
                  borderColor={inputInvalid ? "red.300" : "neutral.400"}
                  label="Burn"
                  tokenName="$FF"
                  value={ffAmount ? ffAmount.toString() : ""}
                  onChange={handleChange}
                  balance={holdingAmount}
                />
                <Flex
                  position="relative"
                  display="inline-flex"
                  h={["20px", "128px"]}
                  justifyContent="center"
                  alignItems="center"
                  width="100%"
                >
                  <Box
                    pos="absolute"
                    left="50%"
                    top="60%"
                    transform="translate(-50%,-50%)"
                  >
                    <BurnIcon width="20px" height="20px" />
                  </Box>
                </Flex>
                <TokenInput
                  isLoading={loadingForReceivingFMP}
                  label="Receive"
                  tokenName="$FMP"
                  value={FMPAmountReceived ? FMPAmountReceived.toString() : ""}
                  borderColor="neutral.700"
                />
              </Flex>
              {/* // Detail  */}

              <InfoBlock>
                <HStack justifyContent="space-between" alignItems="center">
                  <Box>You're paying</Box>
                  <Box>{`${ffAmount || 0.0} $FF`}</Box>
                </HStack>
              </InfoBlock>
              <InfoBlock label="Earned">
                <HStack justifyContent="space-between">
                  {burningInfo && ffAmount && (
                    <Box>
                      {ffAmount.dividedBy(burningInfo.divisor).toString()}
                    </Box>
                  )}
                  <Box
                    borderRadius="8px"
                    border="1px solid"
                    borderColor="primary"
                    p="4px 8px"
                  >
                    0.0{" "}
                    <Box as="span" color="primary">
                      {" "}
                      $FMP{" "}
                    </Box>
                  </Box>
                </HStack>
              </InfoBlock>
              <InfoBlock>
                <Flex justify="space-between" alignItems="center">
                  <Text fontSize="sm">Token distributed</Text>
                  <Text fontSize="sm">{tokenIssuePercentage.toString()}%</Text>
                </Flex>
                <Progress
                  value={tokenIssuePercentage.toNumber()}
                  size="sm"
                  colorScheme="monopolyEarnProgress"
                  my="12px"
                  height="16px"
                  borderRadius="24px"
                />
              </InfoBlock>
            </VStack>
          </ModalBody>

          <ModalFooter boxShadow="  ">
            <HStack
              width="full"
              justifyContent="space-between"
              flexDirection={["column-reverse", "row"]}
              gap="16px"
            >
              <ChakraButton
                width={["100%"]}
                color="neutral.50"
                border="1px solid"
                borderColor="neutral.50"
                variant="outline"
                onClick={onCloseModal}
              >
                Cancel
              </ChakraButton>
              <Button
                isDisabled={loadingForReceivingFMP || inputInvalid}
                isLoading={sendingTx || loadingForReceivingFMP}
                minW={[0, "65%", "370px"]}
                width={["100%", "370px"]}
                onClick={onClickBurn}
              >
                Burn for $FMP
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default BurningModal;
