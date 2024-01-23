import BigNumber from "bignumber.js";
import {
  useState,
  useContext,
  useCallback,
  ChangeEvent,
  useEffect,
  useRef,
} from "react";
import { GlobalContext } from "src/context/global";
import { Card, Text, Flex, Box, Input, Select } from "@chakra-ui/react";
import Button from "src/components/Button";
import { sendScript } from "src/services/fcl/send-script";
import {
  getBalanceScript,
  getBatchPurchaseScripts,
  getCreateAccountAndDepositScript,
  getInscriptionIdsScript,
  getMarketListingAmountScripts,
  getMarketListingItemScripts,
  getTransferFlowScript,
  getTransferInscriptionAndFlowScript,
} from "src/utils/getScripts";
import { fetchAllList } from "src/utils/fetchList";
import {
  sendTransaction,
  sendTransactionWithLocalWallet,
} from "src/services/fcl/send-transaction";
import { convertToPurchaseModel } from "src/utils/convertToPurchaseModel";
import { InscriptionDisplayModel } from "./ListingPanel";
import { generateKeyPair } from "src/services/flow-local-wallet/local-wallet";
import {
  ACCOUNT_CREATED_EVENT,
  FLOW_DEPOSIT_EVENT,
  INSCRIPTION_DEPOSIT_EVENT,
  PURCHASE_MODEL_TYPE,
  PURCHASE_SUCCEED_EVENT,
  SWEEP_BOT_INFO,
  purchaseLimit,
} from "src/constants";
import { InfoOutlineIcon } from "@chakra-ui/icons";
import {
  logAutoSweepDeposit,
  logAutoSweepWithdraw,
  logAutoSweepingPurchase,
  logCreateBot,
} from "src/services/Amplitude";

type BotInfo = {
  account: string;
  privateKey: string;
};

enum SelectType {
  Amount = "Amount",
  Price = "Price",
}

const setStoredSweepBotInfo = (account: string, privateKey: string) => {
  const jsonString = JSON.stringify({
    account,
    privateKey,
  });
  localStorage.setItem(SWEEP_BOT_INFO, jsonString);
};

