import { useState, useContext, useEffect } from 'react'
import { Icon, Flex, useToast, Text, Box, Card, Divider } from '@chakra-ui/react'
import Button from 'src/components/Button'
import StepInput from 'src/components/StepInput'
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

const JsonDisplay = ({ data }) => {
  const formattedJson = JSON.stringify(data, null, 2);

  return (
    <pre>
      <code>
        {formattedJson}
      </code>
    </pre>
  );
}

export default function Mint() {
  const [waitingForTx, setWaitingForTx] = useState(false)
  const [mintedInscription, setMintedInscription] = useState<Metadata | null>(null)
  const toast = useToast()

  const { account } = useContext(GlobalContext)
  const [amount, setAmount] = useState(0)
  console.log('amount :', amount);

  const onInputChange = (value) => {
    setAmount(value)
  }

  useEffect(() => {
    setMintedInscription(null)
  }, [account])

  const onClickMint = async () => {
    setWaitingForTx(true)
    try {
      const txData = await sendTransaction(getMintScripts(), (arg, t) => [
        arg(amount, t.UInt64),
      ])
      const mintedId = getMintedId(txData)

      const metaData: Metadata[] = await sendScript(getMetaDataListScripts(), (arg, t) => [
        arg(account, t.Address)
      ])
      console.log('txData :', txData);
      console.log('mintedId :', mintedId);
      console.log('metaData :', metaData);
      const sortedMetadata = sortMetaDataById(metaData || [])

      setMintedInscription(sortedMetadata[sortedMetadata.length - 1])

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
    } catch (err) {
      console.log('err :', err);
    }
    setWaitingForTx(false)

  }

  const inscriptionData = {
    "p": "frc-20", "op": "free-mint", "tick": "ff", "amt": amount.toString()
  }

  return (
    <Box mt="75px" minH="calc(100vh - 75px)" pt="40px" px="16px">
      <Text fontSize="size.heading.3" mb="space.l" lineHeight="22px">
        Mint Your First Inscription on Flow
      </Text>

      <Card variant="darkCard" mb="space.2xl" >
        <JsonDisplay data={inscriptionData} />
      </Card>

      <StepInput onChange={onInputChange} mb="space.l" />

      <Button isDisabled={!(amount > 0)} w="100%" onClick={onClickMint} isLoading={waitingForTx}>
        Mint
      </Button>


      {
        mintedInscription && (<>
          <Divider mt="space.3xl" mb="space.3xl" /> <Box>
            <Text fontSize="size.heading.3">
              Minted Inscription
            </Text>
            <Card p="16px" bg="gray.200"
              mt="space.l"
            >
              {mintedInscription && <JsonDisplay data={JSON.parse(mintedInscription.inscription)} />}
            </Card>
          </Box></>)
      }
    </Box >
  )
}