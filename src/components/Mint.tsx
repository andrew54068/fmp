import { useState, useContext } from 'react'
//useToast
import { Box, Card } from '@chakra-ui/react'
import Button from 'src/components/Button'
import StepInput from 'src/components/StepInput'
import { GlobalContext } from 'src/context/global'
import getMintedId from 'src/utils/getMintedId'
import { sendTransaction } from 'src/services/fcl/send-transaction';
import { sendScript } from 'src/services/fcl/send-script';
import mintScript from '../../cadence/transactions/mint.cdc?raw';
import getMetaDataScript from '../../cadence/scripts/get_nft_metadata.cdc?raw';


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
  // const toast = useToast()
  console.log('waitingForTx :', waitingForTx);
  const { account } = useContext(GlobalContext)
  const [amount, setAmount] = useState(0)
  console.log('amount :', amount);

  const onInputChange = (value) => {
    setAmount(value)
  }

  // const getMetaData = async () => {
  //   const metaData = await sendScript(getMetaDataScript, (arg, t) => [
  //     arg(account, t.Address),
  //   ]);
  //   console.log('metaData :', metaData);
  // }

  const onClickMint = async () => {
    setWaitingForTx(true)
    try {
      const txId = await sendTransaction(mintScript, (arg, t) => [
        arg(amount, t.UInt64),
      ])
      const mintedId = getMintedId(txId)
      console.log('txId :', txId);
      console.log('mintedId :', mintedId);
    } catch (err) {
      console.log('err :', err);
    }
    setWaitingForTx(false)

  }

  const inscriptionData = {
    "p": "frc-20", "op": "free-mint", "tick": "ff", "amt": amount.toString()
  }

  return (
    <Box mt="75px" minH="calc(100vh - 75px)" pt="40px" >
      <Card variant="darkCard" mb="space.2xl" >
        <JsonDisplay data={inscriptionData} />
      </Card>

      <StepInput onChange={onInputChange} mb="space.l" />

      <Button w="100%" onClick={onClickMint} isLoading={waitingForTx}>
        Mint
      </Button>

    </Box >
  )
}