import { useState } from 'react'
import { Button, Box, Card } from '@chakra-ui/react'
import StepInput from 'src/components/StepInput'

const inscriptionData = {
  "p": "brc-20",
  "op": "mint",
  "tick": "ordi",
  "amt": "1"
};

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
  // const formattedJson = JSON.stringify(inscriptionData, null, 2);
  const [amount, setAmount] = useState(0)
  console.log('amount :', amount);

  const onInputChange = (value) => {
    setAmount(value)
  }
  return (
    <Box mt="75px" minH="calc(100vh - 75px)" pt="20px">
      <Card variant="darkCard" mb="space.2xl" >
        <JsonDisplay data={inscriptionData} />
      </Card>

      <StepInput onChange={onInputChange} mb="space.l" />

      <Button w="100%">
        Mint
      </Button>

    </Box >
  )
}