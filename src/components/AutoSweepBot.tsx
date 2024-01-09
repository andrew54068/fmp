import BigNumber from "bignumber.js";
import {
  useState,
  useContext,
  useCallback,
  ChangeEvent,
  useEffect,
} from "react";
import { GlobalContext } from "src/context/global";
import {
  Card,
  Text,
  Flex,
  Box,
  InputGroup,
  Input,
  InputRightAddon,
} from "@chakra-ui/react";
import Button from "src/components/Button";
import { sendScript } from "src/services/fcl/send-script";
import {
  getBalanceScript,
  getBatchPurchaseScripts,
  getCreateAccountAndDepositScript,
  getMarketListingAmountScripts,
  getMarketListingItemScripts,
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
import { SWEEP_BOT_INFO } from "src/constants";
import { InfoOutlineIcon } from "@chakra-ui/icons";

type BotInfo = {
  account: string;
  privateKey: string;
};

const setStoredSweepBotInfo = (account: string, privateKey: string) => {
  const jsonString = JSON.stringify({
    account,
    privateKey,
  });
  localStorage.setItem(SWEEP_BOT_INFO, jsonString);
};

export default function AutoSweepBot() {
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [waitingForTx, setWaitingForTx] = useState(false);
  const [waitingForCreate, setWaitingForCreate] = useState(false);
  const [botAccount, setBotAccount] = useState<string | null>(null);
  const [botAccountFlowBalance, setBotAccountFlowBalance] = useState(
    BigNumber(0)
  );
  const [isFlowBalanceEnough, setIsFlowBalanceEnough] = useState(false);
  const [priceSummary, setPriceSummary] = useState<BigNumber>(BigNumber(0));
  const [displayModels, setDisplayModels] = useState<InscriptionDisplayModel[]>(
    []
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [targetSweepAmount, setTargetSweepAmount] = useState(0);
  const [message, setMessage] = useState("");
  const { account } = useContext(GlobalContext);

  useEffect(() => {
    const getList = async () => {
      setIsLoadingList(true);
      const totalListingAmount: number = await sendScript(
        getMarketListingAmountScripts()
      );
      appendMessage(`Loading List for you...`);
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
            inscription: value.inscription,
            seller: value.seller,
            salePrice: new BigNumber(value.salePrice),
            timestamp: value.timestamp,
          };
        }
      );
      setDisplayModels(displayModels);
      appendMessage(`Total listing items: ${displayModels.length}`);
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

    // localStorage.removeItem(SWEEP_BOT_INFO);

    // setStoredSweepBotInfo(
    //   "0xf68e4a3487fe1cd0",
    //   "f39ac1d16761cb2d735b6c8a59f3c3e9886a50519d000ee59e952cec0d5c60d3"
    // );

    const storedSweepBotInfo = getStoredSweepBotInfo();
    if (storedSweepBotInfo) {
      setBotAccount(storedSweepBotInfo.account);
    }
  }, []);

  const getStoredSweepBotInfo = useCallback((): BotInfo | null => {
    const rawItem = localStorage.getItem(SWEEP_BOT_INFO);
    if (rawItem) {
      return JSON.parse(rawItem);
    }
    return null;
  }, []);

  useEffect(() => {
    const updateBotFlowBalance = async () => {
      if (!botAccount) return;
      const newAccountFlowBalance: string = await sendScript(
        getBalanceScript(),
        (arg, t) => [arg(botAccount, t.Address)]
      );
      setBotAccountFlowBalance(BigNumber(newAccountFlowBalance));
    };
    updateBotFlowBalance();
  }, [botAccount]);

  const createBotAccountAndDeposit = useCallback(async () => {
    try {
      if (!account) return;
      const isEnough = await checkBalance(account, priceSummary);
      if (!isEnough) {
        return;
      }
      setWaitingForCreate(true);
      const keyPair = generateKeyPair();
      console.log(`💥 keyPair: ${JSON.stringify(keyPair, null, "  ")}`);
      const txData = await sendTransaction(
        getCreateAccountAndDepositScript(),
        (arg, types) => [
          arg(keyPair.publicKey, types.String),
          arg(priceSummary.toString(), types.UFix64),
        ]
      );
      console.log(`💥 txData: ${JSON.stringify(txData, null, "  ")}`);
      const createdEvent = txData.events.find(
        (event) => event.type === "flow.AccountCreated"
      );
      setWaitingForCreate(false);
      if (createdEvent) {
        const newAccount = createdEvent.data.address;
        setStoredSweepBotInfo(newAccount, keyPair.privateKey);
        setBotAccount(newAccount);
        appendMessage(`👉 address: ${newAccount}`);
        appendMessage(`🙈 private key: ${newAccount}`);
        appendMessage(`Please keep this info safely!`);
      } else {
        throw new Error(`Can't find create account event!`);
      }
    } catch (error: any) {
      setErrorMessage(error.message);
      setWaitingForCreate(false);
    }
  }, [account, priceSummary]);

  const checkBalance = useCallback(
    async (address: string, amount: BigNumber) => {
      const accountFlowBalance: string = await sendScript(
        getBalanceScript(),
        (arg, t) => [arg(address, t.Address)]
      );
      const balance = BigNumber(accountFlowBalance);
      const enough = balance.isGreaterThanOrEqualTo(amount);
      setIsFlowBalanceEnough(enough);
      appendMessage(
        `Your balance is ${balance.toString()} and it's ` +
          (enough
            ? `enough ✅, proceeding...`
            : `not enough ❌, please deposit more flow to this account ${address}`)
      );
      return balance.isGreaterThanOrEqualTo(amount);
    },
    []
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
      let limit = 15;
      let startOffset = 0;
      const maxOffset = targetAmount - 1;
      let endOffset = Math.min(startOffset + limit - 1, maxOffset);

      while (startOffset <= maxOffset) {
        limit = Math.min(targetAmount - currentBoughtAmount, limit);
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
                types.Struct("A.88dd257fcf26d3cc.ListingUtils.PurchaseModel", [
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
              event.type === "A.4eb8a10cb9f87357.NFTStorefront.ListingCompleted"
            );
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
        startOffset = endOffset + 1;
        endOffset = Math.min(startOffset + limit - 1, maxOffset);
      }

      appendMessage(`✅ All finished!`);
    } catch (err: any) {
      setErrorMessage(err.message);
      throw err;
    }
    setWaitingForTx(false);
  }, [displayModels, botAccount, targetSweepAmount]);

  const handleWithdrawAssets = useCallback(async () => {
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

    const txData = await sendTransactionWithLocalWallet(
      storedSweepBotInfo.account,
      storedSweepBotInfo.privateKey,
      getTransferInscriptionAndFlowScript(),
      (arg, types) => [arg(account, types.Address)]
    );

    console.log("txData :", txData);
    appendMessage(`tx id: ${txData.hash}`);
    appendMessage(`✅ All finished!`);

    setWaitingForTx(false);
  }, [account]);

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
      setTargetSweepAmount(bigNumberValue.toNumber());
      const selectedInscriptions = displayModels.slice(
        0,
        bigNumberValue.toNumber() - 1
      );
      const sum = selectedInscriptions.reduce(
        (pre: BigNumber, current: InscriptionDisplayModel) => {
          return pre.plus(current.salePrice);
        },
        BigNumber(0)
      );
      setPriceSummary(sum);
      if (botAccount) {
        const isBotAccountEnough = await checkBalance(
          botAccount,
          sum.multipliedBy(BigNumber(1.1))
        );
        if (isBotAccountEnough) {
          appendMessage(`✅ Your bot account's Flow is enough.`);
        } else {
          appendMessage(`🥵 Your bot account's Flow is not enough.`);
        }
      } else {
        if (account) {
          const isBotAccountEnough = await checkBalance(
            account,
            sum.multipliedBy(BigNumber(1.1))
          );
          if (isBotAccountEnough) {
            appendMessage(`✅ Your account's Flow is enough.`);
          } else {
            appendMessage(`🥵 Your account's Flow is not enough.`);
          }
        }
      }
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
          maxWidth="420px"
          margin="0 auto"
        >
          <Text fontSize="size.heading.5" lineHeight="22px">
            Auto Sweep
          </Text>
          <Text fontSize="size.body.5" mb="space.l" lineHeight="22px">
            Let the bot do the job for you!
          </Text>
          <InputGroup>
            <Input
              isDisabled={!account || isLoadingList}
              placeholder={"How many do you want?"}
              onChange={handleSweepAmountChange}
            ></Input>
            <InputRightAddon bg="gray.700">Amount</InputRightAddon>
          </InputGroup>
          {!!targetSweepAmount && (
            <Text fontSize="size.heading.5" mb="space.l" lineHeight="22px">
              You attempt to buy {targetSweepAmount} inscriptions and it will
              cost at least {priceSummary.toString()} Flow, so we recommend you
              to deposit at least {priceSummary.multipliedBy(1.1).toString()}{" "}
              for the buffer
            </Text>
          )}
          {botAccount ? (
            <Text fontSize="size.body.4" mb="space.l" lineHeight="22px">
              You bot account is {botAccount}, and it has{" "}
              {botAccountFlowBalance.toString()} Flow right now.
            </Text>
          ) : (
            <Button
              m="20px"
              colorScheme="blue"
              onClick={() => {
                setErrorMessage("");
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
              }}
              isDisabled={
                isLoadingList || !targetSweepAmount || !isFlowBalanceEnough
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
                occur.
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
                }}
                isLoading={waitingForTx}
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
          <Text color="blue.500" whiteSpace="pre-line">
            {message}
          </Text>
        </Card>
      </Flex>
    </Box>
  );
}
