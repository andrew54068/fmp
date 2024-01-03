import { useState, useContext, useEffect, useCallback } from 'react'
import { Flex, Text, Box, Card, Divider, Spinner } from '@chakra-ui/react'
import Button from 'src/components/Button'
import { useNavigate } from "react-router-dom";
import { GlobalContext } from 'src/context/global'
import { sendScript } from 'src/services/fcl/send-script';
import { Metadata } from 'src/types'
import sortMetaDataById from 'src/utils/sortMetaDataById'
import { getMetaDataListScripts } from 'src/utils/getScripts'
import JsonDisplay from 'src/components/JsonDisplay'
import InscriptionsList from 'src/components/InscriptionsList';
import { getProgressScript } from 'src/utils/getScripts';
import Progress from 'src/components/Progress';

const MINT_AMOUNT = 1000

export default function Mint() {
  const [updatingInscriptionList, setUpdatingInscriptionList] = useState(false)
  const [updatingProgress, setUpdatingProgress] = useState(false)
  const [progressData, setProgressData] = useState(['0', '0'])
  const [errorMessage, setErrorMessage] = useState('')
  const [mintedInscriptionList, setMintedInscriptionList] = useState<Metadata[] | []>([])
  const navigate = useNavigate();

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

  const onClickRouteToMarketplace = () => {
    navigate("/marketplace");
  }

  const inscriptionData = {
    "p": "frc-20", "op": "mint", "tick": "ff", "amt": MINT_AMOUNT.toString()
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

      <Button w="100%" onClick={onClickRouteToMarketplace}>
        Get One From Our Marketplace!
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