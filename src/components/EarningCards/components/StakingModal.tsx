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
  useToast,
  Icon,
  Text,
  Progress,
} from "@chakra-ui/react";
import Button from "src/components/Button";
import ModalBanner from "src/assets/fomopolyModalBanner.png";
import TokenInput from "./TokenInput";
import InfoBlock from "./InfoBlock";
import BigNumber from "bignumber.js";
import useFomopolyContract, {
  StakingInfo,
} from "src/hooks/useFomopolyContract";
import { GlobalContext } from "src/context/global";
import { FLOW_SCAN_URL } from "src/constants";
import { Link } from "react-router-dom";
import { SmallCloseIcon, WarningIcon } from "@chakra-ui/icons";
import {
  getBalanceScript,
  getPersonalAmountScripts,
} from "src/utils/getScripts";
import { sendScript } from "src/services/fcl/send-script";

type PersonalStakingScoreInfo = {
  startTime: string;
  endTime: string;
  divisor: BigNumber;
  minedSupply: BigNumber;
  totalScore: BigNumber;
  currentScore: BigNumber;
  predictedScore?: BigNumber;
};

type AssetsBalance = {
  flowBalance: BigNumber;
  inscriptionAmount: number;
};

interface ModalProps {
  isModalOpen: boolean;
  onCloseModal: () => void;
}