export default function AutoSweepBot() {
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [selectType, setSelectType] = useState(SelectType.Amount);
  const [waitingForTx, setWaitingForTx] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [waitingForCreate, setWaitingForCreate] = useState(false);
  const [botAccount, setBotAccount] = useState<string | null>(null);
  const [botAccountFlowBalance, setBotAccountFlowBalance] = useState(
    BigNumber(0)
  );
  const [isFlowBalanceEnough, setIsFlowBalanceEnough] = useState(false);
  const [isBotFlowBalanceEnough, setIsBotFlowBalanceEnough] = useState(false);
  const [priceSummary, setPriceSummary] = useState<BigNumber>(BigNumber(0));
  const [displayModels, setDisplayModels] = useState<InscriptionDisplayModel[]>(
    []
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [targetSweepAmount, setTargetSweepAmount] = useState(0);
  const [inputAmount, setInputAmount] = useState<BigNumber>(BigNumber(0));
  const [message, setMessage] = useState("");
  const messageList = useRef<HTMLDivElement>(null);

  const { account } = useContext(GlobalContext);

  useEffect(() => {
    messageList?.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [message]);

  useEffect(() => {
    if (!account) return
    const getList = async () => {
      setIsLoadingList(true);
      const totalListingAmount: number = await sendScript(
        getMarketListingAmountScripts()
      );
      appendMessage(`⌛️ Loading List for you...`);
      const itemRequests = await fetchAllList(
        totalListingAmount,
        1000,
        getMarketListingItemScripts(),
        []
      );

      const inscriptionReqeuestResults = await Promise.all(itemRequests);
      const inscriptionResults = inscriptionReqeuestResults.flat();

      const displayModels: InscriptionDisplayModel[] = inscriptionResults.filter(value => value.seller != account).map(
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
      setDisplayModels(displayModels);
      appendMessage(`Total listing items: ${displayModels.length} (already excluded your listing items)`);
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
      setIsLoadingList(false);
    };
    getList();

    const storedSweepBotInfo = getStoredSweepBotInfo();
    if (storedSweepBotInfo) {
      setBotAccount(storedSweepBotInfo.account);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  const getStoredSweepBotInfo = useCallback((): BotInfo | null => {
    const rawItem = localStorage.getItem(SWEEP_BOT_INFO);
    if (rawItem) {
      return JSON.parse(rawItem);
    }
    return null;
  }, []);

  useEffect(() => {
    if (waitingForTx) return;
    const updateBotFlowBalance = async () => {
      if (!botAccount) return;
      const newAccountFlowBalance: string = await sendScript(
        getBalanceScript(),
        (arg, t) => [arg(botAccount, t.Address)]
      );
      setBotAccountFlowBalance(BigNumber(newAccountFlowBalance));
    };
    updateBotFlowBalance();
  }, [botAccount, waitingForTx, isWithdrawing]);

  const createBotAccountAndDeposit = useCallback(async () => {
    try {
      if (!account) return;
      const checkResult = await checkBalance(account, priceSummary);
      if (!checkResult.enough) {
        return;
      }
      setWaitingForCreate(true);
      const keyPair = generateKeyPair();
      console.log(`💥 keyPair: ${JSON.stringify(keyPair, null, "  ")}`);
      const txData = await sendTransaction(
        getCreateAccountAndDepositScript(),
        (arg, types) => [
          arg(keyPair.publicKey, types.String),
          arg(
            priceSummary.multipliedBy(BigNumber(1.1)).toString(),
            types.UFix64
          ),
        ]
      );
      console.log(`💥 txData: ${JSON.stringify(txData, null, "  ")}`);
      const createdEvent = txData.events.find(
        (event) => event.type === ACCOUNT_CREATED_EVENT
      );
      setWaitingForCreate(false);
      if (createdEvent) {
        const newAccount = createdEvent.data.address;
        setStoredSweepBotInfo(newAccount, keyPair.privateKey);
        setBotAccount(newAccount);
        appendMessage(`✅ Your bot account has been created successfully!`);
        appendMessage(`👉 address: ${newAccount}`);
        appendMessage(`🙈 private key: ${keyPair.privateKey}`);
        appendMessage(`📝 Please keep this info somewhere else safely!`);
      } else {
        throw new Error(`Can't find create account event!`);
      }
    } catch (error: any) {
      setErrorMessage(error.message);
      setWaitingForCreate(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, priceSummary]);

  const depositFlow = useCallback(
    async (amount: BigNumber, address: string): Promise<boolean> => {
      try {
        if (!account) return false;
        setWaitingForTx(true);
        const txData = await sendTransaction(
          getTransferFlowScript(),
          (arg, types) => [
            arg(amount.toString(), types.UFix64),
            arg(address, types.Address),
          ]
        );
        console.log(`💥 txData: ${JSON.stringify(txData, null, "  ")}`);
        const depositEvent = txData.events.find(
          (event) =>
            event.type === FLOW_DEPOSIT_EVENT && event.data.to === address
        );
        setWaitingForTx(false);
        if (
          depositEvent &&
          BigNumber(depositEvent.data.amount).isEqualTo(amount)
        ) {
          appendMessage(
            `✅ Successfully deposit ${amount.toString()} Flow to ${address}`
          );
          appendMessage(`Now you can hit the Purchase button to continue.`);
          return true;
        } else {
          setErrorMessage(`deposit failed`);
          return false;
        }
      } catch (error: any) {
        setErrorMessage(error.message);
        setWaitingForTx(false);
        return false;
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [account]
  );

  const checkBalance = useCallback(
    async (
      address: string,
      amount: BigNumber
    ): Promise<{ flowBalance: BigNumber; enough: boolean }> => {
      const accountFlowBalance: string = await sendScript(
        getBalanceScript(),
        (arg, t) => [arg(address, t.Address)]
      );
      const balance = BigNumber(accountFlowBalance);
      const enough = balance.isGreaterThanOrEqualTo(amount);
      setIsFlowBalanceEnough(enough);
      if (address === account) {
        appendMessage(`💰 Your account balance is ${balance.toString()}`);
      } else {
        appendMessage(`💰 Your bot account balance is ${balance.toString()}`);
      }
      return {
        flowBalance: balance,
        enough: balance.isGreaterThanOrEqualTo(amount),
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [account]
  );

  const handleAutoPurchase = useCallback(async () => {
    const storedSweepBotInfo = getStoredSweepBotInfo();
    if (!storedSweepBotInfo) {
      appendMessage(`Bot account not found! Please create one first!`);
      return;
    }
    try {
      const targetAmount = targetSweepAmount;
      if (targetSweepAmount == 0) return;
      setWaitingForTx(true);
      let currentBoughtAmount = 0;
      const baseLimit = purchaseLimit;
      let limit = Math.min(targetAmount - currentBoughtAmount, baseLimit);
      let startOffset = 0;
      let endOffset = Math.min(startOffset + limit - 1, targetSweepAmount - 1);

      while (currentBoughtAmount < targetSweepAmount) {
        appendMessage(`Sending transactions...`);
        console.log(
          `💥 startOffset: ${JSON.stringify(startOffset, null, "  ")}`
        );
        console.log(`💥 endOffset: ${JSON.stringify(endOffset, null, "  ")}`);
        const selectedModels: InscriptionDisplayModel[] = displayModels.slice(
          startOffset,
          endOffset + 1
        );
        const purchaseModels = convertToPurchaseModel(selectedModels);

        console.log(
          `💥 purchaseModels: ${JSON.stringify(purchaseModels, null, "  ")}`
        );

        const txData = await sendTransactionWithLocalWallet(
          storedSweepBotInfo.account,
          storedSweepBotInfo.privateKey,
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
            return event.type === PURCHASE_SUCCEED_EVENT;
          })
          .map((event) => event.data.listingResourceID);

        const successAmount = successListingId.length;
        const failedAmount = selectedModels.length - successAmount;
        currentBoughtAmount += successAmount;

        console.log("txData :", txData);
        appendMessage(`tx id: ${txData.hash}`);
        appendMessage(
          `Purchase ${successAmount} successfully and ${failedAmount} failed`
        );
        appendMessage(`Current purchased amount: ${currentBoughtAmount}`);
        limit = Math.min(targetAmount - currentBoughtAmount, baseLimit);
        startOffset = endOffset + 1;
        endOffset = startOffset + limit - 1;
      }

      appendMessage(`✅ Purchase finished!`);
      handleWithdrawAssets();
    } catch (err: any) {
      setErrorMessage(err.message);
    }
    setWaitingForTx(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayModels, botAccount, targetSweepAmount]);

  const handleWithdrawAssets = useCallback(async () => {
    try {
      const storedSweepBotInfo = getStoredSweepBotInfo();
      if (!storedSweepBotInfo) {
        appendMessage(`Bot account not found! Please create one first!`);
        return;
      }
      if (!account) {
        appendMessage(`Please connect wallet first!`);
        return;
      }
      setWaitingForTx(true);
      setIsWithdrawing(true);
      appendMessage(
        `⌛️ Withdrawing all purchased inscriptions and Flow back to your account...`
      );

      const inscriptionIds: string[] = await sendScript(
        getInscriptionIdsScript(),
        (arg, types) => [arg(storedSweepBotInfo.account, types.Address)]
      );
      const totalDepositItems: string[] = [];
      const limit = 100;
      const maxIndex = Math.max(inscriptionIds.length - 1, 0);
      let startIndex = 0;
      let endIndex = Math.min(startIndex + limit - 1, maxIndex);
      let lastTxData;
      while (
        startIndex < inscriptionIds.length ||
        (startIndex === inscriptionIds.length && inscriptionIds.length === 0)
      ) {
        const selectedIds = inscriptionIds.slice(startIndex, endIndex + 1);

        const txData = await sendTransactionWithLocalWallet(
          storedSweepBotInfo.account,
          storedSweepBotInfo.privateKey,
          getTransferInscriptionAndFlowScript(),
          (arg, types) => [
            arg(account, types.Address),
            arg(selectedIds, types.Array(types.UInt64)),
          ]
        );
        lastTxData = txData;
        console.log("txData :", txData);
        appendMessage(`tx id: ${txData.hash}`);
        const depositItems: string[] = txData.events
          .filter((event) => {
            return (
              event.type === INSCRIPTION_DEPOSIT_EVENT &&
              event.data.to === account
            );
          })
          .map((event) => event.data.listingResourceID);
        appendMessage(
          `👍 Successfully deposited ${depositItems.length} in this tx`
        );
        totalDepositItems.push(...depositItems);
        startIndex = endIndex + 1;
        endIndex = Math.min(startIndex + limit - 1, maxIndex);
      }
      const depositFlowAmount: BigNumber = lastTxData.events
        .filter((event) => {
          return event.type === FLOW_DEPOSIT_EVENT && event.data.to === account;
        })
        .reduce((pre: BigNumber, currentEvent) => {
          return pre.plus(BigNumber(currentEvent.data.amount));
        }, BigNumber(0));

      appendMessage(
        `✅ Total deposited ${totalDepositItems.length} inscriptions back to your account ${account}`
      );
      appendMessage(
        `✅ Total deposited ${depositFlowAmount.toString()} Flow back to your account ${account}`
      );
      appendMessage(`✅ All finished!`);
    } catch (err: any) {
      console.log(`💥 err: ${JSON.stringify(err, null, "  ")}`);
      setErrorMessage(err.message);
    }
    setWaitingForTx(false);
    setIsWithdrawing(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const inputValue = event.target.value;
    if (inputValue === SelectType.Amount) {
      // setTargetSweepAmount();
      setSelectType(SelectType.Amount);
    } else {
      setSelectType(SelectType.Price);
    }
  };

  useEffect(() => {
    onAmountChange(BigNumber(inputAmount));
  }, [selectType, inputAmount]);

  const onAmountChange = useCallback(
    async (input: BigNumber) => {
      let selectedInscriptions: InscriptionDisplayModel[] = [];
      if (selectType === SelectType.Amount) {
        setTargetSweepAmount(input.toNumber());
        selectedInscriptions = displayModels.slice(0, input.toNumber());
      } else {
        selectedInscriptions = displayModels.filter((model) =>
          model.salePrice.isLessThanOrEqualTo(input)
        );
        setTargetSweepAmount(selectedInscriptions.length);
      }
      const sum = selectedInscriptions.reduce(
        (pre: BigNumber, current: InscriptionDisplayModel) => {
          return pre.plus(current.salePrice);
        },
        BigNumber(0)
      );
      setPriceSummary(sum);
      const recommendedAmount = sum.multipliedBy(BigNumber(1.1));
      if (botAccount) {
        const checkedResult = await checkBalance(botAccount, recommendedAmount);
        if (checkedResult.enough) {
          appendMessage(`✅ Your bot account's Flow is enough.`);
        } else {
          appendMessage(
            `🥵 Your bot account's Flow is not enough. Please deposit ${recommendedAmount.minus(
              checkedResult.flowBalance
            )} more flow to your bot account.`
          );
        }
        setBotAccountFlowBalance(checkedResult.flowBalance);
        setIsBotFlowBalanceEnough(checkedResult.enough);
      } else {
        if (account) {
          const checkedResult = await checkBalance(
            account,
            sum.multipliedBy(BigNumber(1.1))
          );
          if (checkedResult.enough) {
            appendMessage(
              `✅ Your account has ${checkedResult.flowBalance.toString()} Flow, and it's enough.`
            );
          } else {
            appendMessage(
              `🥵 Your account has ${checkedResult.flowBalance.toString()} Flow, and it's not enough.`
            );
          }
          setIsFlowBalanceEnough(checkedResult.enough);
        }
      }
    },
    [account, botAccount, selectType, displayModels]
  );

  const handleSweepAmountChange = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const inputValue = event.target.value;
    const bigNumberValue = BigNumber(inputValue);
    console.log(`💥 inputValue: ${JSON.stringify(inputValue, null, "  ")}`);
    if (inputValue && bigNumberValue) {
      console.log(
        `💥 bigNumberValue: ${JSON.stringify(bigNumberValue, null, "  ")}`
      );
      setInputAmount(bigNumberValue)
      onAmountChange(bigNumberValue);
    }
  };

  const appendMessage = useCallback((message: string) => {
    setMessage((pre) => pre + `\n` + message);
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
          rowGap="10px"
          alignItems="center"
          justifyContent="start"
          p="space.m"
          maxWidth="520px"
          margin="0 auto"
        >
          <Text fontSize="size.heading.5" lineHeight="22px">
            Auto Sweep
          </Text>
          <Text fontSize="size.body.5" mb="space.l" lineHeight="22px">
            Let the bot do the job for you!
          </Text>
          <Flex width="100%" columnGap="space.s">
            <Input
              isDisabled={!account || isLoadingList}
              placeholder={"How many do you want?"}
              onChange={handleSweepAmountChange}
            />
            <Select
              width="50%"
              defaultValue={SelectType.Amount}
              onChange={handleSelectChange}
            >
              <option value="Amount">Amount</option>
              <option value="Price">Price</option>
            </Select>
          </Flex>
          {!!targetSweepAmount && (
            <Text fontSize="size.heading.5" mb="space.l" lineHeight="22px">
              You attempt to buy {targetSweepAmount} inscriptions and it will
              cost at least {priceSummary.toString()} Flow, so we recommend you
              to deposit at least{" "}
              {priceSummary.multipliedBy(BigNumber(1.1)).toString()} for the
              buffer
            </Text>
          )}
          {botAccount ? (
            <>
              <Text fontSize="size.body.4" mb="space.l" lineHeight="22px">
                You bot account is {botAccount}, and it has{" "}
                {botAccountFlowBalance.toString()} Flow right now.
              </Text>
              {!isBotFlowBalanceEnough && (
                <Button
                  m="20px"
                  colorScheme="blue"
                  onClick={async () => {
                    setErrorMessage("");
                    const success = await depositFlow(
                      priceSummary
                        .multipliedBy(1.1)
                        .minus(botAccountFlowBalance),
                      botAccount
                    );
                    setIsBotFlowBalanceEnough(success);
                    logAutoSweepDeposit(targetSweepAmount.toString());
                  }}
                  isDisabled={!account || isLoadingList || !targetSweepAmount}
                  isLoading={waitingForTx}
                  width={["100%", "auto"]}
                >
                  {account ? `Deposit to bot account` : `Connect Wallet First`}
                </Button>
              )}
            </>
          ) : (
            <Button
              m="20px"
              colorScheme="blue"
              onClick={() => {
                setErrorMessage("");
                logCreateBot(targetSweepAmount.toString());
                createBotAccountAndDeposit();
              }}
              isDisabled={
                !account ||
                isLoadingList ||
                !targetSweepAmount ||
                !isFlowBalanceEnough
              }
              isLoading={waitingForCreate}
              width={["100%", "auto"]}
            >
              {account
                ? `Create a bot account and deposit`
                : `Connect Wallet First!`}
            </Button>
          )}
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            mb="space.l"
          >
            <Button
              m="20px"
              colorScheme="blue"
              onClick={() => {
                setErrorMessage("");
                handleAutoPurchase();
                logAutoSweepingPurchase(targetSweepAmount.toString());
              }}
              isDisabled={
                isLoadingList || !targetSweepAmount || !isBotFlowBalanceEnough
              }
              isLoading={isLoadingList || waitingForTx}
              width={["100%", "auto"]}
            >
              Purchase
            </Button>
            <Box display="flex" alignItems="center">
              <InfoOutlineIcon m="space.s" />
              <Text fontSize="size.body.5" lineHeight="22px">
                use your bot account to sweep til amount matchs unless error
                occurred.
              </Text>
            </Box>
          </Box>
          {botAccount && (
            <Box display="flex" flexDirection="column" alignItems="center">
              <Button
                m="10px"
                colorScheme="blue"
                onClick={() => {
                  setErrorMessage("");
                  handleWithdrawAssets();
                  logAutoSweepWithdraw();
                }}
                isLoading={waitingForTx || isWithdrawing}
                width={["100%", "auto"]}
              >
                Withdraw
              </Button>
              <Box display="flex" alignItems="center">
                <InfoOutlineIcon m="space.s" />
                <Text fontSize="size.body.5" lineHeight="22px">
                  withdraw all inscriptions and Flow back to your wallet.
                </Text>
              </Box>
            </Box>
          )}
          {errorMessage && (
            <Card
              p="16px"
              bg="red.200"
              mt="space.l"
              maxW="90%"
              overflowY="auto"
            >
              <Text color="red.500" whiteSpace="pre-line">
                {errorMessage}
              </Text>
            </Card>
          )}
        </Flex>
        <Card
          w="50%"
          h="90%"
          p="16px"
          bg="gray.300"
          mt="space.l"
          overflowY="auto"
        >
          <Text color="blue.500" whiteSpace="pre-line" ref={messageList}>
            {message}
          </Text>
        </Card>
      </Flex>
    </Box>
  );
}
