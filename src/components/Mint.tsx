import { useState, useContext, useEffect, useCallback } from 'react'
import { Icon, Flex, useToast, Text, Box, Card, Divider, Spinner } from '@chakra-ui/react'
import Button from 'src/components/Button'
import { WarningIcon, SmallCloseIcon } from "@chakra-ui/icons";
import { Link } from "react-router-dom";
import { GlobalContext } from 'src/context/global'
import getMintedId from 'src/utils/getMintedId'
import { sendTransaction } from 'src/services/fcl/send-transaction';
import { sendScript } from 'src/services/fcl/send-script';
import { Metadata } from 'src/types'
import { FLOW_SCAN_URL } from 'src/constants'
import sortMetaDataById from 'src/utils/sortMetaDataById'
import { getMintScripts, getMetaDataListScripts } from 'src/utils/getScripts'
import JsonDisplay from 'src/components/JsonDisplay'
import InscriptionsList from 'src/components/InscriptionsList';
import { getProgressScript } from 'src/utils/getScripts';
import Progress from 'src/components/Progress';
import { logClickMintButton, logMintError, logFinishMinting } from 'src/services/Amplitude/log'

const MINT_AMOUNT = 1000

export default function Mint() {
  const [waitingForTx, setWaitingForTx] = useState(false)
  const [updatingInscriptionList, setUpdatingInscriptionList] = useState(false)
  const [updatingProgress, setUpdatingProgress] = useState(false)
  const [progressData, setProgressData] = useState(['0', '0'])
  const [errorMessage, setErrorMessage] = useState('')
  const [mintedInscriptionList, setMintedInscriptionList] = useState<Metadata[] | []>([])
  const toast = useToast()

  const { account } = useContext(GlobalContext)

  const clearErrorMessage = () => {
    setErrorMessage('')
  }

  const updateProgress = useCallback(async () => {
    setUpdatingProgress(true)
    try {
      const progressData: string[] = await sendScript(getProgressScript())
      setProgressData(progressData || [0, 0])
    } catch {
      console.log('error');
    }
    setUpdatingProgress(false)
  }, [])

  const updateMintedInscriptionList = useCallback(async () => {
    setUpdatingInscriptionList(true)
    const metaData: Metadata[] = await sendScript(getMetaDataListScripts(), (arg, t) => [
      arg(account, t.Address)
    ])

    const sortedMetadata = sortMetaDataById(metaData || [])

    setMintedInscriptionList(sortedMetadata)
    setUpdatingInscriptionList(false)
  }, [account])

  useEffect(() => {
    setMintedInscriptionList([])
    clearErrorMessage()
    updateProgress();
    if (account) {
      updateMintedInscriptionList()
    }
  }, [account, updateMintedInscriptionList, updateProgress])

  const onClickMint = useCallback(async () => {
    logClickMintButton(account || '')
    setWaitingForTx(true)
    clearErrorMessage()
    try {
      const txData = await sendTransaction(getMintScripts(), (arg, t) => [
        arg(MINT_AMOUNT, t.UInt64),
      ])
      const mintedId = getMintedId(txData)

      await updateMintedInscriptionList()
      await updateProgress()

      console.log('txData :', txData);
      console.log('mintedId :', mintedId);

      logFinishMinting()
      toast({
        status: "success",
        position: "top",
        duration: null,
        isClosable: true,
        containerStyle: {
          marginTop: "20px",
        },
        render: () => (
          <Flex alignItems="center" bg="green.500" color="white" padding="20px" borderRadius="12px">
            <Link to={FLOW_SCAN_URL + txData.hash} target="_blank" style={{ textDecoration: "underline" }}>
              <Icon as={WarningIcon} mr="8px" />
              Inscription minted successfully!!
            </Link>
            <Box onClick={() => toast.closeAll()} ml="8px" cursor="pointer" p="4px">
              <SmallCloseIcon />
            </Box>
          </Flex>
        ),
      });
    } catch (err: any) {
      setErrorMessage(err.message);
      logMintError()
    }
    setWaitingForTx(false)

  }, [account, toast, updateMintedInscriptionList, updateProgress])

  const inscriptionData = {
    "p": "frc-20", "op": "free-mint", "tick": "ff", "amt": MINT_AMOUNT.toString()
  }

  return (
    <Box mt="75px" minH="calc(100vh - 75px)" py="40px" px="16px">
      <Text fontSize="size.heading.3" mb="space.l" lineHeight="22px">
        Mint Your First Inscription on Flow
      </Text>
      <Progress isLoading={updatingProgress} progressData={progressData} />

      <Card variant="darkCard" mb="space.2xl" >
        <JsonDisplay data={inscriptionData} />
      </Card>

      <Button isDisabled={!(MINT_AMOUNT > 0)} w="100%" onClick={onClickMint} isLoading={waitingForTx}>
        Mint
      </Button>

      {errorMessage && <Card p="16px" bg="red.200" mt="space.l">
        <Text color="red.500">{errorMessage}</Text>
      </Card>
      }
      {
        mintedInscriptionList.length > 0 && (<>
          <Divider mt="space.3xl" mb="space.3xl" />
          {!updatingInscriptionList ? <InscriptionsList inscriptionList={mintedInscriptionList} /> : <Flex
            justifyContent="center" alignItems="center" minH="30vh">
            <Spinner size="lg" />
          </Flex>
          }
        </>)
      }


    </Box >
  )
}