const StakingModal = ({ isModalOpen, onCloseModal }: ModalProps) => {
  const [ffAmount, setFfAmount] = useState<BigNumber | null>(null);
  const [loadingForAssetsAmount, setLoadingForAssetsAmount] = useState(false);
  const [flowAmountNeeded, setFlowAmountNeeded] = useState<BigNumber | null>(
    null
  );
  const [flowInsufficient, setFlowInsufficient] = useState(false);
  const [inscriptionInsufficient, setInscriptionInsufficient] = useState(false);
  const [holdingAmount, setHoldingAmount] = useState<AssetsBalance>({
    flowBalance: BigNumber(0),
    inscriptionAmount: 0,
  });
  const [personalStakingInfo, setPersonalStakingInfo] =
    useState<PersonalStakingScoreInfo | null>(null);
  const [sendingTx, setSendingTx] = useState(false);

  const toast = useToast();
  const { account } = useContext(GlobalContext);

  const currentScorePercentage = (): string => {
    if (personalStakingInfo) {
      if (personalStakingInfo.totalScore.isEqualTo(BigNumber(0))) {
        return "0";
      }
      const value = personalStakingInfo.currentScore
        .dividedBy(BigNumber(personalStakingInfo.totalScore))
        .multipliedBy(BigNumber(100));
      if (value.isNaN()) {
        return "";
      } else {
        return value.toString();
      }
    }
    return "";
  };
  const nextScorePercentage = (): string => {
    if (personalStakingInfo && personalStakingInfo.predictedScore) {
      if (personalStakingInfo.totalScore.isEqualTo(BigNumber(0))) {
        return "100";
      }
      const value = personalStakingInfo.predictedScore
        .dividedBy(personalStakingInfo.totalScore)
        .multipliedBy(BigNumber(100));
      if (value.isNaN()) {
        return "";
      } else {
        return value.toString();
      }
    }
    return "";
  };

  const progressPercentage = (): BigNumber => {
    if (personalStakingInfo) {
      const currentTime: number = Math.max(
        +personalStakingInfo.startTime,
        Math.floor(new Date().getTime() / 1000)
      );
      return BigNumber(currentTime)
        .minus(BigNumber(personalStakingInfo.startTime))
        .dividedBy(
          BigNumber(personalStakingInfo.endTime).minus(
            BigNumber(personalStakingInfo.startTime)
          )
        )
        .multipliedBy(BigNumber(100));
    }
    return BigNumber(0);
  };

  const estimateFMP = (): BigNumber => {
    if (personalStakingInfo) {
      const predictedScore = personalStakingInfo.predictedScore ?? BigNumber(0);
      const personalTotal =
        personalStakingInfo.currentScore.plus(predictedScore);
      const globalTotal = personalStakingInfo.totalScore.plus(predictedScore);
      if (globalTotal.isEqualTo(BigNumber(0))) {
        return BigNumber(0);
      }
      return personalStakingInfo.minedSupply.multipliedBy(
        personalTotal.dividedBy(globalTotal)
      );
    }
    return BigNumber(0);
  };

  const {
    fetchStakingInfo,
    fetchCurrentScoreInfo,
    fetchPredictedScore,
    stakeInscription,
  } = useFomopolyContract();

  useEffect(() => {
    if (!account) return;
    fetchStakingData(account);
  }, [account]);

  const fetchInscriptionAmount = async () => {
    const inscriptionBalance: string = await sendScript(
      getPersonalAmountScripts(),
      (arg, t) => [arg(account, t.Address)]
    );
    const flowBalance: string = await sendScript(
      getBalanceScript(),
      (arg, t) => [arg(account, t.Address)]
    );

    setHoldingAmount({
      flowBalance: BigNumber(flowBalance),
      inscriptionAmount: +inscriptionBalance,
    });
  };

  const fetchStakingData = async (account: string): Promise<StakingInfo> => {
    setLoadingForAssetsAmount(true);
    const stakingInfoResult = await fetchStakingInfo();
    const [totalScore, calculateScore] = await fetchCurrentScoreInfo(
      account,
      stakingInfoResult.endTime
    );
    setPersonalStakingInfo({
      ...stakingInfoResult,
      totalScore,
      currentScore: calculateScore,
    });
    await fetchInscriptionAmount();
    setLoadingForAssetsAmount(false);
    return stakingInfoResult;
  };

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!account || !personalStakingInfo) return;
    const inputValue = event.target.value;
    if (inputValue) {
      const bigValue = BigNumber(inputValue);
      if (bigValue.isInteger() && bigValue.isGreaterThan(BigNumber(0))) {
        setFfAmount(bigValue);
        setLoadingForAssetsAmount(true);
        const predictedScore = await fetchPredictedScore(
          account,
          bigValue.toNumber(),
          BigNumber(personalStakingInfo.endTime).toString()
        );
        setPersonalStakingInfo({
          ...personalStakingInfo,
          predictedScore,
        });
        setLoadingForAssetsAmount(false);
        const flowAmountNeeded = bigValue.dividedBy(
          personalStakingInfo.divisor
        );
        setFlowAmountNeeded(flowAmountNeeded);
        setInscriptionInsufficient(
          bigValue.isGreaterThan(BigNumber(holdingAmount.inscriptionAmount))
        );
        setFlowInsufficient(
          holdingAmount.flowBalance.isLessThan(flowAmountNeeded)
        );
      } else {
        setFfAmount(null);
        setPersonalStakingInfo((pre) => {
          if (pre) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { predictedScore, ...rest } = pre;
            return rest;
          }
          return pre;
        });
      }
    } else {
      setFfAmount(null);
      setPersonalStakingInfo((pre) => {
        if (pre) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { predictedScore, ...rest } = pre;
          return rest;
        }
        return pre;
      });
    }
  };

  const onClickStake = async () => {
    if (
      ffAmount &&
      ffAmount.isInteger() &&
      ffAmount.isGreaterThan(BigNumber(0))
    ) {
      try {
        const txData = await stakeInscription(ffAmount.toNumber());
        // const burnSucceedEvent = txData.events
        // .find((event) => {
        //   return event.type === BURN_SUCCEED_EVENT;
        // })
        // TODO: check event
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
                to={FLOW_SCAN_URL + txData.hash}
                target="_blank"
                style={{ textDecoration: "underline" }}
              >
                <Icon as={WarningIcon} mr="8px" />
                You've successfully staked {ffAmount.toString()} FF inscriptions
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
            <VStack spacing="30px">
              <Flex
                width="100%"
                justifyContent="space-between"
                flexDirection={["column", "row"]}
                gap="16px"
              >
                <TokenInput
                  borderColor={inscriptionInsufficient ? "red.300" : "neutral.400"}
                  isDisabled={!account}
                  label="Stake"
                  tokenName="$FF"
                  value={ffAmount ? ffAmount.toString() : ""}
                  onChange={handleChange}
                  balance={holdingAmount.inscriptionAmount}
                />
                <TokenInput
                  borderColor={flowInsufficient ? "red.300" : "neutral.700"}
                  isLoading={loadingForAssetsAmount}
                  label="Paying"
                  tokenName="$Flow"
                  value={flowAmountNeeded ? flowAmountNeeded.toString() : ""}
                  balance={holdingAmount.flowBalance.toNumber()}
                />
              </Flex>
              {/* // Detail  */}

              <InfoBlock label="Detail">
                <HStack justifyContent="space-between" mb="12px">
                  <Box>Paying</Box>
                  <Box>{`${flowAmountNeeded || 0.0} $Flow`}</Box>
                </HStack>
                <HStack justifyContent="space-between" mb="12px">
                  <Box>Staking</Box>
                  <Box>{`${ffAmount || 0.0} $FF`}</Box>
                </HStack>
                <HStack justifyContent="space-between">
                  <Box>Pool Share</Box>
                  <Box>
                    {currentScorePercentage()} %
                    {nextScorePercentage() != ""
                      ? "-> " + nextScorePercentage() + " %"
                      : ""}
                  </Box>
                </HStack>
              </InfoBlock>

              <InfoBlock label="Estimate">
                <HStack justifyContent="space-between">
                  <Box>{estimateFMP().toString()}</Box>
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
                  <Text fontSize="sm">Staking Progress</Text>
                  <Text fontSize="sm">{progressPercentage().toString()}%</Text>
                </Flex>
                <Progress
                  value={progressPercentage().toNumber()}
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
                isDisabled={loadingForAssetsAmount || inscriptionInsufficient || flowInsufficient || !ffAmount}
                isLoading={sendingTx || loadingForAssetsAmount}
                minW={[0, "65%", "370px"]}
                width={["100%", "370px"]}
                onClick={onClickStake}
              >
                Stake for $FMP
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default StakingModal;
